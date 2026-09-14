# 🤖 WebAI — Autonomous Multi-Agent Software Development System

WebAI is an end-to-end autonomous multi-agent software engineering system built with **LangGraph**, **Google Gemini**, **Express**, and a **Vite + React Mission Control Dashboard**. It takes high-level user requirements, clarifies ambiguities through human-in-the-loop interaction, generates technical specifications and multi-tier architectural blueprints, creates task execution plans, writes production code, tests execution in isolated sandboxes, and performs automated debugging loops.

---

## 🌟 Key Capabilities

- **Autonomous End-to-End Pipeline**: Transforms a single prompt into a structured project specification, architecture blueprint, source code files, and verified executable output.
- **Multi-Agent Orchestration**: Specialized agents handle product management, system architecture, blueprint validation, task planning, code generation, code review, sandbox execution, and automated debugging.
- **State Machine with LangGraph**: Built on `@langchain/langgraph` using a directed state graph with state persistence (Redis or In-Memory checkpointer).
- **Human-in-the-Loop Q&A**: Pauses execution when requirement ambiguities are detected, soliciting user input via CLI or Web UI before resuming.
- **Isolated Directory Sandbox**: Safely provisions workspaces under `sandboxes/`, writes code, executes scripts, and captures runtime outputs/logs.
- **Dual User Interfaces**:
  - **Terminal CLI**: Interactive command-line workflow (`node src/index.js`).
  - **Web Dashboard**: Full-stack Mission Control interface built with Express, WebSockets, Vite, React, and Zustand (`npm run dev`).
- **Token & Cost Tracking**: Monitors prompt and completion token usage for every Gemini API call and presents live budget reports.

---

## 🏗️ System Architecture & Workflow Graph

```
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
                             │sandboxHealthCheck│
                             └────────┬────────┘
                                      │
                                      ▼
                        ┌────────────────────────────┐
                        │   DEVELOPMENT LOOP (Tasks) │
                        └─────────────┬──────────────┘
                                      │
  ┌───────────────────────────────────┼──────────────────────────────────┐
  │                                   ▼                                  │
  │                          ┌─────────────────┐                         │
  │                          │ selectNextTask  │                         │
  │                          └────────┬────────┘                         │
  │                                   │                                  │
  │                                   ▼                                  │
  │                          ┌─────────────────┐                         │
  │                          │ contextBuilder  │                         │
  │                          └────────┬────────┘                         │
  │                                   │                                  │
  │                                   ▼                                  │
  │                          ┌─────────────────┐                         │
  │                          │   coderAgent    │                         │
  │                          └────────┬────────┘                         │
  │                                   │                                  │
  │                                   ▼                                  │
  │                          ┌─────────────────┐                         │
  │                          │  reviewerAgent  │                         │
  │                          └────────┬────────┘                         │
  │                                   │                                  │
  │                                   ▼                                  │
  │                          ┌─────────────────┐                         │
  │                          │ executorAgent   │                         │
  │                          └────────┬────────┘                         │
  │                                   │                                  │
  │                  ┌────────────────┴────────────────┐                 │
  │                  │ (Success)             (Failure) │                 │
  │                  ▼                                 ▼                 │
  │         ┌─────────────────┐               ┌─────────────────┐        │
  │         │ updateRegistry  │               │ debuggerAgent / │        │
  │         └────────┬────────┘               │  simplifyTask   │        │
  │                  │                        └────────┬────────┘        │
  │                  │                                 │                 │
  └──────────────────┴─────────────────────────────────┴─────────────────┘
                                      │ (All tasks complete)
                                      ▼
                             ┌─────────────────┐
                             │assembleEntryPoints│
                             └────────┬────────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                             │deploymentVerifier│
                             └────────┬────────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                             │  presentToUser  │
                             └────────┬────────┘
                                      │
                                      ▼
                   ┌───────────────────────────────────────┐
                   │                  END                  │
                   └───────────────────────────────────────┘
```

---

## 🧩 Agent & Node Roles

### Agents (`src/agents/`)
- **`pmAgent.js`**: Analyzes the raw prompt. Asks clarifying questions if vague or outputs a structured JSON specification.
- **`architectAgent.js`**: Generates multi-tiered technical architecture (database schemas, REST API endpoints, frontend pages, folder layout).
- **`blueprintValidator.js`**: Audits the generated architecture blueprint for consistency and schema completeness.
- **`plannerAgent.js`**: Converts the validated specification and blueprint into an ordered task execution queue.
- **`coderAgent.js`**: Reads task specs and context snippets to write production code files.
- **`reviewerAgent.js`**: Reviews written code for syntax errors, missing dependencies, or logic flaws.
- **`executorAgent.js`**: Executes generated scripts or shell commands inside the sandbox environment.
- **`debuggerAgent.js`**: Diagnoses runtime failures, analyzes error logs, and applies targeted code fixes.

### Nodes (`src/nodes/`)
- **`humanInput.js`**: Interactively prompts user in terminal or web UI during execution pauses.
- **`setupSandbox.js`**: Initializes workspace directory structure under `sandboxes/`.
- **`sandboxHealthCheck.js`**: Confirms directory permissions and execution availability.
- **`selectNextTask.js`**: Picks the next pending task from the state queue.
- **`contextBuilder.js`**: Gathers file snippets and dependencies relevant to the active task.
- **`simplifyTask.js`**: Decomposes complex failing tasks into smaller sub-tasks.
- **`updateRegistry.js`**: Registers generated module exports into state registry.
- **`snapshotManager.js`**: Saves workspace states for rollback/recovery.
- **`stateCompactor.js`**: Trims conversation and log history to optimize LLM token context windows.
- **`patternExtractor.js`**: Extracts reusable coding patterns across iterations.
- **`assembleEntryPoints.js`**: Links modular files together with main execution entry points.
- **`deploymentVerifier.js`**: Performs final health and readiness checks.
- **`presentToUser.js`**: Formats final output and metrics report for presentation.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Gemini API Key**: [Get a Gemini API Key](https://aistudio.google.com/apikey)
- **Redis (Optional)**: For persistent state checkpointer (`docker run -d -p 6379:6379 redis:latest`)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/nikhilgetitdone2027/WebAI.git
cd WebAI

# Install root dependencies
npm install

# Install dashboard dependencies
cd dashboard && npm install && cd ..
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
REDIS_URL=redis://localhost:6379
SERVER_PORT=3000
FRONTEND_URL=http://localhost:5173
TOKEN_BUDGET=2.0
```

---

## 💻 Running WebAI

### Option A: Web Mission Control Dashboard (Recommended)
Start the Express backend server and Vite React frontend concurrently:
```bash
npm run dev
```
- **Web Dashboard UI**: Open `http://localhost:5173`
- **Backend API**: Running on `http://localhost:3000`

### Option B: Terminal CLI Mode
Run the pipeline directly from your command line:
```bash
# Pass requirement directly
node src/index.js "Build a task management application with user authentication"

# Or run interactive prompt mode
npm start
```

---

## 🧪 Testing Suite

Run unit and integration test scripts to verify state graphs, agent prompts, and sandboxes:

```bash
# Test 1: Graph skeleton flow with mock nodes (No API key required)
npm run test:graph

# Test 2: PM Agent with live Gemini API
npm run test:pm

# Test 3: Architect Agent blueprint generation
npm run test:architect

# Test 4: Architecture Blueprint Validator
npm run test:validator

# Test 5: Planner Agent task decomposition
npm run test:planner

# Test 6: Sandbox manager execution & filesystem operations
npm run test:sandbox

# Test 7: Full development loop (Coder + Reviewer + Executor + Debugger)
npm run test:devloop

# Test 8: Run all mock tests sequentially
npm run test:all:mock
```

---

## 📁 Project Structure

```
WebAI/
├── src/                      # Core Multi-Agent & LangGraph Logic
│   ├── index.js              # CLI Entry Point
│   ├── agents/               # Autonomous LLM Agents (PM, Architect, Planner, Coder, etc.)
│   ├── nodes/                # Workflow Nodes & Helper Step Handlers
│   ├── config/               # LangGraph Graph Setup & State Definition
│   └── utils/                # Gemini API Wrapper, Token Tracker, Sandbox Manager, Redis
├── server/                   # Backend Server Infrastructure
│   ├── index.js              # Express REST & WebSocket Server Entry Point
│   ├── routes/               # API Routes (/api/projects)
│   ├── services/             # Graph Runner & Execution Controller
│   └── ws/                   # WebSocket Handler for Real-Time Streaming
├── dashboard/                # Frontend Mission Control Web Application
│   ├── src/                  # React Components, Hooks, State Store (Zustand)
│   ├── index.html            # Single Page Application Entry Point
│   └── vite.config.js        # Vite Build Configuration
├── tests/                    # Comprehensive Integration Test Suite
├── sandboxes/                # Dynamically Generated Workspace Environments
├── .gitignore                # Git Ignore Configuration
├── package.json              # Root Project Dependencies & Scripts
└── README.md                 # Project Documentation
```

---

## 📡 API & WebSocket Protocols

### REST Endpoints (`server/routes/projects.js`)
- `POST /api/projects`: Starts a new execution workflow with `{ requirement: string }`.
- `POST /api/projects/:id/resume`: Resumes a checkpointed project workflow.
- `GET /api/projects/:id`: Fetches current project state, logs, and token usage summary.

### WebSocket Events (`server/ws/handler.js`)
- **Client → Server**:
  - `{ type: "human_response", data: { answers: [...] } }`: Sends user answers to clear state pause.
  - `{ type: "cancel" }`: Aborts the active pipeline run.
- **Server → Client**:
  - `{ type: "state_update" }`: Pushes latest state snapshot & node progression.
  - `{ type: "log" }`: Streams live agent execution and log lines.
  - `{ type: "human_input_request" }`: Requests user input when PM agent asks clarifying questions.
