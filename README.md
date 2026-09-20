# 🤖 WebAI — Autonomous Multi-Agent Software Development System

> **An end-to-end, multi-agent AI software engineering platform powered by LangGraph, Google Gemini 3, AWS Open-Source SDKs, Express REST/WebSockets, and a Vite + React Mission Control Dashboard.**

WebAI transforms high-level prompts into fully realized, multi-tier software applications. It manages the complete development lifecycle: clarifying ambiguities via human-in-the-loop interactions, generating technical specs, designing system blueprints, planning tasks, writing production code, executing tests in isolated sandboxes, and running self-healing debugging loops.

---

## 🌟 Key Features & Capabilities

- **🤖 Multi-Agent Autonomous Pipeline**:
  - **PM Agent**: Refines requirements, identifies ambiguities, and interacts with users via Human-in-the-Loop.
  - **Architect Agent**: Generates system blueprints, directory structures, and database schemas.
  - **Blueprint Validator**: Validates architectural consistency and file boundaries before execution.
  - **Planner Agent**: Generates dependency-ordered task breakdown lists.
  - **Coder Agent**: Writes clean, modular ES module code across backend and frontend layers.
  - **Reviewer Agent**: Conducts automated code quality and security reviews.
  - **Executor & Debugger Agents**: Executes tests in isolated sandboxes and performs self-healing bug fixes.

- **⚡ Modern AI Model Integration**:
  - Powered by **Google Gemini 3** (`gemini-3.6-flash`, `gemini-3.5-flash-lite`).
  - Automatic exponential backoff, rate limit handling, and model fallback.
  - Native **AWS Open-Source SDK** integration (`@aws-sdk/client-bedrock-runtime`, `@aws-sdk/client-s3`) with LocalStack support for local open-source execution.

- **📊 Mission Control Dashboard**:
  - Full-stack web interface built with **Vite, React 18, Zustand, and Tailwind CSS**.
  - **Real-Time Streaming**: WebSocket event stream (`ws://localhost:3000/ws`) for node execution, agent logs, and live code preview.
  - **Token & Cost Tracking**: Live budget consumption indicators and token usage analytics.

- **🐳 Dockerized Sandbox Execution**:
  - Automatically provisions isolated sandbox workspaces under `sandboxes/`.
  - Configures PostgreSQL, Node.js API, and Nginx containers with automated database migrations on boot.
  - State persistence backed by Redis (`aidev-redis`) or in-memory fallback checkpointer (`MemorySaver`).

---

## 🏗️ System Architecture & Workflow Graph

```text
                   ┌───────────────────────────────────────┐
                   │                 START                 │
                   └──────────────────┬────────────────────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                 ┌──────────►│     pmAgent     │
                 │           └────────┬────────┘
                 │                    │ (ambiguous)
                 │                    ▼
                 │           ┌─────────────────┐
                 └───────────┤   humanInput    │
                             └─────────────────┘
                                      │ (spec ready)
                                      ▼
                             ┌─────────────────┐
                             │  architectAgent │
                             └────────┬────────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                             │blueprintValidator│
                             └────────┬────────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                             │  plannerAgent   │
                             └────────┬────────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                             │  setupSandbox   │
                             └────────┬────────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                             │ selectNextTask  │◄─────────────────┐
                             └────────┬────────┘                  │
                                      │                           │
                                      ▼                           │
                             ┌─────────────────┐                  │
                             │   coderAgent    │                  │
                             └────────┬────────┘                  │
                                      │                           │
                                      ▼                           │
                             ┌─────────────────┐                  │
                             │  reviewerAgent  │                  │
                             └────────┬────────┘                  │
                                      │                           │
                                      ▼                           │
                             ┌─────────────────┐                  │
                             │  executorAgent  │                  │
                             └────────┬────────┘                  │
                                      │                           │
                        ┌─────────────┴─────────────┐             │
                        │                           │             │
                (test passed)                (test failed)        │
                        │                           │             │
                        ▼                           ▼             │
             ┌─────────────────────┐     ┌─────────────────────┐  │
             │ assembleEntryPoints │     │    debuggerAgent    │──┘
             └──────────┬──────────┘     └─────────────────────┘
                        │
                        ▼
             ┌─────────────────────┐
             │    presentToUser    │
             └─────────────────────┘
```

---

## 🛠️ Technology Stack

- **AI Runtimes**: Google Gemini 3 (`@google/genai`), AWS Open-Source SDK (`@aws-sdk/client-bedrock-runtime`, `@aws-sdk/client-s3`)
- **State Machine**: LangGraph (`@langchain/langgraph`, `@langchain/langgraph-checkpoint-redis`)
- **Backend API**: Node.js, Express, WebSockets (`ws`), dotenv, cors
- **Frontend UI**: React 18, Vite, Tailwind CSS, Zustand, Lucide React
- **Infrastructure**: Docker, Docker Compose, Redis, Nginx Alpine, PostgreSQL 16

---

## 🚀 Environment Setup & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Docker Desktop**: Recommended for Redis checkpoint persistence and sandbox container execution

### 2. Install Dependencies

```bash
# Install root backend dependencies
npm install

# Install dashboard frontend dependencies
cd dashboard && npm install && cd ..
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.6-flash

REDIS_URL=redis://localhost:6379
SERVER_PORT=3000
FRONTEND_URL=http://localhost:5173
TOKEN_BUDGET=2.0

# AWS Open-Source Stack (Local Integration)
AWS_REGION=us-east-1
AWS_ENDPOINT_URL=http://localhost:4566
AWS_S3_BUCKET_NAME=webai-local-sandboxes
```

---

## 💻 Running WebAI

### Option A: Web Mission Control Dashboard (Recommended)
Start the Express backend server and Vite React frontend concurrently:

```bash
npm run dev
```
- **Web Dashboard UI**: Navigate to `http://localhost:5173`
- **Backend API**: Running on `http://localhost:3000`

### Option B: Terminal CLI Mode
Run the multi-agent pipeline directly in your terminal:

```bash
npm start
```

---

## 🧪 Running Tests

WebAI contains automated integration test suites for core agents and pipeline nodes:

```bash
# Run all mock integration tests
npm run test:all:mock

# Test specific individual modules
npm run test:graph
npm run test:pm
npm run test:architect
npm run test:planner
npm run test:validator
npm run test:sandbox
npm run test:devloop
```

---

## 📡 API & WebSocket Specifications

### REST API Endpoints (`server/routes/projects.js`)
- `POST /api/projects`: Start a new multi-agent project run.
- `GET /api/projects`: List active and historical project runs.
- `GET /api/projects/:id`: Fetch project checkpoint state.
- `POST /api/projects/:id/resume`: Resume execution after human input.
- `POST /api/projects/:id/cancel`: Cancel an active run.

### WebSocket Protocol (`server/ws/handler.js`)
- **Client → Server**:
  - `{ type: "human_response", data: { answers: [...] } }`: Resolves pending clarification questions.
  - `{ type: "cancel" }`: Aborts the active pipeline run.
- **Server → Client**:
  - `{ type: "state_update" }`: Pushes active node updates and state snapshots.
  - `{ type: "log" }`: Streams real-time agent output and log lines.
  - `{ type: "human_input_request" }`: Triggers human-in-the-loop prompt modal in UI.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for details.
