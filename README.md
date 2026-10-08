# 🚀 Caddy Manager

A modern, production-ready reverse proxy management system built with **Next.js (App Router)**, **Drizzle ORM**, **Better Auth**, and **Caddy Reverse Proxy** running seamlessly in **Docker**.

---

## ✨ Features

- **🌐 Dynamic Caddy Virtual Host Management**:
  - Add and delete proxy domains on-the-fly without downtime.
  - Automatically preserves all existing routes when new domains are registered.
  - Generates valid Caddyfile configurations dynamically and reloads Caddy via its Admin API (`http://caddy:2019`).
- **🛡️ Strict Google Authentication & RBAC**:
  - Exclusively supports Google Single Sign-On via **Better Auth**.
  - **`isAccess` Approval Flow**: Newly registered users cannot access the system until an administrator toggles their `isAccess` approval.
  - **Isolated Route Ownership**: Standard users only see and manage their own domains. Administrators can view, inspect, and delete routes across all users.
  - **Bootstrap Admin**: The user with email matching `CADDY_MANAGER_USER_EMAIL` is automatically granted `admin: true` and `isAccess: true` upon first sign-in.
- **⚡ Real-Time WebSocket Domain Inspection (Socket.IO)**:
  - Streams continuous live diagnostics to the UI using WebSockets.
  - Checks DNS A-record resolution against the target server IP (`SERVER_PUBLIC_IP`).
  - Performs non-blocking HTTP/HTTPS probing (equivalent to `curl -I -L`) extracting status codes, latency, server headers, and webpage title.
  - Vercel-style domain status badge cards (`Valid Configuration` / `Pending DNS`).
- **🔒 Port Collision & Input Validation**:
  - Validates FQDN domain formatting and port ranges (1 - 65535).
  - Checks whether the desired port is already occupied by an existing route before saving.
  - Interactive DNS helper automatically prompts: `Add an A record for <domain> on DNS with target @ IP <SERVER_PUBLIC_IP>` with a one-click copy button.
- **🛡️ Fortified Security Protections**:
  - **SQL Injection**: Parameterized SQL queries via Drizzle ORM.
  - **Command Injection**: Zero shell executions; uses native Node.js `dns.promises` and `fetch`.
  - **XSS & CSRF**: Strict CSP, SameSite session cookies, and output sanitization.
  - **Network Isolation**: PostgreSQL database port is never exposed to the host machine.
- **📊 Observability & Health**:
  - Structured logging with **Winston Logger**, masking all secrets, passwords, and tokens.
  - Dedicated Health Page (`/health`) and JSON endpoint (`/api/health`).
  - Public System Status Page (`/status`).

---

## 🏗️ Architecture

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Login & Access-Denied pages
│   ├── dashboard/            # Overview, Domains, and User Management
│   ├── health/               # System & Database Diagnostics
│   ├── status/               # Public Status Page
│   └── api/                  # Auth, Health, and Domain probe API routes
├── components/
│   ├── ui/                   # Shadcn UI primitives (Button, Card, Dialog, Table, etc.)
│   ├── layout/               # Header, Navigation, and User Menu
│   ├── domains/              # AddDomainModal & DomainStatusCard (Socket.IO)
│   └── users/                # UserManagementTable (Access toggles & Roles)
├── features/
│   ├── domains/              # Server Actions & Zod schemas for domains
│   └── users/                # Server Actions for user approvals & roles
├── server/
│   ├── db/                   # Drizzle ORM schema & Postgres client
│   ├── repositories/         # DomainRepository & UserRepository
│   ├── services/             # CaddyService, DomainService, UserService, DnsService
│   ├── socket.ts             # Socket.IO daemon for live streaming
│   └── auth.helper.ts        # Server-side authorization & session guards
├── lib/
│   ├── auth.ts               # Better Auth configuration
│   ├── auth-client.ts        # Better Auth React client
│   ├── logger.ts             # Winston structured logger with data masking
│   ├── env.ts                # Zod environment variable validator
│   └── utils.ts              # Styling & formatting utilities
└── server.ts                 # Custom HTTP Server running Next.js + Socket.IO
```

---

## 🐳 Docker Deployment

The entire stack spins up with Docker Compose:

1. **`db`**: PostgreSQL 16 (internal only on `caddy-manager` network; no host port forwarded).
   - User: `ServerCaddy`
   - Password: `your_db_password`
   - Database: `caddy_manager`
2. **`caddy`**: Caddy 2 Reverse Proxy with ports `80` and `443` bound to the host.
3. **`app`**: Next.js App + Socket.IO server.

### Quick Start:

1. Configure your environment in `.env`:
   ```bash
   cp .env.example .env
   ```
2. Set your Google OAuth credentials in `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   CADDY_MANAGER_USER_EMAIL=you@gmail.com
   SERVER_PUBLIC_IP=your_server_ip
   ```
3. Start the containers:
   ```bash
   docker compose up -d
   ```
4. Access the web interface at `http://localhost` (or your configured `CADDY_MANAGER_DOMAIN`).

---

## 🛠️ Local Development (Without Docker)

If you wish to run the app directly on your local machine:

1. Ensure a PostgreSQL database is running with your credentials.
2. Push database schema:
   ```bash
   npm run db:push
   ```
3. Start the combined Next.js + Socket.IO server:
   ```bash
   npm run dev
   ```
4. Navigate to `http://localhost:3000`.

---

## 🔒 Security Hardening

| Attack Vector | Defense Mechanism |
|---|---|
| **SQL Injection** | Parameterized queries with Drizzle ORM |
| **Command Injection** | Zero shell `exec` calls; native Node.js DNS resolution and fetch |
| **XSS** | React output escaping & strict CSP headers |
| **CSRF** | SameSite cookies & Better Auth security tokens |
| **Database Exposure** | PostgreSQL container has NO exposed host port mappings |
| **Unauthorized Access** | Server-side `isAccess` checks & administrator-gated role controls |
