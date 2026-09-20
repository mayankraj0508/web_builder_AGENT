import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
let s3Client = null;
export function getS3Client() {
  if (s3Client) return s3Client;
  const endpoint = process.env.AWS_ENDPOINT_URL || "http://localhost:4566";
  const region = process.env.AWS_REGION || "us-east-1";
  // AWS Open-Source LocalStack / Mock credentials (no cloud key required)
  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  };
  s3Client = new S3Client({
    region,
    endpoint,
    credentials,
    forcePathStyle: true, // Required for local open-source S3 emulators
  });
  return s3Client;
}
/**
 * Upload/Archive sandbox files using local AWS open-source S3 tooling
 */
export async function uploadSandboxToS3({ sandboxId, localDirPath }) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME || "webai-local-sandboxes";
  const client = getS3Client();
  const uploadedFiles = [];
  async function walkAndUpload(currentPath, s3Prefix) {
    if (!fs.existsSync(currentPath)) return;
    const items = fs.readdirSync(currentPath);
    for (const item of items) {
      if (item === "node_modules" || item === ".git" || item === "dist") continue;
      const fullPath = path.join(currentPath, item);
      const s3Key = `${s3Prefix}/${item}`;
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        await walkAndUpload(fullPath, s3Key);
      } else {
        const fileContent = fs.readFileSync(fullPath);
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
          Body: fileContent,
        });
        try {
          await client.send(command);
          uploadedFiles.push(s3Key);
        } catch (e) {
          // Fallback gracefully for local dev
        }
      }
    }
  }
  try {
    console.log(`📦 Archiving sandbox ${sandboxId} using AWS Open-Source S3 module...`);
    await walkAndUpload(localDirPath, `sandboxes/${sandboxId}`);
    return { success: true, count: uploadedFiles.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
