# Library Hub — Autonomous Development Kit

This kit is the source of truth for developing Library Hub from the existing frontend into a full-stack library management platform.

## How to use with Antigravity

1. Open the existing Library Hub repository in Antigravity.
2. Copy `prompts/00-MASTER-AUTONOMOUS-PROMPT.md` into Antigravity first.
3. Ask Antigravity to read this entire `docs`/`phases` and `prompts` kit before changing code.
4. Execute the phase prompts in numerical order. Each prompt tells the agent to inspect the repository, make reasonable engineering decisions independently, implement, test, and update documentation.
5. Do not skip the audit or security phases.

> The prompts authorize autonomous decisions inside the local project. They do not authorize spending money, creating paid cloud resources, registering domains, sending real emails, changing production data, or publishing/deploying without the owner's explicit approval. Use local/dev configuration and safe mocks where credentials or external approvals are unavailable.

## Project principles

- Preserve the existing public frontend design, content, routes, and responsive behavior unless a change is required for integration or accessibility.
- Keep frontend and backend in separate top-level folders: `frontend/` and `backend/`.
- Do not delete files simply because they appear unused. Confirm references, build impact, and git history/status first; remove only confidently unused project-owned files.
- Never overwrite or delete user data, `.env` files, credentials, database contents, or uncommitted work.
- Never invent real credentials, OAuth client secrets, SMTP credentials, API keys, or production URLs.
- Build a production-minded, maintainable application with validation, authorization, audit trails, tests, and clear setup docs.
- Use the existing stack where practical. If the repository's actual stack differs, document and follow the existing stack rather than blindly replacing it.

## Confirmed business rules

1. Student sign-in: Google OAuth.
2. Admin sign-in: email + password; no public admin registration.
3. User and admin have separate dashboards and role-protected APIs.
4. Attendance: authenticated active members can mark one IN and one OUT per library-local day, using a daily code issued/displayed in the admin dashboard.
5. Daily attendance code rotates automatically at midnight in `Asia/Kolkata`. Old codes become invalid. Store only a secure hash where practical; never expose the code through public endpoints.
6. Attendance timestamps are server-generated and stored consistently (UTC); display in `Asia/Kolkata`.
7. Send a confirmation email after successful IN and successful OUT. Email failure must not undo attendance.
8. Billing cycle is based on each student's joining date, not the first day of the calendar month. Handle month-end dates safely (e.g. 29th–31st).
9. Deactivation is immediate: block new attendance and stop future invoice generation from the effective deactivation time/date. Preserve prior attendance, invoices, payments, and dues.
10. Payments are manually recorded by an authorized admin. Support partial payments and automatic outstanding-balance calculation.
11. Fee corrections, payment corrections, membership status changes, and manual attendance corrections must be auditable.
12. Admin can send individual and bulk emails to current and former users, with recipient filters, preview, confirmation, queueing, logs, and delivery status where provider webhooks support it.
13. Promotional email preferences/opt-outs must be respected. Essential transactional messages are treated separately.
14. Inactive users may sign in to view permitted historical records, but cannot mark attendance. Their dashboard clearly shows inactive membership.
15. Reactivation must be an explicit admin action with a defined new effective date/billing cycle; do not silently reactivate or create duplicate invoices.

## Suggested technology

- Frontend: retain the current React/Vite/Tailwind setup if present.
- Backend: Node.js + Express.
- Database: MongoDB + Mongoose.
- Authentication: Google OAuth (server-validated ID token or a secure OAuth flow), admin email/password with bcrypt/Argon2, secure session strategy.
- Email: provider abstraction with SMTP/Nodemailer or a transactional email provider configured by environment variables.
- Background jobs: reliable scheduled task for daily code rotation and billing invoice generation; ensure jobs are idempotent and safe across restarts/multiple instances.
- Security: input validation, rate limiting, secure cookies/tokens, CSRF protection where applicable, Helmet, CORS allowlist, RBAC, audit logging.

These are defaults, not permission to replace working dependencies without checking the existing project.

## Phase index

- Phase 00 — Repository audit, cleanup plan, and frontend/backend separation
- Phase 01 — Architecture, backend foundation, environment configuration
- Phase 02 — Database models, indexes, seed strategy
- Phase 03 — Authentication, authorization, account lifecycle
- Phase 04 — Student and admin dashboards
- Phase 05 — Membership lifecycle
- Phase 06 — Fees, invoices, manual payments
- Phase 07 — Daily-code attendance and IN/OUT
- Phase 08 — Transactional email and bulk email campaigns
- Phase 09 — Admin operations, reports, exports, audit logs
- Phase 10 — Security, testing, deployment readiness, handover

## Definition of done

A phase is not complete merely because code was written. It must include:
- implementation and integration;
- validation and error states;
- relevant automated tests;
- successful lint/build/test commands where configured;
- updated `.env.example` and documentation when needed;
- no committed secrets;
- a concise completion report listing files, decisions, tests, known limitations, and next phase.


---

# Library Hub — Architecture and Business Rules

## Roles
- Visitor: public website only.
- Student: authenticated Google account; own profile, membership, attendance history, invoices, payments.
- Admin: email/password; manages students, memberships, attendance, fees, payments, email campaigns, reports, settings.
- Optional super admin: only if multiple admin permission levels are genuinely needed.

## Core flows

### Student onboarding
1. Student signs in with Google.
2. Backend verifies Google identity.
3. User record is created/updated.
4. Account is not automatically granted active membership unless configured by the admin.
5. Admin creates/activates membership and sets joining date and fee.

### Membership
- Joining date is the billing anchor.
- Deactivation is immediate.
- Inactive user cannot mark attendance.
- Historical records and outstanding dues remain.
- Reactivation is explicit and audited.

### Billing
- Generate one invoice per membership billing period.
- Billing period follows joining-date anniversaries.
- Month-end date handling is clamped to last day of shorter months.
- Fee amount is snapshotted on invoice.
- Payments are entered manually by admin.
- Partial payments supported.
- Balance = invoice total + adjustments - successful payments.
- Deactivation stops future invoices, not existing dues.

### Attendance
- Daily code is valid for one library-local day.
- Rotation at 00:00 `Asia/Kolkata`.
- User must be authenticated, active, and provide valid code for IN and OUT.
- One IN and one OUT per user per local date.
- Server timestamp only.
- Email after successful IN/OUT.

### Bulk email
- Admin can target all users, active, inactive/former, selected, or individual users.
- Recipient list is snapshotted for each campaign.
- Recipients are not exposed to one another.
- Queue, retries, campaign history, and delivery event tracking.
- Promotional opt-outs respected.

## Suggested security boundaries
- Separate admin authentication namespace.
- Backend RBAC middleware on all privileged routes.
- Session/token rotation and revocation.
- Rate limit login, OAuth callback, attendance code verification, and bulk campaign creation.
- No public endpoint returns daily attendance code.
- Do not log credentials, raw attendance codes, or sensitive tokens.
- Append-only audit log for admin financial and membership actions.


---

# Phase Index

Run phases in this order. Each phase has a detailed implementation specification in `phases/` and an Antigravity execution prompt in `prompts/`.

- **Phase 00: Repository Audit and Restructure** — `phases/PHASE-00-REPOSITORY-AUDIT-AND-RESTRUCTURE.md`
- **Phase 01: Backend Foundation** — `phases/PHASE-01-BACKEND-FOUNDATION.md` | `prompts/PHASE-01-ANTIGRAVITY-PROMPT.md`
- **Phase 02: Database Models** — `phases/PHASE-02-DATABASE-MODELS.md` | `prompts/PHASE-02-ANTIGRAVITY-PROMPT.md`
- **Phase 03: Authentication and Access Control** — `phases/PHASE-03-AUTHENTICATION-AND-ACCESS-CONTROL.md` | `prompts/PHASE-03-ANTIGRAVITY-PROMPT.md`
- **Phase 04: Student and Admin Dashboards** — `phases/PHASE-04-DASHBOARDS.md` | `prompts/PHASE-04-ANTIGRAVITY-PROMPT.md`
- **Phase 05: Membership Lifecycle** — `phases/PHASE-05-MEMBERSHIP-LIFECYCLE.md` | `prompts/PHASE-05-ANTIGRAVITY-PROMPT.md`
- **Phase 06: Fees and Manual Payments** — `phases/PHASE-06-FEES-AND-MANUAL-PAYMENTS.md` | `prompts/PHASE-06-ANTIGRAVITY-PROMPT.md`
- **Phase 07: Attendance and Daily Code** — `phases/PHASE-07-ATTENDANCE-DAILY-CODE.md` | `prompts/PHASE-07-ANTIGRAVITY-PROMPT.md`
- **Phase 08: Email and Bulk Campaigns** — `phases/PHASE-08-EMAIL-AND-BULK-CAMPAIGNS.md` | `prompts/PHASE-08-ANTIGRAVITY-PROMPT.md`
- **Phase 09: Admin Reports and Audit** — `phases/PHASE-09-ADMIN-REPORTS-AND-AUDIT.md` | `prompts/PHASE-09-ANTIGRAVITY-PROMPT.md`
- **Phase 10: Security Testing and Deployment** — `phases/PHASE-10-SECURITY-TESTING-DEPLOYMENT.md` | `prompts/PHASE-10-ANTIGRAVITY-PROMPT.md`


---

# Phase 00 — Repository Audit and Safe Restructure

## Objective
Understand the existing Library Hub frontend, audit the repository, identify unused/dead code safely, and establish the requested top-level `frontend/` and `backend/` structure without damaging working functionality.

## Tasks
1. Inspect the full repository tree, package manifests, scripts, routes, components, assets, styles, environment usage, build configuration, deployment configuration, and git status.
2. Run existing install/build/lint/test commands where safe. Record current baseline.
3. Map every route and major user-facing feature. Identify static/mock data and future backend integration points.
4. Identify duplicate, unreachable, unused, or obsolete files. Prove they are unused through imports, route references, config references, and build checks before proposing deletion.
5. Move existing frontend code into `frontend/` while preserving package scripts and deployment/build behavior. Update paths/configuration only as required.
6. Create an initially minimal `backend/` scaffold only if Phase 01 will use it; do not invent application logic in this phase.
7. Update root README and create a migration/audit report.
8. Run frontend build after restructuring and compare behavior against baseline.

## Safety constraints
- Do not delete `.env`, `.env.local`, credentials, user-uploaded files, database files, or uncommitted user work.
- Do not run destructive git commands.
- Do not delete a file based only on its name or because it is not currently imported by one obvious file.
- If git status shows user changes, preserve them.
- If a move would break deployment, document the necessary deployment setting rather than guessing.

## Acceptance criteria
- Existing frontend builds successfully.
- Public routes and visual design are preserved.
- Frontend is under `frontend/`.
- Root documentation explains the new structure.
- Audit report lists removed files with evidence, retained questionable files, and outstanding risks.


---

# Phase 01 — Backend Foundation

## Objective
Create a maintainable Express backend connected to the frontend through a documented API contract.

## Tasks
- Inspect existing Node version, package manager, and conventions; use compatible versions.
- Set up Express app/server, centralized error handling, request logging, health endpoint, route versioning (`/api/v1`), and graceful shutdown.
- Add config validation at startup. Fail clearly when required environment variables are missing.
- Add MongoDB connection using Mongoose with connection lifecycle handling.
- Configure CORS using explicit allowed origins, Helmet, body size limits, rate limiting, and request validation strategy.
- Add `.env.example` with placeholders only; ensure secrets are ignored by git.
- Add API response/error conventions and API documentation.
- Add backend lint/test scripts and a basic health/DB integration test.
- Configure frontend API base URL via environment variables, without hardcoding production domains.

## Suggested endpoints
- `GET /api/v1/health`
- `GET /api/v1/health/ready`

## Acceptance criteria
- Backend starts in local development with valid environment values.
- Health endpoint reports service status without leaking secrets.
- MongoDB connection failure is handled clearly.
- CORS and security middleware are configured.
- No secrets are committed.


---

# Phase 02 — Database Models and Data Integrity

## Objective
Design MongoDB schemas that support users, admins, membership, attendance, billing, payments, email campaigns, and audit history.

## Required models
- User
- Admin
- Membership
- Attendance
- DailyAttendanceCode
- FeeInvoice
- Payment
- EmailCampaign
- EmailRecipientLog / EmailLog
- AuditLog
- SiteSetting
- EmailPreference (or equivalent fields on User)

## Design requirements
- Use schema validation, timestamps, normalized references, and appropriate indexes.
- Unique indexes must prevent duplicate Google identities, duplicate user email identities where appropriate, duplicate attendance per user/library-local date, and duplicate invoices for a membership billing period.
- Store timestamps in UTC; store explicit library-local date keys such as `YYYY-MM-DD` for attendance and billing periods.
- Store money as integer minor units (e.g. paise) or another explicitly documented exact-money representation; do not use floating-point arithmetic for financial totals.
- Invoice must snapshot the fee amount and billing period at generation time.
- Payment must reference the invoice and user, include amount, paidAt, method, optional receipt/reference, recordedBy admin, and correction/reversal metadata.
- Do not hard-delete financial or attendance history.
- Use indexes for common admin filters and user history.
- Add safe development seed scripts. Never seed a known/default production admin password.
- Document retention, backup, and migration strategy.

## Membership and billing semantics
- Joining date defines recurring billing anniversary.
- For dates 29–31, clamp to the last valid day of shorter months, then preserve the original anchor day for later months where appropriate. Document and test this rule.
- Deactivation is immediate. Preserve existing invoices and outstanding balances; do not generate future invoices after deactivation.
- Reactivation creates/updates a membership lifecycle event with explicit effective date. Prevent duplicate invoice periods.

## Acceptance criteria
- Schemas and indexes are implemented and tested.
- Billing date edge cases have tests.
- Financial arithmetic is exact.
- Data relationships and lifecycle are documented.


---

# Phase 03 — Authentication and Access Control

## Objective
Implement Google OAuth for students and secure email/password authentication for admins.

## Student authentication
- Use Google OAuth with server-side verification of Google ID tokens or a secure authorization-code flow.
- Validate issuer, audience/client ID, expiry, signature, and email verification.
- Create or update the user record safely; do not trust profile fields sent by the browser.
- Use secure, HttpOnly, SameSite cookies for sessions where applicable; configure Secure in production.
- Implement login, current-user, logout, and account linking policy.
- Never accept a client-supplied role.

## Admin authentication
- No public admin registration endpoint.
- Provision admins through a safe CLI/seed/invite mechanism that requires a secure password setup; never use a hardcoded default password.
- Hash passwords with bcrypt or Argon2.
- Add login throttling, generic authentication errors, session invalidation, and optional password reset flow if practical.
- Admin routes require admin role and active admin account.

## Authorization
- Roles: student/user, admin, optionally super_admin only if justified.
- Enforce RBAC on backend APIs, not just frontend route guards.
- Users can only access their own profile, attendance, invoices, and payments.
- Inactive users may view allowed historical records but cannot mark attendance.
- Log security-sensitive actions.

## Acceptance criteria
- Google tokens are verified server-side.
- Admin password is never stored in plaintext.
- No public admin signup.
- Role escalation and cross-user access tests pass.
- Logout invalidates the session.


---

# Phase 04 — Student and Admin Dashboards

## Objective
Create separate, responsive student and admin experiences while preserving the existing public website.

## Student dashboard
- Profile details and editable fields with validation.
- Membership status and dates.
- Attendance summary and history.
- Fee invoices, payments, outstanding balance, and receipts/records.
- Inactive membership banner and read-only historical view.
- Clear loading, empty, error, and access-denied states.

## Admin dashboard
- Summary cards: active members, inactive members, present today, currently checked in, pending dues, collections for selected period.
- Navigation for Students, Memberships, Attendance, Fees, Payments, Send Mail, Email History, Reports, Settings, and Audit Log.
- Search, filtering, pagination, sorting, and accessible tables.
- Admin dashboard values must come from authorized backend APIs, not hardcoded demo values.

## UI principles
- Follow the current Library Hub design system and responsive behavior.
- Reuse components and tokens.
- Avoid unnecessary redesign of the public site.
- Confirm destructive or financially significant actions in the UI.
- Make forms keyboard accessible and show field-level validation.

## Acceptance criteria
- Separate protected routes work.
- Backend data drives dashboard metrics.
- Mobile and desktop layouts are usable.
- Empty/loading/error states are implemented.


---

# Phase 05 — Membership Lifecycle

## Objective
Let admins manage current and former members without deleting historical data.

## Features
- Create/register a member and set joining date, monthly fee, contact details, and membership terms.
- Statuses: active, inactive; optional suspended status only if semantics are clearly defined.
- Immediate deactivation action with required reason and effective timestamp.
- On deactivation: immediately block attendance IN/OUT; stop future invoice generation; preserve existing invoices, payments, attendance, and outstanding dues.
- Allow admin reactivation with explicit effective date and billing restart behavior.
- Show membership lifecycle history and who performed each change.
- Support search/filter by active, inactive, joining date, and status.
- Prevent duplicate active membership records for the same user unless multi-membership is explicitly supported.

## Billing interaction
- Joining date anchors billing anniversaries.
- Existing invoice snapshots do not change when monthly fee is later edited.
- Fee changes apply to future invoices from a clearly recorded effective date.
- Deactivation does not erase debt or silently prorate/refund fees. Admin may record an explicit adjustment with audit reason if policy permits.

## Acceptance criteria
- Deactivation blocks attendance immediately at API level.
- Future invoice job skips inactive memberships.
- Reactivation is auditable and does not create duplicate invoices.
- Historical data remains accessible according to role.


---

# Phase 06 — Fees, Invoices, and Manual Payments

## Objective
Automate joining-date-based fee invoices and balances while keeping payment entry admin-controlled.

## Invoice rules
- Each membership has a joining-date billing anchor and configured monthly fee.
- Generate invoices for each active billing period idempotently.
- Use safe calendar arithmetic for joining dates 29, 30, and 31.
- Define invoice due date based on a configurable policy; if no policy exists, choose a sensible documented default and expose it in admin settings.
- Invoice stores period start/end, issue date, due date, fee snapshot, adjustments, amount paid, and balance.
- Statuses: unpaid, partially_paid, paid, overdue, void/adjusted only with audit.
- Do not create future invoices for inactive memberships.
- Existing unpaid invoices remain payable after deactivation.

## Manual payment entry
- Admin selects student/invoice, enters amount, payment date, method (cash, UPI, bank transfer, other), optional transaction/reference/receipt number, and notes.
- Validate amount is positive and does not exceed remaining balance unless an explicit advance/credit feature is implemented.
- Support multiple partial payments.
- Update invoice totals transactionally to avoid race conditions.
- Record admin actor and audit event.
- Corrections/reversals must be explicit, reasoned, and auditable; never silently edit financial history.
- User dashboard shows payment history and current outstanding balance.

## Reports
- Collection by day/month/custom period.
- Outstanding balances and overdue invoices.
- Student-wise ledger.
- Export CSV only after authorization and with safe spreadsheet-cell escaping.

## Acceptance criteria
- Exact currency arithmetic (paise/integer minor units).
- Duplicate invoice prevention.
- Partial-payment tests.
- Deactivated users retain unpaid dues.
- Report totals reconcile with payment ledger.


---

# Phase 07 — Daily-Code Attendance (IN/OUT)

## Objective
Implement secure attendance where an active authenticated member needs the current daily code to mark IN and OUT.

## Daily code
- Generate a cryptographically secure random code.
- Rotate at 00:00 `Asia/Kolkata`; previous code expires immediately.
- Use a reliable scheduler plus startup reconciliation so downtime does not leave yesterday's code active.
- Ensure only one current code per library-local date.
- Store a hash, not plaintext, where feasible. Admin UI may reveal the current code only to authorized admins.
- Never expose the code through public endpoints or logs.
- Rate-limit attempts and apply temporary lockout/backoff for repeated invalid attempts.
- Code must be required for both IN and OUT unless a later explicit policy says otherwise.

## Attendance rules
- Only authenticated active members can mark attendance.
- One IN and one OUT per user per library-local day.
- OUT requires a successful IN for that same day.
- Duplicate IN/OUT requests are idempotently rejected or return the existing state; never create duplicate records.
- Server generates timestamps. Ignore client-provided attendance timestamps.
- Enforce membership status and code validity inside the API transaction.
- Record code date/version used, but never the raw code.
- Admin manual corrections require reason and audit trail.
- Store UTC timestamps and a library-local date key.
- User receives confirmation email after successful IN and OUT. Email failure does not roll back attendance.

## UI
- User attendance page shows current state, code entry, IN/OUT action, and history.
- Admin page shows current code, rotation time, today's present, currently IN, completed sessions, and attendance filters.

## Acceptance criteria
- Midnight rotation tests for `Asia/Kolkata`.
- Expired/invalid code rejected.
- Inactive member blocked.
- Duplicate and out-before-in cases handled.
- Concurrent requests cannot create duplicate attendance.


---

# Phase 08 — Transactional Email and Bulk Email Campaigns

## Objective
Send attendance/payment/system emails and let admins send individual or bulk announcements to current and former users.

## Email provider
- Implement provider abstraction (SMTP/Nodemailer or transactional provider).
- Credentials come only from environment variables.
- Development mode uses a mock/logging provider or test inbox; never send real email during tests.
- Queue email jobs with retries, backoff, idempotency, and failure logging.
- Delivery/bounce status is only claimed when supported by provider webhooks/events.

## Transactional emails
- Successful attendance IN confirmation.
- Successful attendance OUT confirmation.
- Payment recorded confirmation/receipt notification if enabled.
- Membership status notifications if enabled.
- Use safe templates and escaped user-provided content.
- Email failure must not undo attendance or payment database transactions.

## Admin Send Mail section
- Recipient groups: all users (active + inactive/former), active users, inactive/former users, selected users, individual user.
- Show recipient count and sample recipients before sending.
- Compose subject and message using a safe rich-text or sanitized HTML editor.
- Plain-text alternative.
- Support attachments with size/type limits and safe storage; do not attach arbitrary server files.
- Personalization variables such as `{{name}}`, `{{email}}`, `{{membership_status}}`, `{{membership_end_date}}`.
- Preview rendered email for sample recipient.
- Require explicit final confirmation before dispatch.
- Send one message per recipient or use privacy-safe provider features; never expose recipient addresses to other recipients.
- Queue campaigns in batches with provider rate limits.
- Support pause/cancel for queued campaigns where feasible.
- Store campaign creator, audience definition, recipient snapshot/count, subject, content/template version, created/sent times, and per-recipient statuses.
- Respect promotional unsubscribe/preferences. Distinguish service/transactional mail from promotional announcements and do not bypass legal/provider opt-out requirements.
- Include unsubscribe mechanism for promotional campaigns where required.

## Email history
- Campaign list, audience, status, counts, created by, timestamps.
- Per-recipient sent/delivered/failed/bounced where provider reports it.
- Retry failed recipients safely without duplicating successful sends.

## Acceptance criteria
- Test mode cannot accidentally send live emails.
- Bulk recipient privacy is preserved.
- Former users can be included when permitted.
- Unsubscribe preferences are enforced.
- Campaign and recipient logs are auditable.


---

# Phase 09 — Admin Operations, Reports, and Audit

## Objective
Complete operational tools for day-to-day library administration.

## Admin operations
- Student search, filters, pagination, profile detail.
- Membership activation/deactivation/reactivation with reason and effective date.
- Attendance review and authorized corrections.
- Invoice/payment ledger and adjustments with audit.
- Bulk email campaign management and history.
- Site settings and fee policy settings.

## Reports
- Daily/monthly attendance.
- Currently checked-in members.
- Active/inactive membership lists.
- Fee collection and outstanding dues.
- Student account statement.
- Export CSV with authorization and formula-injection protection.

## Audit log
Capture actor, action, target entity, timestamp, request context where appropriate, before/after summary (avoid secrets), and reason for sensitive actions.
Audit logs should be append-only through application APIs.

## Acceptance criteria
- Admin can perform routine operations without direct database edits.
- Reports reconcile with source records.
- Sensitive changes are auditable.
- Exports are permission-protected.


---

# Phase 10 — Security, Testing, Deployment Readiness, and Handover

## Objective
Verify the complete platform, fix defects, and prepare deployment documentation.

## Security checklist
- Server-side Google OAuth verification.
- Secure admin password hashing and login throttling.
- RBAC on every protected API.
- User data isolation; no IDOR/cross-user access.
- Secure cookie/session configuration and CSRF protection where applicable.
- CORS allowlist, Helmet, request size limits, rate limits.
- Input validation and output encoding/sanitization.
- No secrets in source, logs, client bundles, or git.
- Secure upload handling if attachments exist.
- Daily code is not exposed publicly and is rate-limited.
- Financial operations are transactional and auditable.
- Email campaigns enforce recipient privacy and opt-out.
- Backups and restore procedure documented.

## Test checklist
- Unit tests for billing date calculations, money arithmetic, invoice generation, membership state transitions, daily code validity/rotation.
- Integration tests for OAuth, admin login, role permissions, attendance IN/OUT, payments, deactivation, email queue.
- Frontend tests for key flows and protected routes.
- Build/lint/test all packages.
- Accessibility and responsive smoke tests.
- Test edge cases: month-end joining dates, timezone midnight, duplicate/concurrent requests, partial payments, deactivation with outstanding dues, reactivation, email provider failure.

## Deployment readiness
- Document required environment variables.
- Document MongoDB setup and indexes.
- Document Google OAuth authorized origins/redirect URIs.
- Document email provider setup and webhook configuration.
- Document job scheduling strategy and single-runner/lock behavior.
- Document frontend/backend deployment and CORS.
- Document backup/restore and monitoring.
- Do not create paid resources, modify DNS, deploy, or send real email without owner approval.

## Handover report
Include architecture, setup steps, commands, environment variable list, implemented features, test results, deployment steps, known limitations, and recommended next steps.


---

# MASTER PROMPT — Library Hub Full-Stack Development

You are the lead software architect, senior full-stack engineer, QA engineer, and security reviewer responsible for completing the existing Library Hub project.

## Your operating mode
Work autonomously. Do not ask the owner routine questions or seek approval for normal engineering decisions. Make sensible, secure, maintainable decisions based on the existing codebase and the requirements in this kit. If a detail is unspecified, choose a conventional default, document the decision, and continue. Do not stop at planning: implement, test, fix, and document.

You must not ask permission for ordinary local code edits, file creation, refactoring, dependency setup, tests, or safe cleanup. However, never perform actions that create external costs or irreversible external effects without approval: paid service provisioning, production deployment, DNS/domain changes, sending real emails, modifying production databases, purchasing services, or deleting user data/credentials. Use local mocks and placeholders until configured.

## First actions
1. Read `README.md` and every file under `phases/` and `prompts/`.
2. Inspect the repository and git status before editing.
3. Identify the actual frontend stack and preserve it where practical.
4. Create/maintain `frontend/` and `backend/` top-level structure.
5. Produce a concise implementation plan and then immediately begin Phase 00.
6. Execute phases in order. Do not claim a phase is complete without tests/build evidence.

## Product scope
Build Library Hub as a full-stack library management platform with:
- existing public Library Hub website retained;
- Google OAuth student login;
- separate admin email/password login, no public admin registration;
- separate student and admin dashboards;
- student profile and account history;
- membership lifecycle: active/inactive, immediate deactivation, audited reactivation;
- joining-date-based recurring fee invoices;
- admin-only manual payment recording, partial payments, outstanding balances, receipts/history;
- daily attendance code rotating at 00:00 `Asia/Kolkata`;
- authenticated active members mark one IN and one OUT per local day using current daily code;
- attendance confirmation emails for IN and OUT;
- admin attendance monitoring and audited corrections;
- dedicated Send Mail section for individual, selected, active, inactive/former, or all users;
- safe bulk email queue, personalization, attachments with restrictions, campaign history and provider delivery events;
- reports, exports, audit logs, settings, security, tests, and deployment documentation.

## Non-negotiable business rules
- Billing cycle anchored to each membership joining date, not calendar month.
- Deactivation is immediate and blocks attendance immediately.
- Deactivation stops future invoices but does not erase old invoices, payments, attendance, or unpaid dues.
- Admin manually records payments; system calculates balances automatically.
- Former/inactive users remain in database and can be selected for permitted bulk email.
- Student login is Google OAuth; admin login is email/password.
- Attendance code rotates at midnight India time; previous code expires.
- IN and OUT both require valid current code.
- One IN and one OUT per user per library-local date.
- Send confirmation email after successful IN and OUT; email failure never rolls back attendance.
- Bulk email supports all users including inactive/former users, active-only, inactive-only, selected, and individual recipients.
- Preserve existing public frontend design and functionality.

## Engineering rules
- Inspect before replacing. Do not blindly rewrite the application.
- Do not delete code unless references and build checks confirm it is safe.
- Never remove or overwrite `.env`, user data, uncommitted changes, credentials, or database contents.
- Do not hardcode secrets or default admin passwords.
- Use exact money representation (integer paise or documented decimal library), not floating point.
- Store timestamps in UTC and use `Asia/Kolkata` for library business-day logic/display.
- Validate every input server-side.
- Enforce authorization on backend routes, not only in React.
- Use transactions/atomic operations for payment and attendance concurrency where supported.
- Make scheduled jobs idempotent and safe on restart/multiple instances.
- Use queueing/retries for email; never claim delivery unless provider confirms it.
- Use safe test email provider by default.
- Add automated tests for business-critical logic.
- Keep `.env.example` current and secrets out of git.
- Document all assumptions and decisions in `docs/DECISIONS.md`.

## Required deliverables
- Working `frontend/` and `backend/`.
- Updated root README.
- `docs/` architecture, API, setup, environment, deployment, security, and decision docs.
- Phase completion reports under `docs/phase-reports/`.
- `.env.example` files with placeholders.
- Automated tests and passing build/lint/test results.
- Final handover report with exact commands and remaining external setup requirements.

## Execution protocol
For each phase:
1. Read its phase specification.
2. Inspect relevant existing code.
3. Implement the complete phase, not just scaffolding.
4. Add/update tests.
5. Run tests, lint, and build.
6. Fix failures caused by your changes.
7. Update documentation and phase report.
8. Continue to the next phase without waiting for user confirmation.

If a required credential or external integration is unavailable, implement the full provider abstraction and safe development mock, document exact setup steps, and continue. Do not block the rest of the project.

At the end, perform an end-to-end review of all flows and produce a final report. Do not state that OAuth, email delivery, or production deployment is live until real credentials/configuration and a real verification test exist.


---

# Antigravity Prompt — Phase 01: Backend Foundation

You are continuing the Library Hub project. First read:
- `README.md`
- `prompts/00-MASTER-AUTONOMOUS-PROMPT.md`
- `phases/PHASE-01-BACKEND-FOUNDATION.md`
- prior phase reports under `docs/phase-reports/` if present.

Work autonomously. Do not ask routine questions or wait for approval for local implementation decisions. Inspect the current repository and git status, preserve existing user work, implement this phase completely, add tests, run relevant tests/lint/build, fix issues, and update documentation. If a credential is missing, implement a safe mock/provider abstraction and continue.

Follow every requirement and acceptance criterion in `phases/PHASE-01-BACKEND-FOUNDATION.md`. Respect all business rules in the master prompt and README.

Do not create paid resources, deploy to production, change DNS, send real emails, modify production data, or delete user data/credentials without explicit approval.

When finished, create/update `docs/phase-reports/PHASE-01-REPORT.md` with:
1. What was implemented.
2. Key architecture and engineering decisions.
3. Files created/modified.
4. Tests/build/lint commands and exact results.
5. Known limitations or external configuration still needed.
6. Confirmation that acceptance criteria were checked.

Then proceed to the next phase in numerical order automatically, unless all phases are complete.


---

# Antigravity Prompt — Phase 02: Database Models

You are continuing the Library Hub project. First read:
- `README.md`
- `prompts/00-MASTER-AUTONOMOUS-PROMPT.md`
- `phases/PHASE-02-DATABASE-MODELS.md`
- prior phase reports under `docs/phase-reports/` if present.

Work autonomously. Do not ask routine questions or wait for approval for local implementation decisions. Inspect the current repository and git status, preserve existing user work, implement this phase completely, add tests, run relevant tests/lint/build, fix issues, and update documentation. If a credential is missing, implement a safe mock/provider abstraction and continue.

Follow every requirement and acceptance criterion in `phases/PHASE-02-DATABASE-MODELS.md`. Respect all business rules in the master prompt and README.

Do not create paid resources, deploy to production, change DNS, send real emails, modify production data, or delete user data/credentials without explicit approval.

When finished, create/update `docs/phase-reports/PHASE-02-REPORT.md` with:
1. What was implemented.
2. Key architecture and engineering decisions.
3. Files created/modified.
4. Tests/build/lint commands and exact results.
5. Known limitations or external configuration still needed.
6. Confirmation that acceptance criteria were checked.

Then proceed to the next phase in numerical order automatically, unless all phases are complete.


---

# Antigravity Prompt — Phase 03: Authentication and Access Control

You are continuing the Library Hub project. First read:
- `README.md`
- `prompts/00-MASTER-AUTONOMOUS-PROMPT.md`
- `phases/PHASE-03-AUTHENTICATION-AND-ACCESS-CONTROL.md`
- prior phase reports under `docs/phase-reports/` if present.

Work autonomously. Do not ask routine questions or wait for approval for local implementation decisions. Inspect the current repository and git status, preserve existing user work, implement this phase completely, add tests, run relevant tests/lint/build, fix issues, and update documentation. If a credential is missing, implement a safe mock/provider abstraction and continue.

Follow every requirement and acceptance criterion in `phases/PHASE-03-AUTHENTICATION-AND-ACCESS-CONTROL.md`. Respect all business rules in the master prompt and README.

Do not create paid resources, deploy to production, change DNS, send real emails, modify production data, or delete user data/credentials without explicit approval.

When finished, create/update `docs/phase-reports/PHASE-03-REPORT.md` with:
1. What was implemented.
2. Key architecture and engineering decisions.
3. Files created/modified.
4. Tests/build/lint commands and exact results.
5. Known limitations or external configuration still needed.
6. Confirmation that acceptance criteria were checked.

Then proceed to the next phase in numerical order automatically, unless all phases are complete.


---

# Antigravity Prompt — Phase 04: Student and Admin Dashboards

You are continuing the Library Hub project. First read:
- `README.md`
- `prompts/00-MASTER-AUTONOMOUS-PROMPT.md`
- `phases/PHASE-04-DASHBOARDS.md`
- prior phase reports under `docs/phase-reports/` if present.

Work autonomously. Do not ask routine questions or wait for approval for local implementation decisions. Inspect the current repository and git status, preserve existing user work, implement this phase completely, add tests, run relevant tests/lint/build, fix issues, and update documentation. If a credential is missing, implement a safe mock/provider abstraction and continue.

Follow every requirement and acceptance criterion in `phases/PHASE-04-DASHBOARDS.md`. Respect all business rules in the master prompt and README.

Do not create paid resources, deploy to production, change DNS, send real emails, modify production data, or delete user data/credentials without explicit approval.

When finished, create/update `docs/phase-reports/PHASE-04-REPORT.md` with:
1. What was implemented.
2. Key architecture and engineering decisions.
3. Files created/modified.
4. Tests/build/lint commands and exact results.
5. Known limitations or external configuration still needed.
6. Confirmation that acceptance criteria were checked.

Then proceed to the next phase in numerical order automatically, unless all phases are complete.


---

# Antigravity Prompt — Phase 05: Membership Lifecycle

You are continuing the Library Hub project. First read:
- `README.md`
- `prompts/00-MASTER-AUTONOMOUS-PROMPT.md`
- `phases/PHASE-05-MEMBERSHIP-LIFECYCLE.md`
- prior phase reports under `docs/phase-reports/` if present.

Work autonomously. Do not ask routine questions or wait for approval for local implementation decisions. Inspect the current repository and git status, preserve existing user work, implement this phase completely, add tests, run relevant tests/lint/build, fix issues, and update documentation. If a credential is missing, implement a safe mock/provider abstraction and continue.

Follow every requirement and acceptance criterion in `phases/PHASE-05-MEMBERSHIP-LIFECYCLE.md`. Respect all business rules in the master prompt and README.

Do not create paid resources, deploy to production, change DNS, send real emails, modify production data, or delete user data/credentials without explicit approval.

When finished, create/update `docs/phase-reports/PHASE-05-REPORT.md` with:
1. What was implemented.
2. Key architecture and engineering decisions.
3. Files created/modified.
4. Tests/build/lint commands and exact results.
5. Known limitations or external configuration still needed.
6. Confirmation that acceptance criteria were checked.

Then proceed to the next phase in numerical order automatically, unless all phases are complete.


---

# Antigravity Prompt — Phase 06: Fees and Manual Payments

You are continuing the Library Hub project. First read:
- `README.md`
- `prompts/00-MASTER-AUTONOMOUS-PROMPT.md`
- `phases/PHASE-06-FEES-AND-MANUAL-PAYMENTS.md`
- prior phase reports under `docs/phase-reports/` if present.

Work autonomously. Do not ask routine questions or wait for approval for local implementation decisions. Inspect the current repository and git status, preserve existing user work, implement this phase completely, add tests, run relevant tests/lint/build, fix issues, and update documentation. If a credential is missing, implement a safe mock/provider abstraction and continue.

Follow every requirement and acceptance criterion in `phases/PHASE-06-FEES-AND-MANUAL-PAYMENTS.md`. Respect all business rules in the master prompt and README.

Do not create paid resources, deploy to production, change DNS, send real emails, modify production data, or delete user data/credentials without explicit approval.

When finished, create/update `docs/phase-reports/PHASE-06-REPORT.md` with:
1. What was implemented.
2. Key architecture and engineering decisions.
3. Files created/modified.
4. Tests/build/lint commands and exact results.
5. Known limitations or external configuration still needed.
6. Confirmation that acceptance criteria were checked.

Then proceed to the next phase in numerical order automatically, unless all phases are complete.


---

# Antigravity Prompt — Phase 07: Attendance and Daily Code

You are continuing the Library Hub project. First read:
- `README.md`
- `prompts/00-MASTER-AUTONOMOUS-PROMPT.md`
- `phases/PHASE-07-ATTENDANCE-DAILY-CODE.md`
- prior phase reports under `docs/phase-reports/` if present.

Work autonomously. Do not ask routine questions or wait for approval for local implementation decisions. Inspect the current repository and git status, preserve existing user work, implement this phase completely, add tests, run relevant tests/lint/build, fix issues, and update documentation. If a credential is missing, implement a safe mock/provider abstraction and continue.

Follow every requirement and acceptance criterion in `phases/PHASE-07-ATTENDANCE-DAILY-CODE.md`. Respect all business rules in the master prompt and README.

Do not create paid resources, deploy to production, change DNS, send real emails, modify production data, or delete user data/credentials without explicit approval.

When finished, create/update `docs/phase-reports/PHASE-07-REPORT.md` with:
1. What was implemented.
2. Key architecture and engineering decisions.
3. Files created/modified.
4. Tests/build/lint commands and exact results.
5. Known limitations or external configuration still needed.
6. Confirmation that acceptance criteria were checked.

Then proceed to the next phase in numerical order automatically, unless all phases are complete.


---

# Antigravity Prompt — Phase 08: Email and Bulk Campaigns

You are continuing the Library Hub project. First read:
- `README.md`
- `prompts/00-MASTER-AUTONOMOUS-PROMPT.md`
- `phases/PHASE-08-EMAIL-AND-BULK-CAMPAIGNS.md`
- prior phase reports under `docs/phase-reports/` if present.

Work autonomously. Do not ask routine questions or wait for approval for local implementation decisions. Inspect the current repository and git status, preserve existing user work, implement this phase completely, add tests, run relevant tests/lint/build, fix issues, and update documentation. If a credential is missing, implement a safe mock/provider abstraction and continue.

Follow every requirement and acceptance criterion in `phases/PHASE-08-EMAIL-AND-BULK-CAMPAIGNS.md`. Respect all business rules in the master prompt and README.

Do not create paid resources, deploy to production, change DNS, send real emails, modify production data, or delete user data/credentials without explicit approval.

When finished, create/update `docs/phase-reports/PHASE-08-REPORT.md` with:
1. What was implemented.
2. Key architecture and engineering decisions.
3. Files created/modified.
4. Tests/build/lint commands and exact results.
5. Known limitations or external configuration still needed.
6. Confirmation that acceptance criteria were checked.

Then proceed to the next phase in numerical order automatically, unless all phases are complete.


---

# Antigravity Prompt — Phase 09: Admin Reports and Audit

You are continuing the Library Hub project. First read:
- `README.md`
- `prompts/00-MASTER-AUTONOMOUS-PROMPT.md`
- `phases/PHASE-09-ADMIN-REPORTS-AND-AUDIT.md`
- prior phase reports under `docs/phase-reports/` if present.

Work autonomously. Do not ask routine questions or wait for approval for local implementation decisions. Inspect the current repository and git status, preserve existing user work, implement this phase completely, add tests, run relevant tests/lint/build, fix issues, and update documentation. If a credential is missing, implement a safe mock/provider abstraction and continue.

Follow every requirement and acceptance criterion in `phases/PHASE-09-ADMIN-REPORTS-AND-AUDIT.md`. Respect all business rules in the master prompt and README.

Do not create paid resources, deploy to production, change DNS, send real emails, modify production data, or delete user data/credentials without explicit approval.

When finished, create/update `docs/phase-reports/PHASE-09-REPORT.md` with:
1. What was implemented.
2. Key architecture and engineering decisions.
3. Files created/modified.
4. Tests/build/lint commands and exact results.
5. Known limitations or external configuration still needed.
6. Confirmation that acceptance criteria were checked.

Then proceed to the next phase in numerical order automatically, unless all phases are complete.


---

# Antigravity Prompt — Phase 10: Security Testing and Deployment

You are continuing the Library Hub project. First read:
- `README.md`
- `prompts/00-MASTER-AUTONOMOUS-PROMPT.md`
- `phases/PHASE-10-SECURITY-TESTING-DEPLOYMENT.md`
- prior phase reports under `docs/phase-reports/` if present.

Work autonomously. Do not ask routine questions or wait for approval for local implementation decisions. Inspect the current repository and git status, preserve existing user work, implement this phase completely, add tests, run relevant tests/lint/build, fix issues, and update documentation. If a credential is missing, implement a safe mock/provider abstraction and continue.

Follow every requirement and acceptance criterion in `phases/PHASE-10-SECURITY-TESTING-DEPLOYMENT.md`. Respect all business rules in the master prompt and README.

Do not create paid resources, deploy to production, change DNS, send real emails, modify production data, or delete user data/credentials without explicit approval.

When finished, create/update `docs/phase-reports/PHASE-10-REPORT.md` with:
1. What was implemented.
2. Key architecture and engineering decisions.
3. Files created/modified.
4. Tests/build/lint commands and exact results.
5. Known limitations or external configuration still needed.
6. Confirmation that acceptance criteria were checked.

Then proceed to the next phase in numerical order automatically, unless all phases are complete.
