# CodeGrowth AI

![CodeGrowth AI](https://img.shields.io/badge/Status-In%20Development-blue)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green)
![Java](https://img.shields.io/badge/Java-Spring%20Boot-red)
![Next.js](https://img.shields.io/badge/Next.js-React-black)

**CodeGrowth AI** is a state-of-the-art, AI-powered developer and student code analysis platform. It inspects GitHub repositories, runs deterministic static analysis, and combines it with advanced AI inference to evaluate assignments and score software engineering metrics.

---

## 🎯 Project Vision

The goal of CodeGrowth AI is to bridge the gap between deterministic validation and human-like reasoning. Instead of relying solely on unit tests or simple linters, the platform uses a multi-agent architecture to truly *understand* the code being submitted. 

The system validates that requirements are explicitly met (Deterministic Validation) and evaluates how well they are implemented across six dimensions: Correctness, Quality, Complexity, Security, Testing, and Documentation (AI Analysis).

## 🏗️ Architecture Overview

The platform operates across three main layers:

1. **AI Engine (Python / FastAPI)**: The core intelligence layer. It uses a multi-agent orchestration system to fetch repositories, parse ASTs, find hardcoded vulnerabilities, and run local LLMs (`qwen2.5-coder:3b` via Ollama) to score the codebase.
2. **Backend (Java / Spring Boot)**: The persistence and business logic layer. Manages student data, assignments, courses, and tracks growth over time using PostgreSQL.
3. **Frontend (JavaScript / Next.js)**: The interactive dashboard where students view their evaluations and teachers manage assignments.

### 🤖 The Agent Pipeline
- **Orchestrator Agent**: Routes incoming HTTP requests dynamically based on context (e.g., repository inspection vs. full assignment evaluation).
- **Repository Agent**: Safely fetches repository structures and source code from GitHub via API.
- **Code Analysis Agent**: Combines deterministic rules with LLM analysis to evaluate the general quality of the codebase.
- **Evaluation Agent**: Compares the repository contents against specific assignment requirements to generate a final grade and actionable feedback.

## ✅ Current Capabilities (What We Have Built)

- [x] **Secure GitHub Integration**: Dynamically fetches and filters source code from public/private repositories without executing unsafe code.
- [x] **Multi-Agent Orchestration**: Seamlessly routes tasks between the Repository, Analysis, and Evaluation agents.
- [x] **Deterministic Evidence Engine**: Uses Regex and AST parsing to reliably detect hardcoded secrets, SQL vulnerabilities, and missing requirements.
- [x] **Local LLM Integration**: Runs entirely locally via Ollama, ensuring zero data leakage and high privacy.
- [x] **Conflict Resolution**: The Evaluation Agent mathematically overrides AI hallucinations if the deterministic evidence proves a feature does not exist.

## 🚀 Roadmap (What We Are Building)

- [ ] **Phase 1**: Comprehensive Automated Test Suite for the AI Engine.
- [ ] **Phase 2**: API Error Handling & Hardening.
- [ ] **Phase 3**: Persistence Integration (Connecting the AI Engine to the Spring Boot backend).
- [ ] **Phase 4**: Frontend Dashboard Integration (Connecting Next.js to the backend).
- [ ] **Phase 5**: Authentication, User Management, and Progress Tracking.
- [ ] **Phase 6**: Dockerization & Production Deployment.

## 🛠️ Tech Stack
- **AI Engine**: Python, FastAPI, Pydantic, HTTPX, Ollama (Local LLM)
- **Backend**: Java, Spring Boot, Spring Security, PostgreSQL
- **Frontend**: Next.js, React, Tailwind CSS

## 🛡️ Security First
Repository files are treated strictly as untrusted input. The AI Engine never executes downloaded repository code, and all GitHub authentication tokens are strictly managed via environment variables.

---
*CodeGrowth AI — Empowering developers through intelligent feedback.*
