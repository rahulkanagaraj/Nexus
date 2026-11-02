# Nexus-AI – Deployment & Infrastructure Guide

**Nexus-AI** is a centralized full-stack platform to digitize and automate the entire academic research project lifecycle—from student proposal submissions and faculty evaluations to automated milestone tracking, document archiving, and collaborative IP patent filings.

---

## 🏗️ Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19 + Vite 6 | Responsive, glassmorphic UI, modern typography (Inter), role-based views |
| **Backend** | Java 17+ Spring Boot 3.2.3 | RESTful API, Spring Security RBAC, automated milestone engine |
| **Database** | MySQL 8.x | Relational schema for users, projects, proposals, reviews, milestones, IP filings |
| **Containers** | Docker & Docker Compose | Multi-stage Dockerfiles, Nginx reverse proxy, MySQL service healthcheck |

---

## 🚀 Deployment Option 1: One-Click Docker Compose (Recommended)

This launches the entire stack (MySQL 8, Spring Boot REST API, and React with Nginx reverse proxy) in isolated containers with full production parity.

### Prerequisites:
- [Docker Engine & Docker Compose](https://docs.docker.com/get-docker/)

### Launch Steps:
```bash
# 1. Clone or navigate to the repository
cd S5-Mini_project

# 2. Copy the environment variables template
cp .env.example .env

# 3. Build and launch all services in detached mode
docker-compose up -d --build

# 4. Verify running containers
docker-compose ps
```

### Access URLs:
- **Frontend Web Portal**: [http://localhost:3000](http://localhost:3000)
- **Spring Boot REST API**: [http://localhost:8080/api/projects](http://localhost:8080/api/projects)
- **MySQL Database**: `localhost:3306` (Database: `campus_research_db`)

---

## 💻 Deployment Option 2: Standalone Local Development

If you prefer running without Docker:

### 1. Spring Boot Backend:
```powershell
cd BackEnd

# Run with embedded zero-config dev profile (works even without local MySQL):
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Or run with local MySQL:
# Make sure MySQL is running on port 3306 with database `campus_research_db`
mvn spring-boot:run
```
- Backend starts at: `http://localhost:8080`
- H2 Dev Console (when using dev profile): `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:nexus-ai_db`)

### 2. React Frontend:
```powershell
# From project root:
npm install
npm run dev -- --port 3000
```
- Frontend starts at: `http://localhost:3000` (Vite automatically proxies `/api` calls to port 8080)

---

## ☁️ Deployment Option 3: Cloud Deployment (Render.com)

The repository includes a ready-to-deploy [render.yaml](file:///d:/IQOOHack/S5-Mini_project/render.yaml) blueprint:

1. Create a free account on [Render.com](https://render.com/).
2. In the Render Dashboard, click **New +** -> **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect `render.yaml` and provision:
   - **MySQL Database Service** (`nexus-ai-mysql`)
   - **Spring Boot Web Service** (`nexus-ai-backend`) via `BackEnd/Dockerfile`
   - **React Frontend Web Service** (`nexus-ai-frontend`) via root `Dockerfile`
5. Click **Apply** to deploy!

---

## ☁️ Deployment Option 4: Railway.app / AWS ECS

### Railway.app:
1. Create a project on [Railway.app](https://railway.app/).
2. Add a **MySQL** database plugin.
3. Add a service pointing to `BackEnd/Dockerfile`. Set environment variables:
   - `SPRING_DATASOURCE_URL`: `${{MySQL.MYSQL_URL}}`
   - `SPRING_DATASOURCE_USERNAME`: `${{MySQL.MYSQLUSER}}`
   - `SPRING_DATASOURCE_PASSWORD`: `${{MySQL.MYSQLPASSWORD}}`
4. Add a service pointing to `Dockerfile` for the frontend. Set `VITE_API_URL` to backend domain.

---

## 👥 Demo User Credentials

The platform comes pre-seeded with sample users across all 3 key roles:

| Role | Name | Email | Password |
|---|---|---|---|
| **Student Researcher** | Aarav Sharma | `aarav.student@campus.edu` | `student123` |
| **Student Researcher** | Ananya Patel | `ananya.student@campus.edu` | `student123` |
| **Faculty Mentor** | Dr. Rajesh Kumar | `rajesh.faculty@campus.edu` | `faculty123` |
| **Faculty Mentor** | Dr. Sunita Rao | `sunita.faculty@campus.edu` | `faculty123` |
| **Institutional IP Cell** | IP Cell Officer | `ipcell@campus.edu` | `admin123` |
| **Academic Administration** | Academic Office | `academics@campus.edu` | `admin123` |
| **Platform Administrator** | Administrator | `admin@campus.edu` | `admin123` |

> [!TIP]
> Use the **Demo Quick Switcher** buttons (`Student`, `Faculty`, `IP Cell`) in the top navigation bar or the quick fill chips on the login screen to switch personas instantly without retyping passwords.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate and receive role-based user token.
- `POST /api/auth/register`: Register new student or faculty account.
- `GET /api/auth/users`: List all registered researchers and faculty.
- `GET /api/auth/mentors`: List available faculty mentors for project assignment.

### Projects & Proposals (`/api/projects`)
- `GET /api/projects`: List projects (supports `?role=STUDENT&userId=1` or `?role=FACULTY`).
- `GET /api/projects/{id}`: Retrieve project details, status, and milestone.
- `POST /api/projects`: Create project with multipart proposal document attachment (`proposalFile`).

### Faculty Reviews & Automated Milestones (`/api/reviews`)
- `POST /api/reviews`: Submit review decision (`APPROVED`, `REVISION_REQUESTED`, `READY_FOR_IP`, `UNDER_REVIEW`, `REJECTED`).
  - *Automated Trigger*: Endorsing a project as `READY_FOR_IP` automatically provisions a record in the IP Cell tracker.
- `GET /api/projects/{id}/reviews`: Retrieve review history and feedback comments for a project.

### Milestone History (`/api/milestones`)
- `GET /api/projects/{id}/milestones`: Retrieve chronological audit log of milestones.

### Collaborative IP Tracker (`/api/ip-filings`)
- `GET /api/ip-filings`: List all collaborative IP filing assets.
- `GET /api/ip-filings/stats`: Summary counts (`totalFilings`, `granted`, `underExamination`, `filed`, `drafted`).
- `POST /api/ip-filings`: Manually initiate an IP filing record.
- `PUT /api/ip-filings/{id}`: Update application number, filing date, inventors, and status.

### Document Storage (`/uploads`)
- `GET /uploads/{fileName}`: Stream or download uploaded proposal PDF documents.
