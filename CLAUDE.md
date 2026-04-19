# edway.space — project context for Claude

## What is this

edway.space is a multi-tenant school platform for students, teachers, class heads, and vice-principals (zavuch). Replaces messenger chats, paper journals, and Google Forms. One deployment serves many schools — each school is a tenant with isolated data. Built by emostrStudio (one-person studio).

## Architecture

Monorepo with two main parts:

- `backend/` — NestJS + Prisma + PostgreSQL (API server)
- `frontend/` — Next.js + TypeScript (web application, not started yet)
- Landing page (static HTML/CSS/JS) lives separately at edway.space, not in this repo

The frontend will live on `app.edway.space`, the landing stays on `edway.space`. When a user clicks "Войти" on the landing — they go to `app.edway.space/login`.

## Tech stack

### Backend
- Runtime: Node.js 18+
- Framework: NestJS with TypeScript (strict mode)
- ORM: Prisma with PostgreSQL
- Auth: JWT via @nestjs/passport + passport-jwt + bcrypt
- Validation: class-validator + class-transformer
- Docs: Swagger on /api/docs
- Port: 3000

### Frontend (planned)
- Framework: Next.js (App Router) + TypeScript
- Styling: to be decided (likely Tailwind or CSS Modules with existing design tokens)
- Port: 3001

### Database
- PostgreSQL 16
- All migrations managed via Prisma
- Connection string in backend/.env (DATABASE_URL)

## Multi-tenancy

Every school is a separate tenant. All data is filtered by `schoolId`. The `schoolId` is embedded in the JWT token — every API request is automatically scoped to the user's school. A user from School A can never access data from School B.

## Roles and permissions hierarchy

Roles are hierarchical — higher roles inherit all permissions of lower roles:

```
STUDENT < TRUSTED_STUDENT < TEACHER < CLASS_HEAD < ZAVUCH
```

- **STUDENT** — reads homework, schedule, notes, announcements for their class
- **TRUSTED_STUDENT** — same as STUDENT + publishes notes and homework for their own class (no moderation)
- **TEACHER** — publishes homework and notes for subjects and classes they are assigned to (via TeacherAssignment)
- **CLASS_HEAD** — same as TEACHER + manages schedule for their class + publishes class-level announcements + assigns trusted students
- **ZAVUCH** — same as CLASS_HEAD + publishes school-level announcements + manages all classes

A CLASS_HEAD is also a teacher. A ZAVUCH is also a teacher and can be a class head. The role field in User is a single enum value — hierarchy is enforced in RolesGuard.

## Database schema

### Models

**School**: id (UUID), name, city, adminEmail, createdAt

**User**: id (UUID), schoolId (FK→School), classId (FK→Class, nullable), login (unique), passwordHash, role (enum), firstName, lastName, mustChangePassword (bool, default true), createdAt

**Class**: id (UUID), schoolId (FK→School), classHeadId (FK→User, nullable), name (e.g. "9Б")

**Subject**: id (UUID), schoolId (FK→School), name

**TeacherAssignment**: id (UUID), teacherId (FK→User), subjectId (FK→Subject), classId (FK→Class). Unique constraint: [teacherId, subjectId, classId]

**Schedule**: id (UUID), classId (FK→Class), subjectId (FK→Subject), dayOfWeek (1=Mon..6=Sat), lessonNumber (Int). Unique constraint: [classId, dayOfWeek, lessonNumber]

**Homework**: id (UUID), classId (FK→Class), subjectId (FK→Subject), authorId (FK→User), content (text), deadline (DateTime, nullable), createdAt

**Note**: id (UUID), classId (FK→Class), subjectId (FK→Subject), authorId (FK→User), title, content (text), createdAt

**Announcement**: id (UUID), schoolId (FK→School), classId (FK→Class, nullable), authorId (FK→User), content (text), level (enum: CLASS, SCHOOL), createdAt

### Enums
- Role: STUDENT, TRUSTED_STUDENT, TEACHER, CLASS_HEAD, ZAVUCH
- AnnouncementLevel: CLASS, SCHOOL

### Cascade rules
All foreign keys use CASCADE on delete.

## API structure

Base URL: `http://localhost:3000`
Swagger docs: `http://localhost:3000/api/docs`
Auth: Bearer JWT token in Authorization header

### Auth
- `POST /auth/login` — { login, password } → { accessToken, user, mustChangePassword }
- `POST /auth/change-password` — { newPassword } (requires JWT, sets mustChangePassword=false)

### Schools
- CRUD: `GET/POST /schools`, `GET/PATCH/DELETE /schools/:id`

### Users
- `POST /users` — creates user with generated temp password, mustChangePassword=true
- `GET /users` — list users (filtered by schoolId from JWT)
- `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id`

### Classes
- CRUD: `GET/POST /classes`, `GET/PATCH/DELETE /classes/:id`
- All scoped to current school

### Subjects
- CRUD: `GET/POST /subjects`, `GET/PATCH/DELETE /subjects/:id`
- All scoped to current school

### Teacher Assignments
- CRUD: `GET/POST /teacher-assignments`, `DELETE /teacher-assignments/:id`
- Filters: `?teacherId=`, `?classId=`

### Schedule
- `GET /schedule?classId=` — returns schedule grouped by day
- `POST/PATCH/DELETE /schedule` — CLASS_HEAD and ZAVUCH only

### Homework
- `POST /homework` — TEACHER (must have TeacherAssignment), TRUSTED_STUDENT (own class only), CLASS_HEAD, ZAVUCH
- `GET /homework?classId=` — list for class
- `GET /homework/:id` — single
- `PATCH /homework/:id` — author only
- `DELETE /homework/:id` — author or CLASS_HEAD+

### Notes
- Same permission model as Homework

### Announcements
- `POST /announcements` — CLASS level: CLASS_HEAD+, requires classId. SCHOOL level: ZAVUCH only, classId=null
- `GET /announcements?classId=` — returns both CLASS and SCHOOL level
- `DELETE /announcements/:id` — author or ZAVUCH

## NestJS module structure

```
backend/src/
├── main.ts
├── app.module.ts
├── prisma/
│   └── prisma.module.ts, prisma.service.ts (@Global)
├── common/
│   ├── guards/ (jwt-auth.guard.ts, roles.guard.ts)
│   ├── decorators/ (roles.decorator.ts, current-user.decorator.ts)
│   └── types/ (jwt-payload.ts, authenticated-user.ts)
├── auth/
│   └── auth.module.ts, auth.controller.ts, auth.service.ts, jwt.strategy.ts, dto/
├── schools/
├── users/
├── classes/
├── subjects/
├── teacher-assignments/
├── schedule/
├── homework/
├── notes/
└── announcements/
```

Each module follows the pattern: module.ts, controller.ts, service.ts, dto/ folder.

## Design system

Metro UI dark aesthetic inherited from the landing page. Typography-first, flat, zero decorative noise.

### Colors
- --bg: #0a0a0a
- --bg-card: #141414
- --bg-secondary: #1e1e1e
- --accent: #0078d4
- --accent-dim: #005a9e
- --text: #ffffff
- --text-muted: #8a8a8a
- --border: #2a2a2a

### Typography
- Font: Racama (loaded via @font-face, woff2)
- Fallback: system-ui, sans-serif

### Spacing
8px / 16px / 32px / 64px / 96px

### Rules — absolute, never break
- Zero comments in any file, ever
- Zero border-radius above 2px
- Zero shadows
- Zero gradients
- Racama font only
- All colors via CSS custom properties
- Single breakpoint at 768px
- Senior-level clean code only

### Components
- Button: bg #0078d4, color #fff, padding 14px 36px, border-radius 2px, border 2px solid #0078d4, hover → #005a9e
- Card: bg #141414, border 1px solid #2a2a2a, border-radius 2px, padding 32px
- Card accent: border-left 3px solid #0078d4
- Header: sticky, bg #0a0a0a, border-bottom 1px solid #2a2a2a, height 64px
- Footer: border-top 1px solid #2a2a2a, padding 32px 0
- Input: bg #141414, border 1px solid #2a2a2a, border-radius 2px, focus border → #0078d4

## Code rules

- Zero comments anywhere, in any file, ever
- Senior-level clean code only
- TypeScript strict mode
- All entity names, variable names, endpoints — in English
- Russian only in user-facing strings (UI labels, error messages)
- Prisma model names: PascalCase singular (User, not Users)
- API endpoints: kebab-case plural (/teacher-assignments, not /teacherAssignment)
- DTO classes: PascalCase with suffix (CreateHomeworkDto, UpdateUserDto)
- Services: PascalCase with suffix (HomeworkService)
- Controllers: PascalCase with suffix (HomeworkController)

## Seed data (for development)

Login credentials (all passwords: test123):
- zavuch — ZAVUCH role
- klassruk.9a — CLASS_HEAD for 9А
- klassruk.9b — CLASS_HEAD for 9Б
- teacher.math — TEACHER (math)
- teacher.russian — TEACHER (russian)
- teacher.physics — TEACHER (physics)
- student.9a.1, student.9a.2 — STUDENT in 9А
- student.9b.1, student.9b.2 — STUDENT in 9Б
- student.10a.1, student.10a.2 — STUDENT in 10А
- trusted.9a — TRUSTED_STUDENT in 9А

School: "Школа №42", Пенза

## Running the project

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

Swagger: http://localhost:3000/api/docs
Test login: POST /auth/login {"login":"zavuch","password":"test123"}

## Current state

### Done
- Full backend API with all modules, guards, DTOs, services
- Prisma schema with all models and relations
- JWT auth with role hierarchy
- Multi-tenant data isolation
- Swagger documentation
- Seed data
- CORS enabled
- Frontend (Next.js App Router, TypeScript strict)
- Design system: CSS custom properties, Racama font, Metro dark UI
- Auth flow: login page, change-password gate (mustChangePassword), JWT in localStorage
- Dashboard layout: sticky header, sidebar with role-aware nav, footer, burger menu
- Dashboard home page (role-aware greeting + quick links)
- Admin section: users CRUD (list, create, edit, delete, password reset), classes CRUD, subjects CRUD, teacher assignments
- Homework: create/edit/delete forms, list by class, deadline display
- Notes: create/edit/delete, list by class
- Announcements: school-level (ZAVUCH) and class-level (CLASS_HEAD), delete
- Schedule: weekly grid view + CLASS_HEAD edit mode (add/delete lessons)
- Trusted student assignment (CLASS_HEAD can promote/demote)
- PWA: manifest.json, SVG + PNG icons (192/512), favicon.svg, service worker (offline cache), offline page
- Metadata + Viewport exports in root layout (OpenGraph, apple-web-app, theme-color)
- PageTransition component (fadeIn 0.2s)
- CopyButton component with ✓ Скопировано animation
- Focus-visible global styles; Modal focus trap + Escape key close
- Modal mobile responsive (align-items: flex-end on small screens)
- frontend/.env.example

### Not started
- File attachments for homework/notes
- Surveys (planned for later)
- Push notifications
- Deployment

## Legal

Russian law 152-FZ compliance required. All data stored in Russia (Timeweb Cloud). Privacy policy exists on the landing page. Minors under 14 require parental consent for data processing.