# SupportFlow

SupportFlow is a mini helpdesk / ticketing SaaS portfolio project.

The goal is to build a medior-level fullstack TypeScript application with a separate React frontend and NestJS backend.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Hook Form
- Zod
- TanStack Query

### Backend

- Node.js
- NestJS
- TypeScript
- PostgreSQL
- Prisma
- JWT authentication
- bcrypt password hashing
- Swagger / OpenAPI

### Tooling

- Docker Compose
- GitHub Actions
- npm
- Git

## Roles

- ADMIN
- AGENT
- CUSTOMER

## Demo Users

| Role     | Email                | Password    |
| -------- | -------------------- | ----------- |
| Admin    | admin@example.com    | admin123    |
| Agent    | agent@example.com    | agent123    |
| Customer | customer@example.com | customer123 |

## Planned Features

- Authentication
- Role-based access control
- Ticket CRUD
- Ticket comments
- Ticket status history
- Dashboard statistics
- Search, filtering, pagination
- Backend tests
- Frontend tests
- Playwright happy-path test
- Docker setup
- CI pipeline

## Project Structure

```txt
supportflow/
├── frontend/
├── backend/
├── screenshots/
├── docker-compose.yml
├── README.md
├── .gitignore
└── .env.example
```

## Backend Development

Start PostgreSQL:

```powershell
docker compose up -d
```

Start the backend:

```powershell
cd backend
npm run start:dev
```

Health check:

```txt
http://localhost:3000/health
```

Swagger API docs:

```txt
http://localhost:3000/api
```

## Database

Apply migrations:

```powershell
cd backend
npx prisma migrate dev
```

Reset the database and run seed data:

```powershell
cd backend
npx prisma migrate reset
```

Run seed manually:

```powershell
cd backend
npx prisma db seed
```

Open Prisma Studio:

```powershell
cd backend
npx prisma studio
```

### Demo Users

| Role     | Email                | Password    |
| -------- | -------------------- | ----------- |
| Admin    | admin@example.com    | admin123    |
| Agent    | agent@example.com    | agent123    |
| Customer | customer@example.com | customer123 |

## Authentication

Demo users:

| Role     | Email                | Password    |
| -------- | -------------------- | ----------- |
| Admin    | admin@example.com    | admin123    |
| Agent    | agent@example.com    | agent123    |
| Customer | customer@example.com | customer123 |

Login:

```powershell
cd backend

$loginResponse = Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:3000/auth/login `
  -ContentType "application/json" `
  -Body '{"email":"admin@example.com","password":"admin123"}'

$token = $loginResponse.accessToken
```

Get current user:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri http://localhost:3000/auth/me `
  -Headers @{ Authorization = "Bearer $token" }
```

Admin-only RBAC check:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri http://localhost:3000/auth/admin-check `
  -Headers @{ Authorization = "Bearer $token" }
```
