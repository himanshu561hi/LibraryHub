# 🚀 Vercel Backend Deployment Guide — Library Hub Nawalpur

This backend is fully pre-configured for serverless deployment on **Vercel** with:
- **Serverless Function Adapter** (`backend/api/index.js`)
- **Mongoose Serverless Connection Caching** (prevents connection pool exhaustion)
- **Vercel Cron Integration** (`backend/vercel.json` executes nightly auto check-out at 11:59 PM IST)
- **Automatic CORS** supporting both `*.vercel.app` and `*.netlify.app` frontend domains

---

## 📋 Step-by-Step Vercel Deployment Instructions

### Step 1: Push latest code to GitHub
Make sure all your latest changes are pushed to your GitHub repository (`himanshu561hi/LibraryHub`):
```bash
git push origin main
```

### Step 2: Import Project in Vercel
1. Log in to [vercel.com](https://vercel.com).
2. Click **"Add New..."** -> **"Project"**.
3. Select your GitHub repository: `LibraryHub` (or `himanshu561hi/LibraryHub`).

### Step 3: Configure Project Settings (IMPORTANT ⚠️)
In the Vercel project configuration screen:
1. **Project Name**: `library-hub-backend` (or your preferred name).
2. **Framework Preset**: Select **Other**.
3. **Root Directory**: Click **Edit** and select **`backend`**.
   *(This ensures Vercel reads `backend/package.json`, `backend/vercel.json`, and `backend/api/index.js`).*

### Step 4: Add Environment Variables in Vercel
Under the **Environment Variables** section, add the following key-value pairs:

| Variable Name | Recommended Value / Description |
|---|---|
| `NODE_ENV` | `production` |
| `TZ` | `Asia/Kolkata` |
| `MONGODB_URI` | `mongodb+srv://<username>:<password>@<cluster-url>/library_hub?retryWrites=true&w=majority` |
| `JWT_SECRET` | A secure random 64-character secret key (e.g. `openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGINS` | Your frontend production URL (e.g. `https://libraryhub.netlify.app,https://libraryhub.vercel.app`) |
| `EMAIL_MOCK_MODE` | `false` *(Set to `false` when using real Gmail/SMTP, or `true` for simulated sending)* |
| `SMTP_HOST` | `smtp.gmail.com` (or your SMTP host) |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | Your email address (e.g. `libraryhubnawalpur@gmail.com`) |
| `SMTP_PASS` | Your 16-character Gmail App Password |
| `EMAIL_FROM` | `"Library Hub Nawalpur" <noreply@libraryhub.in>` |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret |
| `MOCK_GOOGLE_AUTH` | `false` |
| `CRON_SECRET` | *(Optional)* A random secret to secure `/api/v1/jobs/auto-checkout` |

### Step 5: Click Deploy
Click the **"Deploy"** button. Vercel will install dependencies and deploy the backend as a Serverless Function in ~1 minute.

---

## 🔍 Verification After Deployment

Once deployed, Vercel will assign a URL like `https://library-hub-amber.vercel.app`.

### 1. Health Check
Open in your browser or run:
```bash
curl https://library-hub-amber.vercel.app/api/v1/health
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Library Hub API is running",
  "data": {
    "status": "healthy",
    "service": "library-hub-api",
    "version": "1.0.0"
  }
}
```

### 2. Database Readiness Check
```bash
curl https://<your-backend-domain>.vercel.app/api/v1/health/ready
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "status": "ready",
    "database": "connected"
  }
}
```

### 3. Vercel Cron Job (11:59 PM IST Auto Check-out)
In your Vercel Dashboard, navigate to the **"Cron Jobs"** tab.
You will see:
- Path: `/api/v1/jobs/auto-checkout`
- Schedule: `29 18 * * *` (18:29 UTC = 23:59:00 IST every night).

---

## 🔗 Connect Frontend to Vercel Backend

In your Frontend configuration (`frontend/.env` or in Netlify/Vercel Frontend Environment Variables):
```env
VITE_API_URL=https://<your-backend-domain>.vercel.app/api/v1
```
Re-deploy or rebuild the frontend, and it will immediately communicate with your Vercel-hosted backend.

