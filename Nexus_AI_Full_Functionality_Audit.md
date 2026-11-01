# 🔬 Nexus-AI — Full Functionality Audit Report
**Project:** Automated Campus Research Project Lifecycle Management & Collaborative IP Filing Dashboard  
**Team:** Rahul K · Manoranjan M · Karthikeyan J V  
**Analysis Date:** 2026-11-01  
**⏱️ Time taken for this analysis:** `29 seconds`  
**Codebase Size:** 11,793 lines of code (Frontend: 8,170 LOC · Backend: 3,623 LOC)

---

## 🗂️ Architecture Overview

```
Nexus-AI
├── Frontend  →  React 19 + Vite + React Router + Axios (Port 3000)
└── Backend   →  Spring Boot 3 + JPA/Hibernate + MySQL + Ollama AI (Port 8080)
```

---

## 👥 Roles & Authentication

| Role | Access | Default Landing |
|------|--------|----------------|
| `STUDENT` | Project submission, catalogue, mini-project tracker | `/student/catalogue` |
| `FACULTY` | Weekly review panel, project approval, review submission | `/faculty/weekly-review` |
| `ACADEMIC_OFFICE` | Catalogue management, mentor allocation, helpdesk | `/academics/catalogue` |
| `IP_CELL` | IP filing tracker, patent examination queue | `/ip-tracker` |
| `ADMIN` | All routes across all roles | `/faculty/weekly-review` |

### Auth Features
- ✅ Login with email + password (BCrypt hashed)
- ✅ User registration with role assignment
- ✅ React `AuthContext` — JWT-like session stored in state/localStorage
- ✅ `ProtectedRoute` component wrapping all routes with `allowedRoles` guard
- ✅ Role-based redirect on unauthorised access
- ✅ Quick-fill demo personas on Login page (Student / Faculty / Academic Office / IP Cell)
- ✅ List all users: `GET /api/auth/users`
- ✅ List faculty mentors: `GET /api/auth/mentors`

---

## 📄 Module 1: Project Proposal (Research Submission)

### Backend APIs — `/api/projects`
| Method | Endpoint | Function |
|--------|----------|----------|
| `GET` | `/api/projects?role=&userId=` | Fetch projects (filtered by role/user) |
| `GET` | `/api/projects/{id}` | Get single project by ID |
| `POST` | `/api/projects` | Submit new research proposal (multipart with PDF upload) |
| `POST` | `/api/projects/{id}/ai-insights` | Trigger AI re-analysis on a project |

### Project Lifecycle Statuses
`SUBMITTED` → `UNDER_REVIEW` → `REVISION_REQUESTED` → `APPROVED` → `READY_FOR_IP` → `IP_FILED` → `REJECTED`

### Data Model Fields
Title, Abstract (TEXT), Department, Domain, Status, Student ID/Name, Faculty ID/Name, File (PDF upload), AI Summary, Extracted Text, Milestone, Timestamps

### Frontend (Student Dashboard)
- ✅ Submit research proposal form with title, abstract, department, domain
- ✅ Optional PDF proposal file upload
- ✅ Status badge display per proposal (colour-coded)
- ✅ Metrics cards: Total Proposals, Under Review, Approved, IP Eligible
- ✅ Project table with status filter
- ✅ Detailed project card with milestone timeline
- ✅ AI Insights panel (rendered Markdown from Ollama)
- ✅ Review history per project

---

## 🤖 Module 2: AI Engine (Ollama / Llama 3.2)

### Backend Service — `OllamaSummarizationService`
- ✅ Connects to **Ollama** at `http://localhost:11434` (configurable via `ollama.base-url`)
- ✅ Uses model **`llama3.2`** (configurable via `ollama.model`)
- ✅ **System persona prompt**: "Principal Patent Examiner and Senior Academic Research Fellow"
- ✅ **5-section structured output** (Markdown):
  1. 🎯 Core Problem & Novel Hypothesis
  2. 🔬 Methodology & Technical Innovations
  3. 💡 Patentability & Novelty Index (% score + IP classification)
  4. ⚠️ Prior-Art Vulnerabilities & Deficiencies
  5. 🚀 Commercialization & Translation Trajectory
- ✅ Max input: **10,000 characters** (PDF extracted text preferred over abstract)
- ✅ **Temperature: 0.2** (low — for factual, consistent output)
- ✅ **Timeouts**: Connect 4s, Read 45s
- ✅ **Fallback heuristic engine**: If Ollama is unreachable, a domain-aware rule-based engine generates a structured response using keyword matching on the abstract text
- ✅ PDF text extraction service (`PdfTextExtractionService`) to feed full document text to AI
- ✅ `AiInsightsCard` frontend component renders the AI Markdown output

---

## 🏛️ Module 3: Academic Office

### Catalogue Management — `/api/project-catalogue`
| Method | Endpoint | Function |
|--------|----------|----------|
| `GET` | `/api/project-catalogue?domain=` | Get all catalogue items (filter by domain) |
| `POST` | `/api/project-catalogue` | Add new catalogue item |
| `POST` | `/api/project-catalogue/selections` | Student selects a project from catalogue |
| `GET` | `/api/project-catalogue/selections` | Get all student selections |
| `GET` | `/api/project-catalogue/selections/student?studentId=` | Get a specific student's selection |
| `POST` | `/api/project-catalogue/selections/{id}/allocate-mentor` | Assign faculty mentor to a selection |
| `GET` | `/api/project-catalogue/ai-recommend-mentor?domain=` | AI-powered mentor recommendation |

### Catalogue Item Data Model
Code, Title, Description, Department, Domain, Tech Stack, PDF URL

### Frontend — Academic Catalogue Manager
- ✅ Full catalogue table with code, title, domain, tech stack columns
- ✅ Add new catalogue item form (modal)
- ✅ Filter catalogue by domain
- ✅ View all student selections with confirmation status
- ✅ Mentor allocation from Academic Office UI
- ✅ Confirm student-mentor pairing workflow

### Academic Mentor Allocation Page
- ✅ View all pending student project selections
- ✅ Assign faculty mentor to each student selection
- ✅ Confirmed allocation counter with stats card
- ✅ AI-powered mentor recommendation via domain analysis

### Academic Helpdesk — `/api/academic-queries`
| Method | Endpoint | Function |
|--------|----------|----------|
| `POST` | `/api/academic-queries` | Student submits a query |
| `GET` | `/api/academic-queries?status=` | Office views all queries |
| `GET` | `/api/academic-queries/user?userId=` | Get queries by student |
| `POST` | `/api/academic-queries/{id}/reply` | Academic office replies |

- ✅ Student can submit helpdesk queries (category, subject, message)
- ✅ Academic office views and replies to queries
- ✅ Query status: Open / Resolved
- ✅ `SubmitQueryModal` component on student-facing pages

---

## 🧑‍🏫 Module 4: Faculty Review

### Faculty Review Panel — `/api/reviews` & `/api/projects`
| Method | Endpoint | Function |
|--------|----------|----------|
| `POST` | `/api/reviews` | Submit review decision on a project |
| `GET` | `/api/projects/{id}/reviews` | Get all reviews for a project |

### Faculty Review Actions
- ✅ View all submitted student proposals
- ✅ Approve / Reject / Request Revision (status transitions)
- ✅ Write structured feedback with rating
- ✅ Review history timeline per project
- ✅ View AI insights alongside the project

### Review Data Model
Project ID, Reviewer ID/Name, Status Decision, Comments, Rating, Timestamp

### Faculty Weekly Review Page
- ✅ List of assigned student projects (mini-projects)
- ✅ Student progress cards with % completion
- ✅ Weekly log viewer (work summary, challenges, hours, prototype link)
- ✅ Per-log review with status and feedback
- ✅ Status badges: Approved, In Evaluation, Patent Eligible, Filed, Granted, etc.

---

## 📚 Module 5: Mini Project Tracker (S5 Academic Projects)

### Backend APIs — `/api/mini-projects`
| Method | Endpoint | Function |
|--------|----------|----------|
| `POST` | `/api/mini-projects` | Create mini project |
| `GET` | `/api/mini-projects?studentId=&facultyId=` | Fetch projects (filtered) |
| `GET` | `/api/mini-projects/{id}` | Get single mini project |
| `GET` | `/api/mini-projects/{id}/weekly-logs` | Get weekly logs for a project |
| `POST` | `/api/mini-projects/{id}/weekly-logs` | Student submits weekly log |
| `POST` | `/api/mini-projects/weekly-logs/{logId}/review` | Faculty reviews a weekly log |
| `PUT` | `/api/mini-projects/{id}/deliverables` | Update GitHub/Demo/Figma/Video links |

### Weekly Log Fields
Week Number, Work Summary, Challenges Faced, Hours Spent, Prototype Link

### Mini Project Deliverables
GitHub URL, Demo URL, Figma URL, Video URL

### Frontend — Mini Project Tracker
- ✅ Display assigned mini-project with mentor, domain, tech stack
- ✅ Submit weekly log (form with all fields)
- ✅ Progress tracker showing `overallProgress %`
- ✅ Weekly log timeline with faculty feedback per log
- ✅ Deliverables panel (links to GitHub, demo, Figma, video)
- ✅ Update deliverables form (modal)
- ✅ Milestone timeline component

---

## 📝 Module 6: Project Catalogue Selection (Student)

### Frontend — Project Catalogue Selection
- ✅ Browse full S5 project catalogue by domain
- ✅ Select a project from the catalogue
- ✅ View selected project status (Pending Mentor / Confirmed)
- ✅ View assigned faculty mentor after allocation
- ✅ Filter catalogue by domain tab
- ✅ Catalogue table: code, title, description, dept, domain, tech stack

---

## 🧾 Module 7: IP Filing Tracker

### Backend APIs — `/api/ip-filings`
| Method | Endpoint | Function |
|--------|----------|----------|
| `GET` | `/api/ip-filings` | Get all IP filings |
| `GET` | `/api/ip-filings/{id}` | Get single IP filing |
| `GET` | `/api/ip-filings/stats` | Get IP statistics summary |
| `POST` | `/api/ip-filings` | Create new IP filing record |
| `PUT` | `/api/ip-filings/{id}` | Update IP filing |
| `DELETE` | `/api/ip-filings/{id}` | Delete IP filing |
| `POST` | `/api/ip-filings/{id}/generate-claims` | AI-generate patent claims for a filing |
| `GET` | `/api/ip-filings/{id}/claims` | Get existing patent claims |
| `POST` | `/api/ip-filings/project/{projectId}/generate-claims` | Generate claims from a project |
| `POST` | `/api/ip-filings/draft-claims` | Draft patent claims from custom input |

### IP Filing Data Model
Project ID/Title, Student Name, IP Type (Patent/Copyright/Trade Secret/Industrial Design), Application No, Filing Status (Drafted→Filed→Under Examination→Granted→Rejected), Filing Date, Inventors, Notes

### IP Stats Response
- Total filings count
- Count by status
- Count by IP type

### Frontend — IP Filing Tracker (Multi-role)
- ✅ **Stats Dashboard**: Total filings, Drafted, Filed, Under Examination, Granted cards
- ✅ **IP Filing Table**: All filings with status badges and type indicators
- ✅ **Record New IP Filing** modal (for IP Cell staff)
- ✅ **Edit Filing** — update status, application number, notes
- ✅ **Delete Filing** with confirmation
- ✅ **IP Type filter** tabs (All / Patent / Copyright / Trade Secret)
- ✅ **Status-based** colour-coded badges
- ✅ View integrated with Student, Faculty, and IP Cell roles (same route, role-aware data)

---

## 🔬 Module 8: AI Patent Claims Studio

### Backend — `PatentClaimsService`
- ✅ **Generate from IP Filing**: Uses project abstract + domain + dept to build full patent claims spec
- ✅ **Generate from Project**: Direct project-to-claims pipeline
- ✅ **Custom draft**: Free-form title/domain/abstract → claims generation
- ✅ **Structured output** (PatentClaimsDto):
  - Application number, IP type, filing ID
  - Title, domain, department
  - Independent Claims (Claim 1, 2, 3…)
  - Dependent Claims
  - Prior Art Collision Analysis (novelty risk flags)
  - Abstract for filing

### Frontend — `PatentClaimsModal`
- ✅ Multi-tab modal (Claims / Prior Art / Abstract / Export)
- ✅ Formatted claims display with numbered claim rendering
- ✅ Prior-art collision analysis section
- ✅ Patent abstract view for filing submission
- ✅ Generate/regenerate button
- ✅ Available from IP Filing Tracker and IP Examination Queue

---

## 🔍 Module 9: IP Cell Examination Queue

### Frontend — `IpExaminationQueue` (IP Cell role only)
- ✅ **Tabbed examination workflow**: Active Examination / Pending Filing / Archived
- ✅ Full filing detail panel: inventors, domain, dates, application number
- ✅ **Status progression controls**: Move through examination stages
- ✅ **AI Patent Claims** generation and view per filing
- ✅ **Project proposal cross-reference** panel
- ✅ Progress indicator showing examination completion %
- ✅ Notes/remarks field for IP Cell examiner
- ✅ Document viewer link (PDF proposals)

---

## 🔔 Module 10: Notifications System

### Backend APIs — `/api/notifications`
| Method | Endpoint | Function |
|--------|----------|----------|
| `GET` | `/api/notifications?userId=` | Get all notifications for user |
| `GET` | `/api/notifications/unread-count?userId=` | Get unread count badge |
| `PUT` | `/api/notifications/{id}/read` | Mark single notification as read |
| `PUT` | `/api/notifications/read-all?userId=` | Mark all as read |

### Frontend — `NotificationDropdown`
- ✅ Bell icon in Navbar with unread count badge
- ✅ Dropdown list of notifications
- ✅ Mark individual / all as read
- ✅ Timestamp display per notification

---

## 📁 Module 11: File/Document Management

### Backend — `FileStorageService` + `DocumentController`
- ✅ Upload PDF proposal files (multipart form data)
- ✅ Store files on server filesystem (under `/uploads/`)
- ✅ Serve uploaded files via `GET /uploads/{fileName}`
- ✅ PDF text extraction for AI analysis (`PdfTextExtractionService`)
- ✅ `ProposalDocument` entity tracks file metadata

---

## 🗄️ Database Schema (JPA Entities)

| Entity | Key Fields |
|--------|-----------|
| `User` | id, email, password (BCrypt), role, fullName, department |
| `Project` | id, title, abstractText, domain, dept, status, studentId, facultyId, summary, extractedText, fileUrl |
| `Review` | id, projectId, reviewerId, status, comments, rating, timestamp |
| `IpFiling` | id, projectId, ipType, filingStatus, applicationNo, inventors, filingDate |
| `MiniProject` | id, title, domain, techStack, studentId, facultyId, overallProgress, deliverables |
| `WeeklyLog` | id, miniProjectId, weekNumber, workSummary, challenges, hoursSpent, prototypeLink, facultyFeedback |
| `ProjectCatalogue` | id, code, title, description, dept, domain, techStack, pdfUrl |
| `ProjectSelection` | id, studentId, catalogueItemId, facultyId, status (Pending/Confirmed) |
| `AcademicQuery` | id, senderId, category, subject, message, replyMessage, status |
| `Notification` | id, userId, message, isRead, createdAt |
| `MilestoneHistory` | id, projectId, milestoneName, completedAt |
| `ProposalDocument` | id, projectId, fileName, fileUrl, uploadedAt |

---

## 🛡️ Security & Infrastructure

- ✅ Spring Security with CORS configured (all origins, all methods)
- ✅ Stateless sessions (no server-side session state)
- ✅ BCrypt password hashing
- ✅ `DataInitializer` seeds the database with demo users + sample data on startup
- ✅ Health check endpoint: `GET /health`
- ✅ Docker-ready (Dockerfile present)
- ✅ Render/Railway deployment configs (`render.yaml`)
- ✅ Vite dev proxy config (`vite.config.js`) → proxies `/api` to backend

---

## 🔗 Frontend Route Map

| Route | Component | Roles |
|-------|-----------|-------|
| `/login` | `LoginPage` | Public |
| `/student/catalogue` | `ProjectCatalogueSelection` | STUDENT, ADMIN |
| `/student/dashboard` | `StudentDashboard` | STUDENT, ADMIN |
| `/student/mini-project` | `MiniProjectTracker` | STUDENT, ADMIN |
| `/faculty/weekly-review` | `FacultyWeeklyReview` | FACULTY, ADMIN |
| `/faculty/dashboard` | `FacultyReviewPanel` | FACULTY, IP_CELL, ADMIN |
| `/academics/catalogue` | `AcademicCatalogueManager` | ACADEMIC_OFFICE, ADMIN |
| `/academics/mentor-allocation` | `AcademicMentorAllocation` | ACADEMIC_OFFICE, ADMIN |
| `/academics/helpdesk` | `AcademicHelpdesk` | ACADEMIC_OFFICE, ADMIN |
| `/ip-tracker` | `IpFilingTracker` | STUDENT, FACULTY, IP_CELL, ADMIN |
| `/ip-cell/examination` | `IpExaminationQueue` | IP_CELL, ADMIN |

---

## 📊 Summary Statistics

| Metric | Value |
|--------|-------|
| Total LOC | **11,793** |
| Frontend (React JSX/CSS) | **8,170 lines** across 26 files |
| Backend (Java) | **3,623 lines** across 59 files |
| REST API Endpoints | **30+ endpoints** across 10 controllers |
| Database Tables | **12 JPA entities** |
| User Roles | **5 roles** (STUDENT, FACULTY, ACADEMIC_OFFICE, IP_CELL, ADMIN) |
| Frontend Routes | **11 protected routes** |
| AI Integrations | **2** (Ollama Summarization + Patent Claims generation) |
| ⏱️ Full Analysis Time | **29 seconds** |
