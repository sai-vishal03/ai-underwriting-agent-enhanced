# 🧠 AI Merchant Underwriting System (Production-Grade Fintech Simulation)

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748)
![Zod](https://img.shields.io/badge/Validation-Zod-3E67B1)
![License](https://img.shields.io/badge/License-MIT-green)

A production-grade underwriting and risk decisioning platform that simulates how fintech companies evaluate merchant creditworthiness, generate financial offers, and manage capital risk with full auditability.

Built to replicate real-world systems used by NBFCs, embedded finance platforms, and credit risk teams.

---

## 🏦 Why This Matters

Platforms like GrabOn sit on rich merchant transaction data but often underutilize it. This system demonstrates how:

- **Transaction Intelligence → Credit Underwriting**: Converting raw GMV and redemption data into loanable capital.
- **Behavioral Signals → Risk Pricing**: Using refund rates and customer loyalty to price insurance premiums dynamically.
- **Merchant Data → Financial Product Eligibility**: Automating the "Go/No-Go" decision for credit limits.

It simulates how fintech platforms convert siloed data into revenue-generating financial infrastructure.

---

## 🚀 What Makes This System Unique

- **Deterministic + Explainable AI**: Not a "black-box" model; every decision is backed by a generated Underwriting Memorandum with qualitative rationale.
- **Idempotent Financial Operations**: Prevents duplicate disbursements via `Idempotency-Key` headers—a critical fintech requirement.
- **Full Audit Trail**: Every sensitive state change is recorded with actor snapshots and IP tracking for compliance-ready design.
- **Background Settlement Pipeline**: Robust server-side settlement processing with row-level locking and retry logic.
- **Risk Committee AI**: Simulates human credit analysts with weighted confidence scoring (0–1) and multi-factor risk categorization.
- **Feature-Flag-Driven Architecture**: Decoupled feature rollouts using a typed flag system, ready for enterprise scale.

---

## 🎬 Demo Flow (2-Min Walkthrough)

1.  **Merchant Onboarding**: Upload a bulk batch of merchants via Excel/JSON or select from the database.
2.  **Engine Execution**: Run the global underwriting engine to generate credit/insurance tiers.
3.  **AI Analysis**: View the **AI Risk Committee memo** for a merchant (includes weighted confidence score).
4.  **Notification Strategy**: Trigger a WhatsApp simulation to notify the merchant of their new offer.
5.  **Offer Acceptance**: Merchant accepts the offer (Idempotency Key ensures no duplicate records).
6.  **Background Settlement**: Settlement job runs server-side to fulfill capital (Retry logic handles transient failures).
7.  **Platform Observability**: View the **Audit Trail**, **System Logs**, and **Global Metrics** dashboard.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  Next.js App Router │ React │ TanStack Query │ Recharts      │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐ ┌────────────┐   │
│  │ Login   │ │Dashboard │ │MerchantDetail│ │ Admin Panel│   │
│  │ (JWT)   │ │(Merchant │ │(Risk AI Memo)│ │(Bulk Upload│   │
│  │         │ │ List)    │ │              │ │ Logs, etc) │   │
│  └─────────┘ └──────────┘ └──────────────┘ └────────────┘   │
└─────────────────────┬────────────────────────────────────────┘
                      │ HTTPS / REST
┌─────────────────────▼────────────────────────────────────────┐
│                      MIDDLEWARE LAYER                         │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │Rate Limit│  │JWT Auth +    │  │Structured Request       │ │
│  │100/min/IP│  │RBAC Enforce  │  │Logging (logger.ts)      │ │
│  └──────────┘  └──────────────┘  └─────────────────────────┘ │
└─────────────────────┬────────────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────────────┐
│                       API ROUTES                             │
│  /api/auth/*     /api/merchants     /api/underwrite          │
│  /api/risk-review   /api/accept-offer (Idempotent)           │
│  /api/metrics    /api/cron/settlement   /api/notifications   │
│  /api/stats      /api/admin/*                                │
└─────────────────────┬────────────────────────────────────────┘
                      │ Zod Validation
┌─────────────────────▼────────────────────────────────────────┐
│                    SERVICE LAYER                             │
│  merchantService │ underwritingService │ settlementService   │
│  adminService    │ auditService        │                     │
└─────────────────────┬────────────────────────────────────────┘
                      │ Prisma ORM
┌─────────────────────▼────────────────────────────────────────┐
│                    PostgreSQL (Neon/Supabase)                 │
│  Merchant │ UnderwritingResult │ AcceptedOffer │ AuditLog    │
│  Notification │ SystemLog │ PlatformStat                     │
└──────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, TanStack React Query, Recharts, Lucide Icons |
| **Styling** | Tailwind CSS v4, Custom dark theme, Glassmorphism |
| **Backend** | Next.js API Routes, Zod validation, jose (JWT) |
| **Database** | PostgreSQL via Prisma ORM (Neon/Supabase compatible) |
| **Auth** | JWT (HTTP-Only cookies) + Role-Based Access Control |
| **Observability** | Structured JSON logging, `/api/metrics` endpoint |
| **Security** | Rate limiting (100 req/min/IP), Input validation, Idempotency keys |

---

## Key Features

### 🏦 Deterministic Underwriting Engine
- Multi-factor risk scoring algorithm (GMV trend, volatility, refund rates, customer retention)
- Probability of Default (PD), Loss Given Default (LGD), Expected Loss (EL), RAROC computation
- Credit tiering (Tier 1/2/3) with dynamic interest rate pricing

### 🤖 Risk Committee AI
- Automated underwriting memorandum generation
- **ML-style confidence score** (0–1 weighted composite of 5 risk signals)
- **Risk level classification** (LOW / MEDIUM / HIGH)
- GMV volatility coefficient analysis

### 🔐 Enterprise Security
- JWT authentication with HTTP-only secure cookies
- Role-Based Access Control (Admin / Viewer)
- API rate limiting (sliding window, 100 req/min per IP)
- Zod schema validation on all POST endpoints
- **Idempotency keys** on financial operations (prevent duplicate processing)

### 📊 Observability & Audit
- Structured JSON logging with correlation IDs
- **Audit trail table** — every sensitive action is recorded with actor, payload snapshot, and IP
- `/api/metrics` endpoint exposing underwriting counts, acceptance rates, tier distributions
- Feature flags system (environment-based, upgrade-ready for LaunchDarkly)

### ⚙️ Background Processing
- Idempotent settlement cron endpoint (`/api/cron/settlement`)
- Row-level locking via status transitions (pending → processing → completed)
- **Retry logic** with max retry count (3 attempts → failed)
- Dead-letter equivalent (`failed` status) for manual investigation

### 📦 Admin Workflows
- Bulk merchant upload (JSON / Excel .xlsx)
- Database reset with canonical seed data
- System log viewer with full audit trail
- Paginated & filtered merchant API (`page`, `limit`, `tier`)

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | JWT login (returns HTTP-only cookie) |
| POST | `/api/auth/logout` | Clear auth cookie |
| GET | `/api/auth/me` | Get current user info |

### Merchants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/merchants` | List merchants (paginated: `?page=1&limit=10&tier=Tier%201`) |
| POST | `/api/merchants` | Bulk upload (JSON body or multipart Excel) |
| GET | `/api/merchants/[id]` | Get single merchant with underwriting |

### Underwriting & Risk
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/underwrite` | Run underwriting engine on a merchant |
| POST | `/api/risk-review` | Generate AI risk memo with confidence score |

### Financial Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/accept-offer` | Accept credit/insurance offer (supports `Idempotency-Key` header) |
| GET | `/api/cron/settlement` | Process pending settlements (cron trigger) |

### Platform
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/metrics` | Platform KPIs and aggregated metrics |
| GET | `/api/stats` | Dashboard statistics |
| POST | `/api/notifications` | Send WhatsApp notification via Twilio |
| GET | `/api/admin/logs` | System audit logs |
| POST | `/api/admin/reset` | Reset database with seed data |
| GET | `/api/admin/export` | Export data as JSON |

---

## Database Schema

```
Merchant ──────────── 1:1 ──── UnderwritingResult
   │
   ├── 1:N ──── Notification
   │
AcceptedOffer (idempotencyKey UNIQUE)
   │
   └── status: pending → processing → completed
                                    → retry_pending → failed

AuditLog (action, actor, entity, payload_snapshot, timestamp)
SystemLog (legacy operational logs)
PlatformStat (singleton disbursement tracker)
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon or Supabase recommended)

### 1. Clone & Install

```bash
git clone https://github.com/your-repo/ai-underwriting-agent-grabon.git
cd ai-underwriting-agent-grabon
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
# Database (Neon / Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Authentication
JWT_SECRET="your-strong-random-secret-min-32-chars"

# Feature Flags (all default to true)
ENABLE_RISK_AI_V2=true
ENABLE_SETTLEMENT_CRON=true
ENABLE_STRICT_VALIDATION=true

# Optional: Twilio (WhatsApp notifications)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### 3. Initialize Database

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@grabon.in | admin123 |
| Viewer | viewer@grabon.in | viewer123 |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for JWT signing (min 32 chars) |
| `ENABLE_RISK_AI_V2` | ❌ | Toggle ML confidence scoring (default: true) |
| `ENABLE_SETTLEMENT_CRON` | ❌ | Toggle background settlement (default: true) |
| `ENABLE_STRICT_VALIDATION` | ❌ | Toggle strict Zod validation (default: true) |
| `TWILIO_ACCOUNT_SID` | ❌ | Twilio SID for WhatsApp |
| `TWILIO_AUTH_TOKEN` | ❌ | Twilio auth token |
| `TWILIO_WHATSAPP_FROM` | ❌ | Twilio WhatsApp sender number |

---

## Future Improvements

| Area | Upgrade Path |
|------|-------------|
| **Background Jobs** | BullMQ + Redis for dedicated worker processes with retry policies and dead-letter queues |
| **ML Models** | Replace deterministic scoring with trained ML models (XGBoost / LightGBM) for PD prediction |
| **Feature Flags** | Migrate to LaunchDarkly / Flagsmith for percentage-based rollouts and A/B testing |
| **Observability** | OpenTelemetry + Grafana/Datadog for distributed tracing and real-time alerting |
| **Database** | Read replicas for analytics queries, connection pooling via PgBouncer |
| **Settlement** | Temporal.io for complex multi-step settlement workflows with saga pattern |
| **Auth** | OAuth 2.0 / SSO integration for enterprise authentication |
| **API** | GraphQL layer for flexible client queries, API versioning (v1, v2) |

---

## Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database schema (PostgreSQL)
│   └── seed.ts                # Canonical seed data
├── src/
│   ├── app/
│   │   ├── api/               # All API routes
│   │   │   ├── auth/          # JWT login/logout/me
│   │   │   ├── merchants/     # CRUD + bulk upload
│   │   │   ├── underwrite/    # Underwriting engine
│   │   │   ├── risk-review/   # AI risk memo
│   │   │   ├── accept-offer/  # Idempotent offer acceptance
│   │   │   ├── cron/          # Background settlement
│   │   │   ├── metrics/       # Platform KPIs
│   │   │   └── admin/         # Reset, export, logs
│   │   └── page.tsx           # Main dashboard
│   ├── components/
│   │   ├── auth/              # AuthContext, LoginPage
│   │   └── dashboard/         # MerchantDetail, AdminPanel, etc.
│   ├── lib/
│   │   ├── services/          # Business logic layer
│   │   │   ├── merchantService.ts
│   │   │   ├── underwritingService.ts
│   │   │   ├── settlementService.ts
│   │   │   ├── adminService.ts
│   │   │   └── auditService.ts
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── logger.ts          # Structured JSON logging
│   │   ├── rate-limiter.ts    # IP-based rate limiting
│   │   ├── validators.ts      # Zod schemas
│   │   └── feature-flags.ts   # Environment-based flags
│   ├── middleware.ts           # Auth + rate limiting
│   └── types/index.ts         # TypeScript type definitions
└── package.json
```

---

## 🧠 Interview Talking Points

This project was built to demonstrate proficiency in senior-level software engineering and fintech domain knowledge:

- **Backend System Design**: Implementation of a service layer pattern to decouple API logic from business rules and database operations.
- **Fintech Risk Systems**: Understanding of credit risk metrics like **Probability of Default (PD)**, **Loss Given Default (LGD)**, and **RAROC**.
- **Production Patterns**: Mastery of critical system patterns like **Idempotent APIs**, **Audit Logging**, and **Background Job failure handling**.
- **Security & Compliance**: Implementing **RBAC**, **JWT isolation**, and **Rate Limiting** to protect sensitive financial data.
- **Observability**: Exposing platform health via custom **Metrics endpoints** and structured JSON logging.
- **AI Explainability**: Balancing LLM-based reasoning (Risk Memo) with deterministic scoring and **Weighted Confidence Scoring**.

**Ideal for roles in:**
- AI / LLM Engineer
- Senior Backend Engineer
- Fintech / Risk Systems Architect
- Applied AI / Prompt Engineering

---

## License

MIT

---

Built with ❤️ for the **GrabOn Vibe Coder Challenge 2025**
