# Nexus-AI

Campus research proposal + IP-filing web app. A student submits a project (optional PDF upload), faculty records a review, and an IP Cell user tracks filings. There is **no PDF text extraction, no Ollama, and no AI summarization** in this repo.

---

## What actually works

| Area | Reality |
|---|---|
| Student project create | `POST /api/projects` multipart: title, abstract, department, domain, studentId, facultyId, optional `proposalFile`. File is copied to a local `uploads/` folder. Path is stored on `projects.file_url` / `file_name` and a `proposals` row with **version always set to 1**. |
| List / get projects | `GET /api/projects`, `GET /api/projects/{id}`. Faculty list is **all projects**, not assigned-mentor only. |
| Faculty review | `POST /api/reviews`. Status `APPROVED` / `REVISION_REQUESTED` / `READY_FOR_IP` / `UNDER_REVIEW` / `REJECTED` updates the project and appends a milestone. `READY_FOR_IP` creates a drafted `ip_filings` row if none exists. |
| Milestone history | `GET /api/projects/{id}/milestones` — append-only log. UI stepper is derived from project `status`. |
| IP tracker | `GET/POST/PUT/DELETE /api/ip-filings`, `GET /api/ip-filings/stats`. Root React app can filter type/status and export CSV **in the browser**. |
| Auth | `POST /api/auth/login`, `/register`, `GET /api/auth/users`, `/mentors`. Passwords stored **plaintext**. Login accepts hardcoded demo passwords. Token is the string `jwt-token-campus-{id}` — **not a real JWT**. Spring Security **permitAll** on every route. Frontend `ProtectedRoute` is the only “RBAC”. |
| File download | `GET /uploads/{fileName}` streams from disk as an attachment. Seeded projects point at sample URLs that are **not** shipped as files. |
| UI | Repo-root React 19 + Vite 6 (`src/`). Login, student dashboard, faculty panel, IP tracker. Login page has **Quick Demo Fill** buttons. Navbar does **not** switch personas. Mentor dropdown is two hardcoded faculty IDs. Faculty search uses `student_name` while the API returns `studentName`. |

---

## Repo layout (do not mix these up)

```
src/                    Canonical React app (Docker + `npm run dev` use this)
FrontEnd/D_C/           Older duplicate UI (no IP_CELL routing, no Vite proxy, thinner IP page)
BackEnd/src/main/java   Spring Boot 3.2.3 API (this is the backend you should run)
BackEnd/server.js       Leftover Express + mysql2 + multer API — not used by Docker
BackEnd/schema.sql      Manual MySQL script (lags JPA entities; see notes below)
```

---

## Stack

| Layer | In use |
|---|---|
| Frontend | React 19, Vite 6, axios, lucide-react, inline CSS. Inter is loaded from Google Fonts. `@mui/*` and Firebase are in `package.json` and **unused** in `src/`. |
| Backend | Java 17, Spring Boot 3.2.3, Spring Data JPA, Hibernate `ddl-auto=update`. |
| DB | MySQL 8 via Docker / `application.properties`. Profile `dev` uses **in-memory H2**, not MySQL. |
| Containers | `docker-compose.yml`: mysql, Spring Boot, Nginx-served frontend. |

---

## API map

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/login` | Email + password; ignores Spring Security |
| POST | `/api/auth/register` | Stores password as `passwordHash` without hashing |
| GET | `/api/auth/users` | Unauthenticated dump of all users |
| GET | `/api/auth/mentors` | Faculty users; **frontend never calls this** |
| GET | `/api/projects` | Optional `role`, `userId` (student filter only) |
| GET | `/api/projects/{id}` | |
| POST | `/api/projects` | Multipart create + disk store |
| POST | `/api/reviews` | Review + status/milestone (+ auto IP on `READY_FOR_IP`) |
| GET | `/api/projects/{id}/reviews` | |
| GET | `/api/projects/{id}/milestones` | |
| GET/POST | `/api/ip-filings` | |
| GET | `/api/ip-filings/{id}` | |
| GET | `/api/ip-filings/stats` | Counts by filing status |
| PUT/DELETE | `/api/ip-filings/{id}` | |
| GET | `/uploads/{fileName}` | Download stored file |

There is **no** `/api/summarize`, Ollama client, or PDF parse endpoint.

---

## Data model (JPA)

Tables Hibernate will create/update: `users`, `projects`, `proposals`, `milestones`, `reviews`, `ip_filings`.

User roles in Java: `STUDENT`, `FACULTY`, `IP_CELL`, `ADMIN`.  
`BackEnd/schema.sql` ENUM is only `STUDENT`, `FACULTY`, `ADMIN` and **does not** include `projects.file_name` / `file_url` or denormalized IP title fields. Rely on JPA `ddl-auto=update` if you use MySQL, or you will fight the SQL script.

---

## How to run

### Docker (MySQL + API + UI)

```bash
cp .env.example .env
docker-compose up -d --build
```

- UI: http://localhost:3000  
- API: http://localhost:8080  

### Local (H2, no MySQL)

```powershell
cd BackEnd
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

```powershell
npm install
npm run dev
```

Vite (root `vite.config.js`) proxies `/api` and `/uploads` to `http://localhost:8080`. Do **not** start `FrontEnd/D_C` unless you add a proxy yourself.

---

## Seeded accounts

Created by `DataInitializer` when the user table is empty (IP Cell user is also inserted if missing).

| Role | Name | Email | Password |
|---|---|---|---|
| STUDENT | Aarav Sharma | aarav.student@campus.edu | student123 |
| STUDENT | Ananya Patel | ananya.student@campus.edu | student123 |
| FACULTY | Dr. Rajesh Kumar | rajesh.faculty@campus.edu | faculty123 |
| FACULTY | Dr. Sunita Rao | sunita.faculty@campus.edu | faculty123 |
| IP_CELL | IP Cell Officer | ipcell@campus.edu | admin123 |
| ACADEMIC_OFFICE | Academic Office | academics@campus.edu | admin123 |
| ADMIN | Platform Administrator | admin@campus.edu | admin123 |

---

## Not in this codebase (despite older README / product copy)

- AI / Ollama / PDF text extraction / stored summaries  
- Strict server-side RBAC or JWT  
- Automatic document versioning  
- Navbar “demo persona switcher”  
- Faculty filters by department/domain  
- In-browser PDF preview (download-as-attachment only)  
- Mentor list loaded from the API  

Deployment notes: [DEPLOYMENT.md](./DEPLOYMENT.md).
