# Library Hub Nawalpur — Full-Stack Management Platform

> Official web platform and management system for **Library Hub Nawalpur** — A calm, disciplined, student-focused self-study library located on Main Road, Nawalpur (Opposite Kali Mandir), Salempur, Deoria, Uttar Pradesh.

---

## Project Architecture (Full-Stack Monorepo)

The repository is structured with a strict separation of concerns:

```text
Library-Hub-Nawalpur/
├── frontend/                     # React.js application (Vite + Tailwind CSS + Framer Motion)
│   ├── public/                   # Static public assets (favicon, redirects, manifest)
│   ├── src/
│   │   ├── assets/               # Desk photos, brand banners, formulas background
│   │   ├── components/           # UI components (Header, Footer, FeatureCard, ProtectedRoute)
│   │   ├── context/              # AuthContext (Google OAuth & Admin session management)
│   │   ├── data/                 # Pricing plans, FAQs, real reviews, navigation
│   │   ├── pages/                # Public pages & Student/Admin Dashboards
│   │   │   ├── auth/             # LoginPage
│   │   │   ├── admin/            # AdminLoginPage, AdminDashboardPage
│   │   │   ├── student/          # StudentDashboardPage
│   │   │   └── ...               # HomePage, AboutPage, FacilitiesPage, etc.
│   │   ├── services/             # API Client & Endpoints registry
│   │   └── styles/               # Global typography and design tokens
│   ├── package.json              # Frontend scripts & dependencies
│   ├── vite.config.js            # Vite build configuration with chunking
│   └── .env.example              # Frontend environment variables template
│
├── backend/                      # Production Node.js + Express + MongoDB API service
│   ├── src/
│   │   ├── config/               # Environment & runtime configuration
│   │   ├── controllers/          # Auth, Dashboard, Membership, Billing, Attendance, Email, Admin
│   │   ├── middlewares/          # JWT auth, RBAC, rate limiter, validation, error handler
│   │   ├── models/               # 11 Mongoose Schemas (User, Membership, Attendance, FeeInvoice, etc.)
│   │   ├── routes/               # API route definitions
│   │   ├── services/             # Google Auth & Nodemailer abstraction
│   │   └── utils/                # Billing calculator, tokens, logger, daily code generator
│   ├── scripts/seed.js           # Database seeder for super admin & settings
│   ├── tests/                    # Jest automated test suites (30 tests)
│   ├── package.json              # Backend scripts & dependencies
│   └── .env.example              # Backend environment variables template
│
├── docs/                         # Architecture Decision Records (ADRs) & Phase Reports (00-10)
├── netlify.toml                  # Netlify deployment configuration for frontend
└── README.md                     # Root project guide
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas URI

---

### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend local development server runs at **`http://localhost:3000`**.

To build for production:

```bash
npm run build
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

To seed the initial super admin account and default site settings:

```bash
npm run seed
```

To run the backend server in development mode:

```bash
npm run dev
```

The backend API runs at **`http://localhost:5001/api/v1`**.

---

### 3. Automated Test Suite

Run all automated unit and integration tests for the backend (models, billing engine, OAuth, RBAC, attendance rules, CSV formula injection defense):

```bash
npm test --prefix backend
```

---

## Key Features

1. **Public Website**:
   - Modern, high-performance responsive site with desk photos, transparent pricing (Morning ₹600, Full Day ₹1000, Evening ₹600), real Google reviews, and mobile drawer.
2. **Student Member Portal (`/dashboard`)**:
   - Daily 6-character attendance code verification (Check IN & OUT).
   - Inactive membership protection (blocks daily attendance while preserving historical records).
   - Study logs, hours calculation, fee invoices, and payment receipts.
3. **Admin Console (`/admin`)**:
   - Live metrics: Active/inactive members, present today, inside library now, total dues, collections.
   - Daily Attendance Code widget with copy and reveal toggle.
   - Student & Membership directory with immediate deactivation (mandatory reason).
   - Real-time attendance monitor with manual correction audit trail.
   - Financial ledger: Invoices, partial payment recording, receipt generation, payment reversals.
   - Bulk email broadcast campaign manager with audience estimation (`ALL`, `ACTIVE`, `INACTIVE`) and preview.
   - Append-only audit trail logging all sensitive staff actions.
   - CSV reports export with formula-injection escaping (`=`, `+`, `-`, `@`).

---

## Deployment Configuration

### Frontend (Netlify)
The root `netlify.toml` file automatically builds from `frontend`:
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Redirects**: Single-page application fallback to `/index.html` with HTTP 200.

### Backend (Node.js Service)
- Deploy to Render, Railway, DigitalOcean App Platform, or Docker container.
- Supply environment variables from `backend/.env.example`.

---

## Business Information

- **Name**: Library Hub Nawalpur
- **Location**: Main Road, Nawalpur (Opposite Kali Mandir), Salempur, Deoria, Uttar Pradesh – 274509
- **Phone**: [+91 89339 08027](tel:+918933908027)
- **Instagram**: [@libraryhub.in](https://www.instagram.com/libraryhub.in/)
- **Operating Hours**: 24 Hours (All 7 Days Open · Day & Night Shifts)
