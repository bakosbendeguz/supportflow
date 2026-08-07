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

## Ticket API

All ticket endpoints require Bearer token authentication.

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /tickets | List tickets with role-based visibility, filters, pagination and sorting |
| GET | /tickets/:id | Get ticket detail |
| POST | /tickets | Create a ticket |
| PATCH | /tickets/:id | Update ticket fields |
| PATCH | /tickets/:id/status | Update ticket status and write status history |
| DELETE | /tickets/:id | Delete a ticket as admin |

### Permission Summary

- ADMIN can see and manage all tickets.
- AGENT can see assigned and unassigned tickets.
- CUSTOMER can see only their own tickets.
- CUSTOMER can create tickets, but priority defaults to MEDIUM.
- CUSTOMER cannot set or update priority.
- CUSTOMER cannot assign tickets.
- ADMIN and AGENT can update priority.
- ADMIN and AGENT can update status.
- Only ADMIN can delete tickets.

### Ticket list query parameters

| Parameter | Example | Description |
|---|---|---|
| search | login | Search title and description |
| status | OPEN | Filter by status |
| priority | URGENT | Filter by priority |
| assigneeId | unassigned | Filter by assignee id or unassigned |
| includeUnassigned | false | For agents, hide unassigned tickets |
| page | 1 | Page number |
| limit | 10 | Page size |
| sortBy | createdAt | Sort field |
| sortOrder | desc | Sort direction |

### Example: create customer ticket

```powershell
$newTicket = Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:3000/tickets `
  -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $customerToken" } `
  -Body '{"title":"Password reset does not work","description":"I requested a password reset email but I did not receive anything."}'
```

Customer-created tickets default to MEDIUM priority.

### Example: update status as agent/admin

```powershell
Invoke-RestMethod `
  -Method Patch `
  -Uri "http://localhost:3000/tickets/$ticketId/status" `
  -ContentType "application/json" `
  -Headers @{ Authorization = "Bearer $agentToken" } `
  -Body '{"status":"IN_PROGRESS"}'
```

### Comments and Dashboard API

Implemented:
- GET /tickets/:ticketId/comments
- POST /tickets/:ticketId/comments
- GET /dashboard/summary

Comments:
- Authenticated users can list and create comments only on tickets they are allowed to access.
- Comment responses include safe author fields only: id, email, name, and role.
- passwordHash is never returned.

Dashboard:
- Dashboard statistics reuse the same ticket visibility rules as the Ticket API.
- ADMIN sees all ticket counts.
- AGENT sees assigned and unassigned ticket counts.
- CUSTOMER sees only their own ticket counts.

Cleanup:
- Extracted TicketAccessService so ticket visibility rules are shared by tickets, comments, and dashboard.
- Removed duplicated comment author select logic with safeAuthorSelect.
- Cleaned Swagger descriptions.
- Standardized imports.
- Fixed lint warnings.

Verification:
- npm run lint passed.
- npm run build passed.
- Authenticated comment listing works.
- Authenticated comment creation works.
- Empty comment validation returns 400.
- Authenticated dashboard summary works.
- Missing-token dashboard request returns 401.