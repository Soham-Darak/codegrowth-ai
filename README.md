<p align="center">
  <h1 align="center">🚀 CodeGrowth AI</h1>
  <p align="center">
    <strong>AI-powered code evaluation & developer growth tracking platform for educators and students</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Status-Active-brightgreen" alt="Status" />
    <img src="https://img.shields.io/badge/Java-21-orange?logo=openjdk" alt="Java 21" />
    <img src="https://img.shields.io/badge/Spring_Boot-3.5-green?logo=springboot" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/Python-3.12-blue?logo=python" alt="Python" />
    <img src="https://img.shields.io/badge/FastAPI-0.116-009688?logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs" alt="Next.js 15" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss" alt="Tailwind" />
    <img src="https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis" alt="Redis" />
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker" alt="Docker" />
  </p>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Frontend — Next.js 15](#-frontend--nextjs-15)
- [Backend — Spring Boot 3.5](#-backend--spring-boot-35)
- [AI Engine — FastAPI](#-ai-engine--fastapi)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Docker Deployment](#-docker-deployment)
- [Security](#-security)
- [License](#-license)

---

## 🌟 Overview

**CodeGrowth AI** is a full-stack, AI-powered academic platform designed for **educators** and **students**. It goes far beyond simple auto-grading — the platform uses a **multi-agent AI architecture** to deeply analyze student code repositories, combining deterministic static analysis with local LLM inference to evaluate code quality, detect plagiarism, and track developer growth over time.

The platform enables teachers to create courses and assignments, students to connect their GitHub repositories, and the AI engine to autonomously evaluate submissions across **six quality dimensions**: Correctness, Quality, Complexity, Security, Testing, and Documentation.

### What makes it unique?

- **Hybrid Analysis**: Deterministic evidence (regex, AST parsing) combined with AI reasoning to eliminate hallucinations
- **Authenticity Scoring**: Commit-level diff analysis to detect AI-generated or plagiarized code
- **Multi-Agent Orchestration**: Specialized AI agents collaborate — Repository, Code Analysis, Evaluation — coordinated by an Orchestrator
- **Zero Data Leakage**: LLM inference runs locally via Ollama; no code is sent to external APIs
- **Growth Tracking**: Longitudinal tracking of student improvement across assignments

---

## ✨ Key Features

### 👨‍🎓 For Students

| Feature | Description |
|---------|-------------|
| **Dashboard** | Personalized overview of enrolled courses, assignments, and AI feedback |
| **GitHub Integration** | Link your GitHub account (even if you signed up with Google) and connect repositories |
| **Repository Management** | Select which repositories to share with teachers for evaluation |
| **AI Code Analysis** | Get detailed, multi-dimensional feedback on code quality with actionable suggestions |
| **Learning Goals** | Set and track personal development goals with progress indicators |
| **Submission History** | View all past evaluations with scores and AI-generated feedback |
| **AI Chat** | Interactive chat with an AI assistant for coding help and explanations |

### 👩‍🏫 For Teachers

| Feature | Description |
|---------|-------------|
| **Course Management** | Create courses with descriptions and enrollment codes |
| **Assignment Builder** | Create assignments with specific requirements the AI evaluates against |
| **Student Repository Dashboard** | Browse connected repositories across all enrolled students |
| **AI Authenticity Analysis** | Request commit-level authenticity reports to detect AI-generated submissions |
| **Analytics Dashboard** | View class-wide performance metrics and growth trends |
| **Announcements** | Post announcements visible to all enrolled students |
| **Bulk Evaluation** | Trigger AI evaluation on student submissions in batch |

### 🔐 For Administrators

| Feature | Description |
|---------|-------------|
| **Platform Health** | Monitor service health across all three backend components |
| **User Management** | View and manage all registered users with role assignments |
| **Course Oversight** | Browse all courses and enrollments platform-wide |

---

## 🏗 System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                             │
│                 Next.js 15 + React 19 + Tailwind 4               │
│             Motion animations · Three.js landing page            │
└────────────────────────┬─────────────────────────────────────────┘
                         │  HTTP (port 3000)
                         │  /api/backend/* reverse proxy
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                   BACKEND (Spring Boot 3.5)                      │
│                      Java 21 · Port 8081                         │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐               │
│  │   Auth     │  │   Course   │  │   GitHub     │               │
│  │  Module    │  │   Module   │  │   OAuth      │               │
│  │ (JWT+OAuth)│  │(CRUD+Enroll│  │  (Link+Repos)│               │
│  └─────┬──────┘  └─────┬──────┘  └──────┬───────┘               │
│        │               │                │                        │
│  ┌─────▼───────────────▼────────────────▼───────┐               │
│  │              JPA / Hibernate                  │               │
│  └─────────────┬──────────────────┬──────────────┘               │
│                │                  │                               │
│         ┌──────▼──────┐   ┌──────▼──────┐                        │
│         │ PostgreSQL  │   │    Redis     │                        │
│         │   (17)      │   │  (7-alpine)  │                        │
│         └─────────────┘   └─────────────┘                        │
└────────────────────────┬─────────────────────────────────────────┘
                         │  HTTP (port 8000)
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                  AI ENGINE (FastAPI · Python 3.12)                │
│                                                                  │
│  ┌───────────────────────────────────────────────────────┐       │
│  │              Orchestrator Agent                        │       │
│  │   Routes requests → specialized agents                │       │
│  └───┬──────────────┬────────────────────┬───────────────┘       │
│      │              │                    │                        │
│  ┌───▼────┐  ┌──────▼──────┐  ┌─────────▼─────────┐             │
│  │ Repo   │  │ Code        │  │   Evaluation      │             │
│  │ Agent  │  │ Analysis    │  │   Agent            │             │
│  │        │  │ Agent       │  │                    │             │
│  └───┬────┘  └──────┬──────┘  └─────────┬─────────┘             │
│      │              │                    │                        │
│  ┌───▼──────────────▼────────────────────▼──────────────┐        │
│  │                  Services Layer                       │        │
│  │  GitHubService · OllamaService · LLMRuntime          │        │
│  │  EvidenceValidator · CodeAnalysisService              │        │
│  │  RepositoryService                                    │        │
│  └──────────────────────────────────────┬───────────────┘        │
│                                         │                        │
│                                  ┌──────▼──────┐                 │
│                                  │   Ollama    │                 │
│                                  │  (Local LLM)│                 │
│                                  │ qwen2.5-coder│                │
│                                  └─────────────┘                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 15.5 | React framework with App Router & Server Components |
| | React | 19.1 | UI library |
| | Tailwind CSS | 4.1 | Utility-first CSS framework |
| | Motion (Framer) | 12.x | Page transitions & micro-animations |
| | Three.js / R3F | 9.x | 3D landing page visuals |
| | Lucide React | 0.468 | Icon library |
| **Backend** | Spring Boot | 3.5.5 | REST API framework |
| | Java | 21 | Language runtime (LTS) |
| | Spring Security | 6.x | Authentication & authorization |
| | Spring Data JPA | 3.x | ORM & database access |
| | Spring Data Redis | 3.x | Caching layer |
| | JJWT | 0.13 | JWT token generation & validation |
| | PostgreSQL | 17 | Primary relational database |
| | Redis | 7 | Session cache & AI response cache |
| **AI Engine** | FastAPI | 0.116 | Async Python web framework |
| | Python | 3.12 | Language runtime |
| | Pydantic | 2.11 | Data validation & serialization |
| | HTTPX | 0.28 | Async HTTP client (GitHub API, Ollama) |
| | Ollama | latest | Local LLM inference server |
| | qwen2.5-coder | 3b/7b | Code-specialized language model |
| **DevOps** | Docker Compose | — | Multi-service orchestration |

---

## 📁 Project Structure

```
codegrowth-ai/
├── frontend/                    # Next.js 15 application
│   ├── app/                     # App Router pages
│   │   ├── page.js              # Premium landing page (3D scene, animations)
│   │   ├── login/               # Login page (email + OAuth)
│   │   ├── register/            # Registration page (role selection)
│   │   ├── auth/callback/       # OAuth callback handlers (Google, GitHub)
│   │   ├── dashboard/           # Post-login router (redirects by role)
│   │   ├── student/             # Student dashboard pages
│   │   │   ├── page.js          # Student home (overview)
│   │   │   ├── courses/         # Course browsing & enrollment
│   │   │   ├── assignments/     # Assignment viewing & submission
│   │   │   ├── repositories/    # GitHub repository management
│   │   │   ├── ai/              # AI analysis & chat interface
│   │   │   ├── goals/           # Learning goals tracker
│   │   │   ├── history/         # Submission history viewer
│   │   │   └── profile/         # Student profile settings
│   │   ├── teacher/             # Teacher dashboard pages
│   │   │   ├── page.js          # Teacher home (overview)
│   │   │   ├── classes/         # Course & class management
│   │   │   ├── assignments/     # Assignment creation & grading
│   │   │   ├── repositories/    # Student repository browser
│   │   │   ├── ai/              # AI evaluation controls
│   │   │   ├── analytics/       # Class analytics dashboard
│   │   │   ├── announcements/   # Announcement management
│   │   │   └── profile/         # Teacher profile settings
│   │   ├── admin/               # Admin panel
│   │   ├── api/backend/         # Reverse proxy to Spring Boot
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── ui/                  # Reusable UI primitives (Button, Card, Input)
│   │   ├── visuals/             # Three.js 3D scene components
│   │   └── workspace/           # Layout shell (AppShell, RoleDashboard, Navbar)
│   ├── lib/
│   │   ├── api.js               # HTTP client with JWT interceptor
│   │   └── utils.js             # Utility functions (cn, etc.)
│   ├── Dockerfile               # Production container
│   └── package.json
│
├── backend/                     # Spring Boot 3.5 application
│   ├── src/main/java/com/codegrowth/backend/
│   │   ├── CodeGrowthApplication.java    # Entry point
│   │   ├── api/                          # REST controllers
│   │   │   ├── AuthController.java       # POST /api/auth/register, /login
│   │   │   ├── OAuthController.java      # GET /api/oauth/google/url, /github/url, /callback
│   │   │   ├── GitHubController.java     # GET /api/github/repos, link, connect
│   │   │   ├── StudentController.java    # Student CRUD + submissions + goals
│   │   │   ├── TeacherController.java    # Teacher CRUD + courses + assignments
│   │   │   ├── AdminController.java      # Admin endpoints + platform health
│   │   │   ├── AiController.java         # POST /api/ai/analyze (proxy to AI Engine)
│   │   │   ├── AiHistoryController.java  # GET /api/ai/history (cached results)
│   │   │   ├── HealthController.java     # GET /api/health
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── config/                       # Security, CORS, Redis config
│   │   ├── dto/                          # Data transfer objects
│   │   ├── entity/                       # JPA entities (14 tables)
│   │   │   ├── AppUser.java              # User with OAuth fields
│   │   │   ├── Role.java                 # STUDENT, TEACHER, ADMIN
│   │   │   ├── Course.java               # Course with enrollment code
│   │   │   ├── Assignment.java           # Linked to course
│   │   │   ├── Submission.java           # Student submission
│   │   │   ├── AiEvaluation.java         # Stored AI analysis result
│   │   │   ├── AiGeneration.java         # AI chat history
│   │   │   ├── ConnectedRepository.java  # GitHub repo link
│   │   │   ├── StudentProfile.java       # Bio, skills, badges
│   │   │   ├── TeacherProfile.java       # Department, specialization
│   │   │   ├── LearningGoal.java         # Tracked learning objectives
│   │   │   ├── Enrollment.java           # Course ↔ Student join
│   │   │   ├── Announcement.java         # Teacher announcements
│   │   │   └── RequirementResult.java    # Per-requirement AI verdict
│   │   ├── repository/                   # JPA repositories
│   │   ├── security/                     # JWT filter, SecurityConfig
│   │   └── service/                      # Business logic
│   │       ├── AuthService.java          # Registration, login, password hashing
│   │       ├── OAuthService.java         # Google + GitHub OAuth flows + account linking
│   │       ├── JwtService.java           # Token generation & validation
│   │       ├── AiService.java            # Proxy calls to AI Engine
│   │       ├── AiEvaluationService.java  # Persist & query AI results
│   │       ├── AiGenerationHistoryService.java
│   │       ├── CacheService.java         # Redis abstraction
│   │       ├── PlatformHealthService.java # Health check aggregation
│   │       └── RepositoryAnalysisService.java
│   ├── src/main/resources/
│   │   └── application.properties        # Config (secrets via env vars)
│   ├── Dockerfile
│   ├── pom.xml
│   └── mvnw / mvnw.cmd                  # Maven wrapper
│
├── ai-engine/                   # FastAPI Python application
│   ├── app/
│   │   ├── main.py              # FastAPI routes (analyze, evaluate, inspect, authenticity)
│   │   ├── exceptions.py        # Custom exception hierarchy
│   │   ├── agents/              # Multi-agent system
│   │   │   ├── orchestrator_agent.py   # Dynamic task routing
│   │   │   ├── repository_agent.py     # GitHub repo fetching
│   │   │   ├── code_analysis_agent.py  # Quality scoring
│   │   │   ├── evaluation_agent.py     # Assignment grading
│   │   │   ├── base_agent.py           # Abstract agent interface
│   │   │   └── agent_models.py         # Agent-specific types
│   │   ├── models/              # Pydantic data models
│   │   │   ├── repository_models.py    # Repo structure types
│   │   │   ├── code_analysis_models.py # Analysis result types
│   │   │   ├── evaluation_models.py    # Evaluation output types
│   │   │   └── evidence_models.py      # Deterministic evidence types
│   │   └── services/            # Core services
│   │       ├── github_service.py       # GitHub API client (httpx)
│   │       ├── ollama_service.py       # Ollama LLM client
│   │       ├── llm_runtime.py          # LLM abstraction layer
│   │       ├── llm_provider.py         # Provider selection
│   │       ├── repository_service.py   # Repo processing pipeline
│   │       ├── code_analysis_service.py # Static analysis engine
│   │       └── evidence_validator.py   # Deterministic validation rules
│   ├── tests/                   # pytest test suite (74 tests)
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml           # Full-stack orchestration
├── .env.example                 # Environment variable template
├── .gitignore
└── README.md                    # This file
```

---

## 🖥 Frontend — Next.js 15

### Landing Page

The landing page is a **premium, immersive experience** featuring:
- 3D animated scene built with **Three.js / React Three Fiber**
- Smooth scroll-triggered animations via **Motion (Framer Motion)**
- Role-based call-to-action (Student / Teacher)
- Feature highlights with animated icons
- Dark theme with glassmorphism effects

### Authentication

| Method | Flow |
|--------|------|
| **Email/Password** | Register → Login → JWT stored in `localStorage` |
| **Google OAuth** | Click "Continue with Google" → redirected to Google → callback → JWT |
| **GitHub OAuth** | Click "Continue with GitHub" → redirected to GitHub → callback → JWT |
| **Account Linking** | Already logged in with Google? Link your GitHub account from the dashboard |

When a student signs in with Google and later links their GitHub account (using the same email), all access is unified — repositories become visible under the student's profile.

### Role-Based Dashboards

After login, users are routed to role-specific dashboards:

- **Student Dashboard**: Courses, assignments, repositories, AI analysis, goals, history
- **Teacher Dashboard**: Classes, assignments, student repos, AI evaluations, analytics, announcements
- **Admin Dashboard**: Platform health, user management, system overview

### Key UI Components

| Component | Purpose |
|-----------|---------|
| `AppShell` | Persistent layout wrapper with sidebar navigation |
| `RoleDashboard` | Dynamic dashboard renderer based on user role |
| `CodeGrowthScene` | Three.js 3D animated background |
| `Button`, `Card`, `Input` | Design system primitives with variants |

---

## ☕ Backend — Spring Boot 3.5

### Authentication & Authorization

The backend implements a **stateless JWT authentication** system with support for three auth providers:

1. **Email/Password**: BCrypt-hashed passwords, standard JWT issuance
2. **Google OAuth 2.0**: Exchanges authorization code for Google user info, creates/links account
3. **GitHub OAuth 2.0**: Exchanges authorization code for GitHub user info, creates/links account

**Account Linking Logic** (in `OAuthService.java`):
- If a user signs in with Google and later authenticates with GitHub using the **same email**, the accounts are **automatically linked**
- The `state=link` parameter in the OAuth URL distinguishes between login and linking flows
- GitHub access tokens are persisted to enable repository browsing

### Database Schema (14 Entities)

```
AppUser ──┬── StudentProfile
          ├── TeacherProfile
          ├── ConnectedRepository (GitHub repos)
          ├── Enrollment ──── Course ──── Assignment
          ├── Submission ──── AiEvaluation ──── RequirementResult
          ├── AiGeneration (chat history)
          ├── LearningGoal
          └── Announcement
```

### Key Services

| Service | Responsibility |
|---------|---------------|
| `AuthService` | Registration, login, password validation |
| `OAuthService` | Google/GitHub OAuth code exchange, account linking, token management |
| `JwtService` | Token creation (HS256), validation, expiry management |
| `AiService` | Proxies analysis requests to the AI Engine, caches results in Redis |
| `AiEvaluationService` | Persists and retrieves AI evaluation results from PostgreSQL |
| `CacheService` | Redis-backed caching abstraction |
| `PlatformHealthService` | Aggregates health from backend, AI engine, and database |
| `RepositoryAnalysisService` | Coordinates repo analysis with the AI Engine |

### Security Configuration

- **CORS**: Configured to allow the frontend origin (`localhost:3000`)
- **Public endpoints**: `/api/auth/**`, `/api/oauth/**`, `/api/health`
- **Protected endpoints**: All others require valid JWT in `Authorization: Bearer <token>` header
- **Role-based access**: `@PreAuthorize` annotations on controller methods

---

## 🤖 AI Engine — FastAPI

### Multi-Agent Architecture

The AI Engine uses a **multi-agent orchestration pattern** where specialized agents collaborate to analyze code:

#### Orchestrator Agent
- Receives incoming HTTP requests
- Dynamically routes to the appropriate agent based on the task type
- Aggregates results from multiple agents when needed

#### Repository Agent
- Fetches repository structure and source files from GitHub via API
- Filters files by language and relevance (ignores binaries, config files, lock files)
- Safely handles private repos using access tokens
- Never executes downloaded code

#### Code Analysis Agent
- Runs **deterministic static analysis** (regex patterns, structure detection)
- Invokes the local LLM for **semantic code review**
- Scores across six dimensions:
  - **Correctness**: Does the code work as intended?
  - **Quality**: Code style, naming, organization
  - **Complexity**: Appropriate use of data structures and algorithms
  - **Security**: Hardcoded secrets, SQL injection, XSS vectors
  - **Testing**: Test coverage and quality
  - **Documentation**: Comments, docstrings, README quality

#### Evaluation Agent
- Compares repository code against **specific assignment requirements**
- Uses deterministic evidence (regex, AST) to verify each requirement
- **Conflict Resolution**: If deterministic analysis proves a requirement is NOT met, the AI score is mathematically overridden — preventing hallucinations
- Generates a final grade with per-requirement verdicts

### Evidence Validator

The `EvidenceValidator` runs fully deterministic checks before the LLM is invoked:

| Check | Method |
|-------|--------|
| Hardcoded secrets | Regex pattern matching for API keys, passwords, tokens |
| SQL injection | Detection of string concatenation in SQL queries |
| Missing imports | AST-level analysis of import statements |
| Required patterns | Configurable regex rules per assignment |
| File existence | Verify required files (README, tests, config) exist |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service health check |
| `/inspect` | POST | Fetch and display repository structure |
| `/analyze` | POST | Full code quality analysis (6 dimensions) |
| `/evaluate` | POST | Assignment-based evaluation with grading |
| `/analyze-authenticity` | POST | Commit-level authenticity scoring (plagiarism detection) |

### Authenticity Analysis

The `/analyze-authenticity` endpoint performs commit-level analysis:
1. Fetches recent commits from the repository
2. Extracts diffs for each commit
3. Analyzes coding patterns, commit frequency, and style consistency
4. Uses the LLM to score the likelihood of authentic, human-written code vs AI-generated code

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Required For |
|------|---------|-------------|
| **Node.js** | 18+ | Frontend |
| **Java** | 21 | Backend |
| **Python** | 3.12+ | AI Engine |
| **PostgreSQL** | 15+ | Database |
| **Redis** | 7+ | Caching |
| **Ollama** | latest | Local LLM inference |

### 1. Clone the Repository

```bash
git clone https://github.com/Soham-Darak/codegrowth-ai.git
cd codegrowth-ai
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your actual values (see Environment Variables section below)
```

### 3. Start Infrastructure (PostgreSQL + Redis)

```bash
# Using Docker Compose (recommended)
docker compose up -d postgres redis

# Or install locally and ensure they're running
```

### 4. Start the AI Engine

```bash
cd ai-engine
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 5. Start Ollama (for AI analysis)

```bash
ollama serve
ollama pull qwen2.5-coder:3b   # or qwen2.5-coder:7b for better quality
```

### 6. Start the Backend

```bash
cd backend
# Create backend/src/main/resources/application-local.properties with your secrets:
# codegrowth.oauth.google.client-id=YOUR_GOOGLE_CLIENT_ID
# codegrowth.oauth.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
# codegrowth.oauth.github.client-id=YOUR_GITHUB_CLIENT_ID
# codegrowth.oauth.github.client-secret=YOUR_GITHUB_CLIENT_SECRET

.\mvnw.cmd spring-boot:run     # Windows
# ./mvnw spring-boot:run       # macOS/Linux
```

### 7. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

### 8. Open the Application

Navigate to **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Environment Variables

Create a `.env` file in the project root (see `.env.example` for the template):

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_HOST` | PostgreSQL host | `localhost` |
| `POSTGRES_DB` | Database name | `codegrowth` |
| `POSTGRES_USER` | Database user | `codegrowth_user` |
| `POSTGRES_PASSWORD` | Database password | — |
| `POSTGRES_PORT` | Database port | `5432` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT signing secret (≥32 chars) | — |
| `JWT_EXPIRATION_MS` | Token expiry in milliseconds | `86400000` (24h) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | — |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | — |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID | — |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret | — |
| `GITHUB_TOKEN` | GitHub PAT for repo analysis | — |
| `AI_ENGINE_BASE_URL` | AI Engine URL | `http://localhost:8000` |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | LLM model name | `qwen2.5-coder:7b` |

> **⚠️ Security Note**: Never commit secrets. Use `application-local.properties` for Spring Boot secrets (auto-imported, gitignored) and `.env` files for Docker/Python (also gitignored).

---

## 📡 API Reference

### Authentication

```
POST /api/auth/register          # Create account (email/password)
POST /api/auth/login             # Login (returns JWT)
GET  /api/oauth/google/url       # Get Google OAuth redirect URL
GET  /api/oauth/github/url       # Get GitHub OAuth redirect URL
POST /api/oauth/google/callback  # Exchange Google auth code for JWT
POST /api/oauth/github/callback  # Exchange GitHub auth code for JWT
```

### GitHub Integration

```
GET  /api/github/repos           # List user's GitHub repositories
POST /api/github/link            # Link GitHub account to existing user
POST /api/github/connect         # Connect a specific repo for analysis
GET  /api/github/connected       # List connected repositories
```

### Student Endpoints

```
GET  /api/student/dashboard      # Dashboard overview
GET  /api/student/courses        # Enrolled courses
POST /api/student/enroll         # Enroll in a course
GET  /api/student/assignments    # View assignments
POST /api/student/submit         # Submit assignment
GET  /api/student/goals          # Learning goals
POST /api/student/goals          # Create learning goal
GET  /api/student/history        # Submission history
```

### Teacher Endpoints

```
GET  /api/teacher/dashboard      # Dashboard overview
POST /api/teacher/courses        # Create course
GET  /api/teacher/courses        # List courses
POST /api/teacher/assignments    # Create assignment
GET  /api/teacher/students       # List enrolled students
GET  /api/teacher/repositories   # Browse student repos
POST /api/teacher/announcements  # Post announcement
```

### AI Engine Endpoints

```
POST /api/ai/analyze             # Trigger code analysis
GET  /api/ai/history             # Cached analysis results
POST http://localhost:8000/inspect               # Repo structure
POST http://localhost:8000/analyze               # Full code analysis
POST http://localhost:8000/evaluate              # Assignment evaluation
POST http://localhost:8000/analyze-authenticity   # Authenticity scoring
```

### Admin & Health

```
GET  /api/health                 # Service health
GET  /api/admin/health           # Full platform health (all services)
GET  /api/admin/users            # All users
GET  /api/admin/courses          # All courses
```

---

## 🐳 Docker Deployment

The entire platform can be deployed with a single command:

```bash
docker compose up --build
```

This starts all six services:

| Service | Container | Port |
|---------|-----------|------|
| PostgreSQL 17 | `codegrowth-postgres` | 5432 |
| Redis 7 | `codegrowth-redis` | 6379 |
| Ollama | `codegrowth-ollama` | 11434 |
| AI Engine | `codegrowth-ai-engine` | 8000 |
| Backend | `codegrowth-backend` | 8081 |
| Frontend | `codegrowth-frontend` | 3000 |

Persistent volumes are created for PostgreSQL, Redis, and Ollama data.

---

## 🛡 Security

| Measure | Implementation |
|---------|---------------|
| **Password Hashing** | BCrypt (Spring Security default) |
| **Token Auth** | HS256 JWT with configurable expiry |
| **CORS** | Strict origin allowlist |
| **Secrets Management** | Environment variables only; `application-local.properties` (gitignored) |
| **Code Safety** | AI Engine never executes downloaded repository code |
| **Input Validation** | Bean Validation (Jakarta) on all DTOs |
| **SQL Injection** | JPA parameterized queries (no string concatenation) |
| **GitHub Tokens** | Stored per-user, used server-side only |
| **OAuth State** | CSRF protection via state parameter validation |

---

## 📝 License

This project is developed as an academic/research initiative.

---

<p align="center">
  <strong>CodeGrowth AI</strong> — Empowering developers through intelligent feedback 🌱
</p>
