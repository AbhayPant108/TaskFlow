
```
# ⚡ TaskFlow — Full-Stack Project & Task Management Platform

TaskFlow is a modern, enterprise-grade project and task management web application built with a **Next.js 16 (Turbopack)** frontend and a **Django REST Framework (DRF)** backend. It seamlessly connects three decoupled domains—**Users**, **Projects**, and **Tasks**—under a role-based access control (RBAC) architecture with real-time UI synchronization, JWT HttpOnly cookie authentication, and interactive Kanban boards.

---

## 🚀 Features

### 🔐 1. Identity & User Management (`UserService`)
- **Authentication**: JWT-based authentication using secure HttpOnly cookies with automatic token refresh and Bearer header fallback.
- **Role-Based Access Control (RBAC)**: System-level roles (`ADMIN`, `MANAGER`, `MEMBER`) governing access to projects, tasks, and administrative features.
- **Account Settings & Security**: User profile updates, password change dialogs with visibility toggles (see/unsee), and unauthenticated route guards (`AuthWrapper`).
- **Team Directory**: Filterable team catalog displaying members by system role, email, and live task allocations.

### 📁 2. Workspace & Project Management (`ProjectService`)
- **Project Lifecycle Tracking**: Categorize projects across statuses (`PLANNING`, `ACTIVE`, `COMPLETED`, `ARCHIVED`) with custom hex accent colors.
- **Project-Level RBAC**: Granular permissions (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`).
- **Team Collaboration**: Invite members directly by email or member selector, update project roles dynamically, and remove team members.
- **Analytics & Health Metrics**: Real-time project task counts, completion percentages, and duration timelines.

### 📋 3. Kanban & Task Management (`TaskService`)
- **Interactive Kanban Boards**: Drag-and-drop or one-click status transitions across `TODO`, `IN_PROGRESS`, and `DONE` columns.
- **Multi-Dimensional Filters**: Filter tasks globally or per project by status, priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), assigned member, search query, and due dates.
- **Overdue & Triage Tracking**: Immediate alerts and visual metrics for overdue tasks and high-priority roadblocks.
- **Project-Scoped Views**: Dedicated project boards and unified workspace boards with table and board view toggles.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) / Radix UI primitives
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) (RTK)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/) (interceptors with token refresh queue)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Framework**: [Django 6.1+](https://www.djangoproject.com/) & [Django REST Framework](https://www.django-rest-framework.org/)
- **Authentication**: `djangorestframework-simplejwt` with custom HttpOnly cookie handling
- **Filtering & Search**: `django-filter`, DRF SearchFilter & OrderingFilter
- **API Documentation**: [drf-spectacular](https://drf-spectacular.readthedocs.io/) (OpenAPI 3.0 / Swagger UI)
- **Database**: SQLite (default for development; PostgreSQL-ready)

---

## 📂 Project Structure

```text
TaskFlow/
├── backend/
│   ├── manage.py
│   ├── taskflow_backend/        # Django project configuration & settings
│   ├── userapp/                 # UserService: auth, profiles, roles, JWT cookies
│   ├── projectapp/              # ProjectService: projects, memberships, roles
│   └── taskapp/                 # TaskService: tasks, statuses, priorities, filtering
│
└── frontend/
    ├── app/                     # Next.js App Router (layout, page.tsx)
    ├── components/
    │   ├── auth/                # AuthWrapper, AuthDialog, ProfileDialog
    │   ├── dashboard/           # DashboardOverview, KPI metric cards
    │   ├── layout/              # Navbar, project switcher, profile menu
    │   ├── projects/            # ProjectCard, ProjectDetailView, ProjectList, Modals
    │   ├── tasks/               # TaskBoardView, TaskCard, TaskList, TaskFilters
    │   ├── team/                # TeamDirectory
    │   └── ui/                  # Shadcn UI primitives (Button, Dialog, Badge, etc.)
    ├── hooks/                   # useAuth, useProjects, useTasks
    ├── lib/                     # Axios apiClient, tokenStorage, API modules
    ├── schemas/                 # Zod validation schemas (auth, project, task)
    ├── store/                   # Redux slices (auth, project, task, user)
    └── types/                   # TypeScript interfaces (Project, Task, User)
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js**: v18.18+ or v20+
- **Python**: v3.11+ or v3.13+
- **Package Manager**: `npm` / `pnpm` and `pip`

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
# Windows (PowerShell):
python -m venv .venv
.\.venv\Scripts\Activate.ps1
# macOS/Linux:
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# (Optional) Create superuser
python manage.py createsuperuser

# Start the Django development server
python manage.py runserver 8000
```
Backend will be live at `http://localhost:8000`.
- **API Root**: `http://localhost:8000/api/`
- **Swagger Documentation**: `http://localhost:8000/api/docs/`
- **OpenAPI Schema**: `http://localhost:8000/api/schema/`

---

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment configuration
# Copy or create .env.local:
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Run the Next.js development server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 👥 Demo Accounts

The application includes predefined test users with different role permissions:

| Name | Email | Password | System Role |
| :--- | :--- | :--- | :--- |
| **Alex Morgan** | `admin@taskflow.dev` | `AdminPass123!` | `ADMIN` (Global Access) |
| **Sarah Chen** | `sarah.chen@taskflow.dev` | `AdminPass123!` | `MANAGER` (Project Manager) |
| **David Kim** | `david.kim@taskflow.dev` | `AdminPass123!` | `MEMBER` (Developer / Contributor) |

*Tip: Quick 1-click test credentials are built into the sign-in modal for testing.*

---

## 🔐 API Reference Overview

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/auth/login/` | `POST` | Authenticate credentials & set JWT HttpOnly cookies |
| `/api/auth/register/` | `POST` | Register new account & return JWT cookies |
| `/api/auth/refresh/` | `POST` | Rotate and issue a fresh access token |
| `/api/auth/logout/` | `POST` | Blacklist refresh token and wipe cookies |
| `/api/auth/me/` | `GET`, `PATCH` | Retrieve or update current user profile |
| `/api/users/` | `GET` | List users for team allocation (supports search & role filter) |
| `/api/projects/` | `GET`, `POST` | List accessible projects / create project |
| `/api/projects/{id}/` | `GET`, `PATCH`, `DELETE` | Retrieve, update, or remove project |
| `/api/projects/{id}/members/` | `GET`, `POST` | List project members / invite member by ID or email |
| `/api/projects/{id}/members/{user_id}/` | `PATCH`, `DELETE`| Update member role / remove member |
| `/api/tasks/` | `GET`, `POST` | List filtered tasks / create task |
| `/api/tasks/{id}/` | `GET`, `PATCH`, `DELETE` | Retrieve, update, or delete task |
| `/api/tasks/{id}/status/` | `POST` | Move task status (`TODO` ➔ `IN_PROGRESS` ➔ `DONE`) |

---

## 🧪 Quality & Verification

```bash
# Run TypeScript compilation check
cd frontend && npx tsc --noEmit

# Run ESLint validation
cd frontend && npm run lint

# Build optimized production bundle
cd frontend && npm run build
```

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
```