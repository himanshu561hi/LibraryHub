# Library Hub Nawalpur

> Official web platform for **Library Hub Nawalpur** — A calm, disciplined, student-focused self-study library located on Main Road, Nawalpur (Opposite Kali Mandir), Salempur, Deoria, Uttar Pradesh.

---

## Project Architecture (Monorepo)

The repository is structured as a clean separation of concerns, separating the active React.js frontend from the future backend API service:

```text
Library-Hub-Nawalpur/
├── frontend/                     # React.js application
│   ├── public/                   # Static public assets (favicon, manifest)
│   ├── src/
│   │   ├── assets/               # Images, icons, and wallpapers
│   │   │   ├── images/           # Authentic study desk photos, banners, logos
│   │   │   └── icons/            # Brand and custom SVG icons
│   │   ├── components/
│   │   │   ├── common/           # Universal UI components (Buttons, Badges, Cards)
│   │   │   ├── layout/           # Fixed Header, Navigation, Footer, Layout
│   │   │   └── home/             # Homepage-specific components
│   │   ├── data/                 # Centralized business datasets (plans, faqs, reviews)
│   │   ├── hooks/                # Custom React hooks
│   │   ├── pages/                # Route views (Home, About, Facilities, Membership, etc.)
│   │   ├── services/             # Future API client & endpoint contracts
│   │   │   ├── api/              # Base fetch client and API endpoint registry
│   │   │   └── index.js
│   │   ├── styles/               # Global Tailwind CSS and typography rules
│   │   ├── utils/                # Utility helpers (currency formatting, link builders)
│   │   ├── App.jsx               # React Router layout tree
│   │   └── main.jsx              # Vite entry point
│   ├── .env.example              # Environment variables template
│   ├── index.html                # HTML document entry
│   ├── package.json              # Frontend dependencies and scripts
│   ├── postcss.config.js         # PostCSS configuration
│   ├── tailwind.config.js        # Custom Tailwind design tokens & font families
│   ├── vite.config.js            # Vite configuration with chunk splitting & @ alias
│   └── README.md                 # Frontend-specific documentation
│
├── backend/                      # Reserved directory for future Backend API service
│   └── .gitkeep
│
├── .gitignore                    # Monorepo-wide Git ignore rules
└── README.md                     # Root project guide
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Frontend Setup

All frontend source code resides inside the `frontend/` directory.

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start local development server
npm run dev
```

The frontend will start locally at **`http://localhost:3000`**.

### 2. Environment Configuration

Copy the example environment configuration in the `frontend/` directory:

```bash
cp frontend/.env.example frontend/.env
```

Default configuration in `frontend/.env`:

```env
# Future backend API endpoint
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Available Frontend Scripts

Run these commands from inside the `frontend/` folder:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server on `http://localhost:3000` |
| `npm run build` | Builds optimized production bundle into `frontend/dist/` |
| `npm run preview` | Previews the production build locally |

---

## Future Backend Roadmap

The `backend/` directory is prepared for future server-side implementation:

- RESTful API service (Express.js, Fastify, Python/FastAPI, or Go).
- Database integration (PostgreSQL, MongoDB, or Cloud Firestore).
- Student registration, seat reservation management, and admin dashboard.
- The frontend already includes a centralized service architecture in `frontend/src/services/` configured to consume `VITE_API_BASE_URL`.

---

## Business Information

- **Name**: Library Hub Nawalpur
- **Location**: Main Road, Nawalpur (Opposite Kali Mandir), Salempur, Deoria, Uttar Pradesh – 274509
- **Phone**: [+91 89339 08027](tel:+918933908027)
- **Instagram**: [@libraryhub.in](https://www.instagram.com/libraryhub.in/)
- **Operating Hours**: 6:00 AM – 10:00 PM (All 7 Days Open)
