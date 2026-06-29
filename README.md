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

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | admin123 |
| Agent | agent@example.com | agent123 |
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