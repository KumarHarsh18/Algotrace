# AlgoTrace

> A full-stack competitive programming analytics platform that aggregates your Codeforces and LeetCode performance data into a unified, beautiful dashboard.

![Tech Stack](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Tech Stack](https://img.shields.io/badge/Node.js-20-green?style=flat-square&logo=node.js)
![Tech Stack](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)
![Tech Stack](https://img.shields.io/badge/Prisma-ORM-black?style=flat-square&logo=prisma)
![Deploy](https://img.shields.io/badge/Deploy-Vercel+Railway-black?style=flat-square)

## Screenshots

### Dashboard
 <img width="1288" height="812" alt="login png" src="https://github.com/user-attachments/assets/cfce1d23-8cc5-48c6-9f63-77cea7df5346" />
### Analytics
  <img width="995" height="708" alt="analytics png" src="https://github.com/user-attachments/assets/033d9eb0-0b01-42b1-ab99-767ad26a34f4" />
### AI Performance Coach
<img width="1138" height="801" alt="ai-coach png" src="https://github.com/user-attachments/assets/a0315562-8fb5-4567-8c82-5adde8757603" />
<img width="1157" height="776" alt="ai-coach-plan png" src="https://github.com/user-attachments/assets/5d30f551-9eec-400d-aba2-824b0d59cc4b" />
## Features

- **GitHub OAuth** — one-click login with secure persistent sessions
- **Multi-platform sync** — connect Codeforces and LeetCode usernames
- **Rating history chart** — visualize your rating trend over time
- **Topic analysis** — analyze problem-solving patterns across different topics
- **Contest history** — browse past contests with rank and rating changes
- **Solve streak tracker** — track daily problem-solving activity
- **Performance insights** — analyze peak solve hours and difficulty distribution
- **AI performance analysis** — generate personalized strengths, weaknesses, topic recommendations, and 7-day practice plans using Google Gemini

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Chart.js, Axios |
| Backend | Node.js, Express.js, Passport.js |
| Database | PostgreSQL, Prisma ORM |
| Auth | GitHub OAuth 2.0, JWT + HTTP-only refresh cookie |
| External APIs | Codeforces, LeetCode, Google Gemini |
| Deploy | Vercel (frontend), Railway (backend + DB) |

## Project Structure

    algotrace/
    ├── backend/
    │   ├── routes/          # Express route definitions
    │   ├── controllers/     # Request handlers
    │   ├── services/        # Business logic, API integration, analytics
    │   ├── middleware/      # JWT verification and middleware
    │   ├── prisma/          # Prisma schema and migrations
    │   ├── server.js        # Express app entry point
    │   └── package.json
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── pages/       # Dashboard, Login, Contests, Profile
    │   │   ├── components/  # Charts, layout, and UI components
    │   │   ├── hooks/       # Custom React hooks
    │   │   ├── api/         # Axios instance + API functions
    │   │   └── utils/       # Data formatting helpers
    │   ├── index.html
    │   └── package.json
    │
    └── docs/
        └── screenshots/     # Project screenshots

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 15+ installed locally
- GitHub OAuth App
- Google Gemini API key

### 1. Clone the repo

    git clone https://github.com/KumarHarsh18/Algotrace.git
    cd Algotrace

### 2. Backend setup

    cd backend
    npm install
    cp .env.example .env

Configure the required environment variables in `.env`.

    npx prisma migrate dev
    npm run dev

### 3. Frontend setup

    cd ../frontend
    npm install
    cp .env.example .env

Set `VITE_API_URL` in the frontend `.env`:

    VITE_API_URL=http://localhost:5000

Then run:

    npm run dev

### 4. Open the application

http://localhost:5173

## Deployment

### Backend → Railway

1. Deploy the backend from GitHub
2. Create a Railway project
3. Add a PostgreSQL database
4. Configure the required environment variables
5. Run Prisma migrations
6. Deploy the backend

### Frontend → Vercel

1. Import the repository into Vercel
2. Set `VITE_API_URL` to your Railway backend URL
3. Deploy the frontend

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/github` | Initiate GitHub OAuth |
| GET | `/api/auth/github/callback` | OAuth callback, issue JWT |
| GET | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Clear refresh cookie |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/profiles` | Link CP username |
| POST | `/api/profiles/sync` | Fetch fresh data from APIs |
| GET | `/api/profiles` | Get linked platforms |
| DELETE | `/api/profiles/:id` | Unlink a platform |
| GET | `/api/stats/overview` | Dashboard summary |
| GET | `/api/stats/contests` | Contest history + rating |
| GET | `/api/stats/topics` | Tag-level breakdown |
| GET | `/api/stats/heatmap` | Daily solve calendar data |
| POST | `/api/ai/analyze` | Generate AI performance analysis |

## Important Points

1. **Data normalization** — Codeforces and LeetCode have completely different API response formats. AlgoTrace maps both into a unified internal schema.

2. **Rate limiting** — Implemented exponential backoff for API calls and sync cooldowns to avoid excessive requests to external APIs.

3. **Auth security** — JWT access tokens are stored in memory rather than localStorage, while refresh tokens are stored in HTTP-only cookies to reduce XSS exposure.

4. **Performance analytics** — A Prisma-based analytics pipeline aggregates contest and problem-solving data before sending compact performance statistics to the AI model.

5. **AI-powered coaching** — Integrated Google Gemini with the analytics pipeline to generate personalized strengths, weaknesses, recommended topics, and structured 7-day practice plans.

## Author

Harsh Kumar — IIT (BHU) Varanasi, Civil Engineering BTECH

Expert @ Codeforces · 4★ @ CodeChef

---
