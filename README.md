# AlgoTrace 🏆

> A full-stack competitive programming analytics platform that aggregates your Codeforces and LeetCode performance data into a unified, beautiful dashboard.

![Tech Stack](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Tech Stack](https://img.shields.io/badge/Node.js-20-green?style=flat-square&logo=node.js)
![Tech Stack](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square&logo=postgresql)
![Tech Stack](https://img.shields.io/badge/Prisma-ORM-black?style=flat-square&logo=prisma)
![Deploy](https://img.shields.io/badge/Deploy-Vercel+Railway-black?style=flat-square)

## Features

- **GitHub OAuth** — one-click login, no passwords
- **Multi-platform sync** — connect Codeforces and LeetCode usernames
- **Rating history chart** — visualize your rating trend over time
- **Topic heatmap** — discover your weakest problem categories
- **Contest history** — browse all past contests with rank and rating change
- **Solve streak tracker** — daily problem-solving streak calendar
- **Performance insights** — peak solve hours, difficulty distribution

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Chart.js, Axios |
| Backend | Node.js, Express.js, Passport.js |
| Database | PostgreSQL, Prisma ORM |
| Auth | GitHub OAuth 2.0, JWT + httpOnly refresh cookie |
| Deploy | Vercel (frontend), Railway (backend + DB) |

## Project Structure

```
algotrace/
├── backend/
│   ├── routes/          # Express route definitions
│   ├── controllers/     # Request handlers (thin layer)
│   ├── services/        # Business logic (CF API, LC API, aggregation)
│   ├── middleware/      # JWT verify, rate limiter, error handler
│   ├── prisma/          # schema.prisma + migrations
│   ├── server.js        # Express app entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/       # Dashboard, Login, Contests, Profile
    │   ├── components/  # Charts, layout, UI atoms
    │   ├── hooks/       # useAuth, useStats custom hooks
    │   ├── api/         # Axios instance + API functions
    │   └── utils/       # Data formatting helpers
    ├── index.html
    └── package.json
```

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ installed locally
- GitHub OAuth App (create at https://github.com/settings/developers)

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/algotrace.git
cd algotrace
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see .env.example)
npx prisma migrate dev --name init
npm run dev
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000
npm run dev
```

### 4. Open http://localhost:5173

## Deployment

### Backend → Railway
1. Push backend/ to a GitHub repo
2. Create new Railway project → Deploy from GitHub
3. Add PostgreSQL plugin in Railway
4. Set environment variables in Railway dashboard
5. Railway auto-deploys on push

### Frontend → Vercel
1. Push frontend/ to GitHub
2. Import repo on vercel.com
3. Set `VITE_API_URL` to your Railway backend URL
4. Deploy — Vercel auto-detects Vite

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

## Interview Talking Points

1. **Data normalization** — Codeforces and LeetCode have completely different API response formats. I built an AggregatorService that maps both into a unified internal schema.
2. **Rate limiting** — Implemented exponential backoff for API calls + sync cooldown to avoid hammering external APIs.
3. **Auth security** — JWT stored in memory (not localStorage), refresh token in httpOnly cookie to prevent XSS.
4. **Scalability** — Stateless backend (JWT) enables horizontal scaling. Redis caching and BullMQ job queue are the natural next steps.

## Author

Harsh Kumar— IIT (BHU) Varanasi, Civil Engineering BTECH
Expert @ Codeforces · 4★ @ Codechef

---
