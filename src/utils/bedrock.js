import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
let bedrockClient = null;
export function getBedrockClient() {
  if (bedrockClient) return bedrockClient;
  const region = process.env.AWS_REGION || "us-east-1";
  const credentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN || undefined,
      }
    : undefined;
  bedrockClient = new BedrockRuntimeClient({ region, credentials });
  return bedrockClient;
}
export async function callBedrock({
  systemPrompt,
  userPrompt,
  agentName = "unknown",
  currentCost = 0,
  tokenBudget = 2.0,
  model = null,
  maxTokens = 4096,
}) {
  const client = getBedrockClient();
  const modelId = model || process.env.AWS_BEDROCK_MODEL || "anthropic.claude-3-5-sonnet-20240620-v1:0";
  if (currentCost >= tokenBudget) {
    throw new Error(
      `TOKEN_BUDGET_EXCEEDED: $${currentCost.toFixed(4)} >= budget $${tokenBudget}`
    );
  }
  const fullPrompt = `IMPORTANT: Respond with ONLY valid JSON. No markdown fences, no explanation outside JSON.\n\n${userPrompt}`;
  const command = new ConverseCommand({
    modelId,
    system: [{ text: systemPrompt }],
    messages: [
      {
        role: "user",
        content: [{ text: fullPrompt }],
      },
    ],
    inferenceConfig: {
      maxTokens,
      temperature: 0.2,
    },
  });
  let response;
  try {
    response = await client.send(command);
  } catch (error) {
    console.error(`[Bedrock:${agentName}] API Call failed: ${error.message}`);
    throw error;
  }
  const outputText = response.output?.message?.content?.[0]?.text || "";
  const inputTokens = response.usage?.inputTokens || Math.ceil(fullPrompt.length / 4);
  const outputTokens = response.usage?.outputTokens || Math.ceil(outputText.length / 4);
  // Pricing estimate (Claude 3.5 Sonnet baseline)
  const cost = (inputTokens / 1_000_000) * 3.00 + (outputTokens / 1_000_000) * 15.00;
  // Extract JSON
  let cleanText = outputText.trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(?:json|JSON|js)?\s*\n?/, "").replace(/\n?\s*```\s*$/, "");
  }
  let parsed;
  try {
    parsed = JSON.parse(cleanText);
  } catch (e) {
    const firstBrace = cleanText.indexOf("{");
    const lastBrace = cleanText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      try {
        parsed = JSON.parse(cleanText.substring(firstBrace, lastBrace + 1));
      } catch (e2) {
        throw new Error(`BEDROCK_JSON_PARSE_FAILED: ${e.message}`);
      }
    } else {
      throw new Error(`BEDROCK_JSON_PARSE_FAILED: ${e.message}`);
    }
  }
  return {
    parsed,
    raw: outputText,
    tokens: { input: inputTokens, output: outputTokens, cost },
  };
}
