# SupportFlow Setup Guide

This guide explains how to set up and run SupportFlow on a fresh development machine.

## Prerequisites

Install the following tools before starting:

- Git
- Node.js 24 (`24.18.0` recommended; supported range: `>=24.18.0 <25`)
- npm 11 (`11.16.0` recommended; supported range: `>=11.16.0 <12`)
- Docker Desktop

Optional but recommended:

- Visual Studio Code

Verify the installed versions:

```powershell
git --version
node --version
npm --version
docker --version
docker compose version
```

The repository contains an `.nvmrc` file with the recommended Node.js version.

> On Windows, `.nvmrc` is primarily version metadata unless your Node version manager supports reading it directly.

---

## 1. Clone the repository

```powershell
git clone https://github.com/bakosbendeguz/supportflow.git
cd supportflow
```

---

## 2. Configure environment variables

SupportFlow uses separate environment files for the backend and frontend.

### Backend environment

Create the backend environment file:

```powershell
Copy-Item backend\.env.example backend\.env
```

The backend environment should contain:

```env
BACKEND_PORT=3000
DATABASE_URL=postgresql://supportflow:supportflow@localhost:5432/supportflow?schema=public
JWT_SECRET=change_me_in_local_env
```

`backend/.env` is loaded by the NestJS backend and Prisma commands executed from the `backend` directory.

For local development, the placeholder `JWT_SECRET` works functionally, but using a unique random value is recommended. Never commit a real secret.

### Frontend environment

Create the frontend environment file:

```powershell
Copy-Item frontend\.env.example frontend\.env
```

The frontend environment should contain:

```env
VITE_API_URL=http://localhost:3000
```

Real `.env` files are ignored by Git and must not be committed.

### Root environment

The current `docker-compose.yml` contains its PostgreSQL development credentials directly, so no root `.env` file is required for the current setup.

---

## 3. Start PostgreSQL

From the project root:

```powershell
docker compose up -d
```

Verify the service:

```powershell
docker compose ps
```

PostgreSQL is exposed on:

```text
localhost:5432
```

The current Docker Compose configuration uses:

```text
Database: supportflow
User:     supportflow
Password: supportflow
```

These credentials match the development `DATABASE_URL` in `backend/.env.example`.

---

## 4. Install backend dependencies

Move into the backend directory:

```powershell
cd backend
```

Install the exact dependency tree from the lockfile:

```powershell
npm ci
```

The repository includes npm `allowScripts` configuration for the install scripts required by the current locked dependency versions.

If npm reports pending install scripts, review them with:

```powershell
npm approve-scripts --allow-scripts-pending
```

After approving any required scripts, rerun:

```powershell
npm ci
```

Do not use:

```text
npm audit fix --force
```

unless you have intentionally reviewed and accepted the major-version changes it proposes.

---

## 5. Generate and validate the Prisma Client

A fresh `npm ci` does not guarantee that the generated Prisma Client is available for this project, so generate it explicitly:

```powershell
npx prisma generate
```

Then validate the schema and environment:

```powershell
npx prisma validate
```

If Prisma reports:

```text
Environment variable not found: DATABASE_URL
```

verify that `backend/.env` exists and contains a valid `DATABASE_URL`.

If Prisma-generated enums or types such as `Role`, `TicketStatus`, `TicketPriority`, `Prisma.validator`, or `TicketWhereInput` are missing during tests/build, run:

```powershell
npx prisma generate
```

before retrying.

---

## 6. Initialize the database

Still inside the `backend` directory, apply the development migrations:

```powershell
npx prisma migrate dev
```

Seed the database:

```powershell
npx prisma db seed
```

The seed creates:

- 1 Admin
- 2 Agents
- 2 Customers
- tickets across the major ticket statuses
- multiple priority levels
- assigned and unassigned tickets
- comments
- ticket status history

---

## 7. Start the backend

From the `backend` directory:

```powershell
npm run start:dev
```

The backend API is available at:

```text
http://localhost:3000
```

Swagger / OpenAPI documentation is available at:

```text
http://localhost:3000/api
```

Keep this terminal running.

---

## 8. Install and start the frontend

Open a second terminal and move to the frontend directory from the project root:

```powershell
cd frontend
```

Install the exact dependency tree from the lockfile:

```powershell
npm ci
```

Start the Vite development server:

```powershell
npm run dev
```

The frontend is available at:

```text
http://localhost:5173
```

---

## 9. Demo accounts

The seeded database includes the following accounts:

| Role       | Email                 | Password    |
| ---------- | --------------------- | ----------- |
| Admin      | admin@example.com     | admin123    |
| Agent      | agent@example.com     | agent123    |
| Agent 2    | agent2@example.com    | agent123    |
| Customer   | customer@example.com  | customer123 |
| Customer 2 | customer2@example.com | customer123 |

These accounts can be used to verify role-based ticket visibility and permissions.

---

## 10. Verify the application

After logging in, verify the implemented core workflow:

1. Open the dashboard.
2. View the ticket list.
3. Open a ticket.
4. Review ticket details.
5. Review comments.
6. Review ticket status history.
7. Add a comment.
8. Create a new ticket with a Customer account.
9. Log in as an Agent and open an unassigned ticket.
10. Use `Assign to me` and verify that the ticket becomes assigned to the current Agent.
11. Open another unassigned ticket as an Agent and update its status without manually assigning it first.
12. Verify that the status update automatically assigns the ticket to the current Agent.
13. Log in as an Admin and update the status of an unassigned ticket.
14. Verify that the Admin status update does not automatically assign the ticket.
15. As Admin, assign a ticket to an Agent using the assignment selector.
16. Reassign the ticket to another Agent.
17. Set the assignment back to `Unassigned`.
18. Log in with different roles and confirm that ticket visibility and available controls change appropriately.

Ticket assignment rules are enforced by the backend. The frontend exposes Agent self-assignment and Admin assignment/unassignment controls according to those backend permissions.

---

## 11. Run backend checks

From the `backend` directory, ensure the Prisma Client has been generated:

```powershell
npx prisma generate
```

Then run:

```powershell
npm test
npm run build
npm run lint
```

All three commands should complete successfully.

---

## 12. Run frontend checks

From the `frontend` directory:

```powershell
npm test -- --run
npm run build
npm run lint
```

All three commands should complete successfully.

---

# Troubleshooting

## Docker database is not running

From the project root:

```powershell
docker compose ps
```

If PostgreSQL is not running:

```powershell
docker compose up -d
```

---

## Database connection error

Verify that:

- Docker Desktop is running.
- the PostgreSQL container is running.
- port `5432` is available.
- `backend/.env` exists.
- `DATABASE_URL` matches the credentials in `docker-compose.yml`.

The current Docker Compose setup does not require a root `.env` file.

---

## Prisma cannot find `DATABASE_URL`

Create the backend environment file from the example:

```powershell
Copy-Item backend\.env.example backend\.env
```

Then, from the backend directory:

```powershell
cd backend
npx prisma validate
```

---

## Prisma Client types or enums are missing

Typical symptoms include errors involving:

```text
Role
TicketStatus
TicketPriority
Prisma.validator
TicketWhereInput
```

From the backend directory run:

```powershell
npx prisma generate
```

Then rerun the failed test, build, or lint command.

---

## Backend reports missing `class-validator` or `class-transformer`

Both packages are runtime dependencies of the backend and should be installed automatically by:

```powershell
npm ci
```

If either package is missing:

```powershell
git pull
Remove-Item -Recurse -Force node_modules
npm ci
npx prisma generate
```

---

## npm reports pending install scripts

The current backend `package.json` contains explicit `allowScripts` entries for the required locked packages.

If npm still reports pending scripts:

```powershell
npm approve-scripts --allow-scripts-pending
```

Review the packages before approving them. Then rerun:

```powershell
npm ci
npx prisma generate
```

---

## npm audit reports vulnerabilities

Inspect the report with:

```powershell
npm audit
```

To focus on production dependencies:

```powershell
npm audit --omit=dev
```

Do not automatically run:

```text
npm audit fix --force
```

A forced audit fix can introduce breaking major-version changes. In particular, a transitive advisory may require a Prisma major-version upgrade rather than a safe patch.

A normal non-breaking fix may be used when npm explicitly offers one:

```powershell
npm audit fix
```

After dependency changes, always rerun:

```powershell
npx prisma generate
npm test
npm run build
npm run lint
```

---

## Port already in use

SupportFlow normally uses:

```text
Frontend:   5173
Backend:    3000
PostgreSQL: 5432
```

Make sure another application is not already using the required port.

---

## Reset the local database

From the backend directory:

```powershell
npx prisma migrate reset
```

This deletes the local development database contents and reapplies the migrations.

If the seed does not run automatically in your Prisma workflow, run:

```powershell
npx prisma db seed
```

Do not run a database reset against a production database.

---

## Frontend cannot reach the API

Verify that `frontend/.env` contains:

```env
VITE_API_URL=http://localhost:3000
```

Also confirm that the NestJS backend is running on port `3000`.

---

## Prisma issues after pulling changes

From the backend directory:

```powershell
npm ci
npx prisma generate
npx prisma migrate dev
```

---

## Clean dependency reinstall

Backend:

```powershell
cd backend
Remove-Item -Recurse -Force node_modules
npm ci
npx prisma generate
npm test
npm run build
npm run lint
```

Frontend:

```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
npm ci
npm test -- --run
npm run build
npm run lint
```

---

# Stopping the development environment

Stop the frontend and backend processes with:

```text
Ctrl + C
```

From the project root, stop Docker services:

```powershell
docker compose down
```

To also delete the local PostgreSQL volume:

```powershell
docker compose down -v
```

Warning: `docker compose down -v` removes the local database data.

---

# Typical development workflow

```text
1. docker compose up -d
2. start the NestJS backend
3. start the Vite frontend
4. develop and test
5. run tests / build / lint
6. docker compose down
```

For the project overview, architecture, screenshots, features, and current status, see the main [README](README.md).
