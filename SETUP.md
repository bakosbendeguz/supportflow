# SupportFlow Setup Guide

This guide explains how to run SupportFlow on a new development machine from scratch.

## Prerequisites

Install the following tools before starting:

- Git
- Node.js
- npm
- Docker Desktop

Optional but recommended:

- Visual Studio Code

You can verify the required tools with:

```powershell
git --version
node --version
npm --version
docker --version
docker compose version
```

## 1. Clone the repository

```powershell
git clone https://github.com/bakosbendeguz/supportflow.git
cd supportflow
```

## 2. Configure environment variables

### Backend / root environment

Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

The local `.env` should contain values similar to:

```env
BACKEND_PORT=3000
DATABASE_URL=postgresql://supportflow:supportflow@localhost:5432/supportflow?schema=public
JWT_SECRET=change_this_for_your_local_environment
```

The `.env` file is intentionally ignored by Git.

### Frontend environment

Create the frontend environment file from the example:

```powershell
Copy-Item frontend\.env.example frontend\.env
```

Example:

```env
VITE_API_URL=http://localhost:3000
```

## 3. Start PostgreSQL

SupportFlow uses PostgreSQL through Docker Compose.

From the project root:

```powershell
docker compose up -d
```

Verify that the database container is running:

```powershell
docker compose ps
```

## 4. Install backend dependencies

```powershell
cd backend
npm install
```

## 5. Initialize the database

Run Prisma migrations:

```powershell
npx prisma migrate dev
```

Seed the database with demo users and tickets:

```powershell
npx prisma db seed
```

The seed creates multiple users, tickets, comments, assignments, priorities, and ticket status history so the role-based access rules can be tested immediately.

## 6. Start the backend

From the `backend` directory:

```powershell
npm run start:dev
```

The API should be available at:

```text
http://localhost:3000
```

Swagger / OpenAPI documentation:

```text
http://localhost:3000/api
```

Keep this terminal running.

## 7. Install frontend dependencies

Open a second terminal.

From the project root:

```powershell
cd frontend
npm install
```

## 8. Start the frontend

```powershell
npm run dev
```

The frontend should be available at:

```text
http://localhost:5173
```

Open this URL in your browser.

## 9. Demo accounts

The seeded database includes the following accounts:

| Role       | Email                 | Password    |
| ---------- | --------------------- | ----------- |
| Admin      | admin@example.com     | admin123    |
| Agent      | agent@example.com     | agent123    |
| Agent 2    | agent2@example.com    | agent123    |
| Customer   | customer@example.com  | customer123 |
| Customer 2 | customer2@example.com | customer123 |

These accounts are useful for testing different role-based ticket visibility and permissions.

## 10. Verify the application

After logging in, verify the main workflow:

1. Open the dashboard.
2. View the ticket list.
3. Open a ticket.
4. Review comments and ticket details.
5. Review ticket status history.
6. Add a comment.
7. Update a ticket status with an Agent or Admin account.
8. Create a new ticket.
9. Log in with another role and confirm that ticket visibility changes appropriately.

## 11. Run backend checks

From the `backend` directory:

```powershell
npm test
npm run build
npm run lint
```

## 12. Run frontend checks

From the `frontend` directory:

```powershell
npm test -- --run
npm run build
npm run lint
```

## Troubleshooting

### Docker database is not running

Check the containers:

```powershell
docker compose ps
```

If necessary:

```powershell
docker compose up -d
```

### Database connection error

Verify that:

- Docker Desktop is running.
- PostgreSQL is running through Docker Compose.
- `DATABASE_URL` matches the credentials in `docker-compose.yml`.
- Port `5432` is available.

### Port already in use

SupportFlow normally uses:

```text
Frontend:   5173
Backend:    3000
PostgreSQL: 5432
```

Make sure another application is not already using these ports.

### Reset the local database

If you want to recreate the local development database:

```powershell
cd backend
npx prisma migrate reset
```

This removes the existing local database data, reapplies migrations, and runs the seed process again.

### Frontend cannot reach the API

Verify:

```env
VITE_API_URL=http://localhost:3000
```

and confirm that the NestJS backend is running.

### Prisma issues after pulling changes

From the backend directory:

```powershell
npx prisma generate
npx prisma migrate dev
```

## Stopping the development environment

Stop the frontend and backend processes with:

```text
Ctrl + C
```

Stop the Docker services from the project root:

```powershell
docker compose down
```

## Development workflow

A typical development session is:

```text
1. docker compose up -d
2. start NestJS backend
3. start Vite frontend
4. develop and test
5. run tests / build / lint
6. docker compose down when finished
```

For the project overview, architecture, screenshots, features, and current development status, see the main [README](README.md).
