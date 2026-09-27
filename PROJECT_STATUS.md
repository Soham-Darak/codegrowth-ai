# CodeGrowth AI — Project Status

## CURRENT PHASE
Phase 5: Repository Connection Workflow + Developer Growth Loop UI

## COMPLETED PHASES
| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Repository Audit & Baseline | ✅ COMPLETED |
| 1 | AI Engine Test Suite (74 tests) | ✅ COMPLETED |
| 2 | API Error Handling & Hardening | ✅ COMPLETED |
| 3 | Backend Persistence Integration | ✅ COMPLETED |
| 4 | OAuth + Premium Landing Page | ✅ COMPLETED |

## CURRENT ARCHITECTURE

```
Frontend (Next.js 15 + Tailwind 4 + Motion)
    ↓ /api/backend proxy
Backend (Spring Boot 3.5 + PostgreSQL + Redis)
    ↓ HTTP (localhost:8000)
AI Engine (FastAPI + Pydantic)
    ↓
Agents (orchestrator → repository / code-analysis / evaluation)
    ↓
Services (GitHub API via httpx, Ollama via httpx)
```

### Frontend
- **Framework**: Next.js 15, React 19, Tailwind CSS 4, Motion (framer-motion)
- **Auth**: JWT stored in localStorage, role-based routing
- **Pages**: Login, Register, Student/Teacher/Admin dashboards with AppShell
- **API Layer**: `lib/api.js` proxies through `/api/backend/[...path]`
- **Components**: Button, Card, Input, Textarea, CodeGrowthScene (Three.js), AppShell, RoleDashboard

### Backend
- **Framework**: Spring Boot 3.5.5, Java 21
- **Auth**: JWT (JJWT 0.13), BCrypt, stateless sessions
- **Database**: PostgreSQL + Redis (caching)
- **Entities**: AppUser, Role, Course, Assignment, Enrollment, Submission, AiGeneration, AiEvaluation, RequirementResult, StudentProfile, TeacherProfile, LearningGoal, Announcement
- **Security**: SecurityConfig with JwtAuthenticationFilter, @PreAuthorize per controller

### AI Engine
- **Framework**: FastAPI, Python 3.12
- **Agents**: OrchestratorAgent → RepositoryAgent, CodeAnalysisAgent, EvaluationAgent
- **Services**: GitHubService, OllamaService, LLMRuntime
- **Models**: Pydantic with deterministic validation + AI analysis
- **Tests**: 74 tests (pytest-asyncio)

## WORKING FEATURES
- Premium Landing Page (marketing, role explanations, CTA)
- Email/password registration and login (JWT)
- OAuth Authentication (Google, GitHub) via backend provider linking
- Role-based dashboards (Student, Teacher, Admin)
- Course management (create, enroll, browse)
- Assignment creation and submission
- AI-powered code evaluation (connected to AI Engine)
- AI chat/generation with caching (Redis)
- Learning goals with progress tracking
- Announcements system
- Health monitoring endpoints

## KNOWN ISSUES
- Frontend has no repository analysis workflow yet
- No developer growth tracking visualization
- AppUser has avatarUrl but AppShell/Navbar doesn't display it yet

## NEXT PHASE
Phase 5: Repository Connection Workflow + Developer Growth Loop UI

## HOW TO RUN

### AI Engine
```bash
cd ai-engine
.venv/Scripts/activate  # or source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Backend
```bash
cd backend
# Requires: PostgreSQL running, Redis running
# Set environment variables from .env
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm run dev
```

### Tests
```bash
cd ai-engine
.venv/Scripts/python.exe -m pytest tests/ -v
```

## IMPORTANT ENVIRONMENT VARIABLES
See `.env.example` for complete list. Critical:
- `POSTGRES_*` — Database connection
- `REDIS_*` — Cache connection
- `JWT_SECRET` — Must be ≥32 chars, never commit
- `GITHUB_TOKEN` — For repository analysis (separate from OAuth)
- `OLLAMA_BASE_URL` — AI model endpoint

## LAST VERIFIED COMMIT
`863dc60` — `chore(project): checkpoint existing working implementation`
Branch: `main`
Tests: 74/74 PASSED
Push: SUCCESS to `origin/main`
