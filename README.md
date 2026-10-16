# SupportFlow

SupportFlow is a full-stack helpdesk / ticketing application built as a portfolio project to demonstrate production-oriented TypeScript development across a React frontend and NestJS backend.

> **Status:** In progress, but fully usable for the implemented core workflow.
> Authentication, role-based access control, ticket management, comments, dashboard statistics, frontend ticket assignment, backend and frontend tests, and fresh-machine setup documentation are implemented. Playwright E2E coverage and CI are planned next.

## Features

- JWT authentication
- Role-based access control
- Ticket creation and management
- Role-scoped ticket visibility
- Ticket status workflow
- Ticket assignment workflow with Agent self-assignment and Admin assignment controls
- Automatic Agent assignment when an unassigned ticket is moved through the status workflow
- Ticket comments
- Ticket status history
- Dashboard statistics
- Search, filtering, pagination, and sorting
- Swagger / OpenAPI documentation
- Seeded demo accounts
- Backend unit tests
- Frontend component tests
- Dockerized PostgreSQL development environment

## Roles and Permissions

### Admin

- View and manage all tickets
- Assign tickets to Agents
- Reassign or unassign tickets
- Update ticket priority and status
- Delete tickets

### Agent

- View assigned and unassigned tickets
- Assign an unassigned ticket to themselves
- Automatically become the assignee when updating the status of an unassigned ticket
- Update ticket priority and status
- Comment on accessible tickets

### Customer

- Create tickets
- View only their own tickets
- Comment on their own tickets
- Cannot assign tickets
- Cannot change ticket priority or status

Customer-created tickets default to `MEDIUM` priority.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Zod
- Vitest
- React Testing Library

### Backend

- NestJS
- TypeScript
- PostgreSQL
- Prisma
- JWT
- bcrypt
- Swagger / OpenAPI
- Jest

### Tooling

- Docker Compose
- npm
- Git
- GitHub

## Architecture

```text
React / Vite
     |
     | HTTP + JWT
     v
NestJS REST API
     |
     | Prisma
     v
PostgreSQL
```

## Screenshots

### Dashboard

![SupportFlow dashboard](screenshots/dashboard.png)

### Ticket List

![SupportFlow ticket list](screenshots/tickets.png)

### Ticket Details

![SupportFlow ticket details](screenshots/ticket-detail.png)

### Create Ticket

![SupportFlow create ticket form](screenshots/create-ticket.png)

## Demo Accounts

The seed data includes multiple users so role-based ticket visibility can be demonstrated clearly.

| Role       | Email                 | Password    |
| ---------- | --------------------- | ----------- |
| Admin      | admin@example.com     | admin123    |
| Agent      | agent@example.com     | agent123    |
| Agent 2    | agent2@example.com    | agent123    |
| Customer   | customer@example.com  | customer123 |
| Customer 2 | customer2@example.com | customer123 |

The secondary agent and customer accounts make it possible to verify that users see different ticket sets depending on their role and ownership.

## Local Development

For the complete fresh-machine setup and troubleshooting guide, see [SETUP.md](SETUP.md).

### Prerequisites

- Git
- Node.js 24 (`24.18.0` recommended; `>=24.18.0 <25`)
- npm 11 (`11.16.0` recommended; `>=11.16.0 <12`)
- Docker Desktop

### 1. Clone the repository

```powershell
git clone https://github.com/bakosbendeguz/supportflow.git
cd supportflow
```

### 2. Create environment files

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

No root `.env` file is required by the current Docker Compose configuration.

### 3. Start PostgreSQL

```powershell
docker compose up -d
```

### 4. Initialize and start the backend

```powershell
cd backend
npm ci
npx prisma generate
npx prisma validate
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

Backend:

```text
http://localhost:3000
```

Swagger / OpenAPI:

```text
http://localhost:3000/api
```

### 5. Start the frontend

Open another terminal and move to the frontend directory from the project root:

```powershell
cd frontend
npm ci
npm run dev
```

Frontend:

```text
http://localhost:5173
```

For install-script handling, audit guidance, clean reinstalls, database resets, and full verification steps, see [SETUP.md](SETUP.md).

## Main API Endpoints

| Method | Endpoint                      | Description                          |
| ------ | ----------------------------- | ------------------------------------ |
| POST   | `/auth/login`                 | Authenticate a user                  |
| GET    | `/auth/me`                    | Get the authenticated user           |
| GET    | `/tickets`                    | Get role-scoped tickets              |
| GET    | `/tickets/:id`                | Get ticket details                   |
| POST   | `/tickets`                    | Create a ticket                      |
| PATCH  | `/tickets/:id`                | Update ticket fields                 |
| PATCH  | `/tickets/:id/status`         | Update ticket status                 |
| DELETE | `/tickets/:id`                | Delete a ticket as Admin             |
| GET    | `/tickets/:ticketId/comments` | List ticket comments                 |
| POST   | `/tickets/:ticketId/comments` | Add a ticket comment                 |
| GET    | `/dashboard/summary`          | Get role-scoped dashboard statistics |
| GET    | `/users/agents`               | List assignable Agents as Admin      |

## Testing

### Backend

```powershell
cd backend
npx prisma generate
npm test
npm run build
npm run lint
```

Current backend test coverage includes:

- ticket visibility rules
- ticket status and assignment business rules
- Agent status-update auto-assignment
- Admin assignment behavior
- Agent lookup for assignment
- comment access control
- dashboard visibility and aggregation

### Frontend

```powershell
cd frontend
npm test -- --run
npm run build
npm run lint
```

Current frontend tests cover:

- login validation, errors, authentication, and redirects
- protected route behavior
- dashboard loading, errors, and statistics
- ticket list loading, errors, empty state, and rendering
- ticket creation validation, errors, and navigation
- ticket details and status history
- comment creation and errors
- Agent self-assignment
- Agent status updates
- role-based assignment and status controls
- Admin assignment and unassignment
- root-page sign-in navigation

## Access Control

Authorization is enforced on the backend rather than relying on frontend visibility alone.

Examples:

- Customers can access only their own tickets.
- Customers cannot change ticket status, priority, or assignment.
- Agents can access tickets assigned to them and unassigned tickets.
- Agents can explicitly claim an unassigned ticket with `Assign to me`.
- Updating the status of an unassigned ticket as an Agent automatically assigns that ticket to the Agent.
- Admin status updates do not automatically assign the ticket to the Admin.
- Admins can explicitly assign, reassign, and unassign tickets.
- Only Admins can delete tickets.
- Comment access follows the same ticket visibility rules.
- Dashboard statistics reuse the same role-scoped visibility logic.

## Seed Data

The development seed includes:

- 1 Admin
- 2 Agents
- 2 Customers
- tickets across the major ticket statuses
- multiple priority levels
- assigned and unassigned tickets
- tickets owned by different customers
- comments from customers and agents
- ticket status history

This makes the role-based access model visible when switching between demo accounts.

## Current Status

### Implemented

- Backend architecture and database model
- PostgreSQL / Prisma integration
- Seed data
- JWT authentication
- Role-based access control
- Ticket API
- Backend ticket-assignment rules
- Ticket comments
- Ticket status history
- Dashboard summary API
- React authentication flow
- Protected routes
- Dashboard UI
- Ticket list
- Ticket creation
- Ticket details
- Comment creation
- Status updates
- Backend unit tests
- Initial frontend component tests
- Initial UI polish
- Fresh-machine setup documentation
- Root-page sign-in CTA
- Agent self-assignment UI
- Agent auto-assignment on status update
- Admin assignment and unassignment UI
- Admin-only Agent lookup endpoint
- Backend unit tests
- Frontend component tests
- Fresh-machine setup documentation

### Next

- Add Playwright end-to-end tests
- Add GitHub Actions CI
- Refresh screenshots after final UI verification
- Perform the final clean-machine verification pass

## Scope

SupportFlow intentionally focuses on the core helpdesk workflow.

Currently out of scope:

- realtime chat
- email delivery
- payments
- file uploads
- multi-tenant billing
- Redis
- Kubernetes
- internationalization
