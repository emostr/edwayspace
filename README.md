# edway.space

Multi-tenant school platform for students, teachers, class heads, and vice-principals (завучи). Replaces messenger chats, paper journals, and Google Forms.

## Structure

- `backend/` — NestJS + Prisma + PostgreSQL API
- `frontend/` — Next.js App Router (TypeScript)

## Quick start

### Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

API: http://localhost:3000  
Swagger: http://localhost:3000/api/docs

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

App: http://localhost:3001

## Test accounts (password: `test123`)

| Login           | Role            | Class |
| --------------- | --------------- | ----- |
| zavuch          | ZAVUCH          | —     |
| klassruk.9a     | CLASS_HEAD      | 9А    |
| klassruk.9b     | CLASS_HEAD      | 9Б    |
| teacher.math    | TEACHER         | —     |
| teacher.russian | TEACHER         | —     |
| teacher.physics | TEACHER         | —     |
| student.9a.1    | STUDENT         | 9А    |
| student.9a.2    | STUDENT         | 9А    |
| student.9b.1    | STUDENT         | 9Б    |
| student.9b.2    | STUDENT         | 9Б    |
| student.10a.1   | STUDENT         | 10А   |
| student.10a.2   | STUDENT         | 10А   |
| trusted.9a      | TRUSTED_STUDENT | 9А    |

School: "Школа №42", Пенза




МБОУ ЛСТУ №2 г. Пензы
shkoly.a
LSTU-2-admin*18042026-73

kot.i
k52bs1u7

pavlov.m
EVZBto4y