# Library Hub — Architectural & Engineering Decisions Log (ADR)

This document tracks all architectural, engineering, and security decisions made during the autonomous full-stack development of Library Hub Nawalpur.

---

## ADR-001: Monorepo Architecture with Strict Separation
- **Date**: 2026-11-04
- **Decision**: The project is structured with top-level `frontend/` and `backend/` directories, with root-level configuration (`netlify.toml`, `.gitignore`, `README.md`, `docs/`).
- **Rationale**: Keeps client-side React UI cleanly decoupled from server-side Node.js/Express APIs, enables independent CI/CD pipelines (e.g. Netlify for frontend, Render/Railway/VPS for backend), and prevents dependency leakage between browser and server environments.

---

## ADR-002: Integer Minor Currency Units (Paise)
- **Date**: 2026-11-04
- **Decision**: All financial amounts (fees, invoice balances, adjustments, payments) are stored as integer paise (`1 INR = 100 paise`).
- **Rationale**: Floating-point arithmetic in JavaScript and databases leads to IEEE 754 rounding errors (e.g., `0.1 + 0.2 !== 0.3`). Minor units ensure exact financial reconciliation and prevent rounding discrepancy in tax or partial payments.

---

## ADR-003: Student Google OAuth + Admin Email/Password
- **Date**: 2026-11-04
- **Decision**: Students authenticate strictly via verified Google ID tokens (server-side verification with `google-auth-library`), with fallback mock mode for local offline development. Admins authenticate via email + bcrypt hashed passwords without any public registration endpoint.
- **Rationale**: Students get frictionless one-tap sign-in with verified emails. Admins have strict access control with server-only CLI provisioning, rate-limiting, and brute-force protection.

---

## ADR-004: Joining-Date Anchored Billing Cycle with Month-End Clamping
- **Date**: 2026-11-04
- **Decision**: Invoices are generated recurringly based on the member's joining date (e.g. joined on 15th -> invoice recurs on the 15th of each month). For dates 29–31, dates are safely clamped to the last day of shorter months (e.g., Feb 28/29), while preserving the original anchor day for 31-day months.
- **Rationale**: Complies with core business rules. Fair to students by charging exactly per month of service rather than forcing calendar-month alignment.

---

## ADR-005: Daily Attendance Code with Midnight IST Rotation
- **Date**: 2026-11-04
- **Decision**: A cryptographically random alphanumeric code (6 characters) is generated for each library-local calendar date (`Asia/Kolkata`). Codes rotate at 00:00 IST via scheduled task and startup reconciliation.
- **Rationale**: Ensures only students physically present in the library reading hall can view and enter the code. Never exposed publicly; verified against hashed records in database.

---

## ADR-006: Asynchronous Non-Blocking Transactional Emails
- **Date**: 2026-11-04
- **Decision**: Email notifications (attendance confirmations, payment receipts) are dispatched via an asynchronous queue abstraction (`EmailService`).
- **Rationale**: Email delivery or SMTP network latency/failure must never roll back or block critical business transactions such as marking attendance or recording payments.

