# Customer Feedback Portal

A full‑stack web application for collecting and managing customer feedback. Built with React (Vite), Node.js, Express, and MongoDB. This document includes complete setup and configuration steps for college submission.

## Features

- **User Authentication**: Sign up and login with JWT-based authentication
- **Feedback Submission**: Users can submit feedback with rating and detailed message
- **Feedback Management**: Users can view their own feedback
- **Admin Dashboard**: Admins can view all feedback and update status
- **Modern UI**: Responsive, SPA UX with protected routes

## Tech Stack

### Frontend
- React 18 (Vite)
- React Router DOM
- Axios
- CSS

### Backend
- Node.js + Express.js
- MongoDB (Mongoose)
- JWT (JSON Web Tokens)
- bcryptjs (password hashing)

## Project Structure

```
customer-feedback-portal/
│
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── controllers/
│   │   ├── authController.js
│   │   └── feedbackController.js
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT guard + admin guard
│   ├── models/
│   │   ├── User.js
│   │   └── Feedback.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── feedbackRoutes.js
│   ├── scripts/
│   │   ├── inspectDb.js          # Utility to inspect Mongo
│   │   └── promoteAdmin.js       # Promote an existing user to admin
│   └── utils/
│       └── generateToken.js
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Signup.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Home.jsx
│   │   │   └── Admin.jsx
│   │   └── services/
│   │       └── api.js            # Axios instance (baseURL: /api)
│   └── public/
│       └── index.html
│
├── docker-compose.mongo-express.yml # Optional MongoDB web UI (mongo-express)
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (or Atlas connection string)
- npm (or yarn)

### Environment Configuration

Create `backend/.env` with:
```env
# Match Vite dev proxy (see frontend/vite.config.js)
PORT=5001

# Local Mongo or Atlas URI
MONGODB_URI=mongodb://127.0.0.1:27017/customer-feedback-portal

# Use a strong, unique value in real deployments
JWT_SECRET=change-me-in-production

NODE_ENV=development
```

Optional `frontend/.env` (only needed if you disable the Vite proxy):
```env
# Example only; not required when using /api proxy
VITE_API_BASE_URL=http://localhost:5001/api
```

### Install and Run (Dev)

Backend:
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5001 (from PORT)
```

Frontend (in a new terminal):
```bash
cd frontend
npm install
npm run dev
# Opens http://localhost:3000 and proxies /api to http://localhost:5001
```

Health check: `GET http://localhost:5001/api/health`

### Build for Production

Frontend production build:
```bash
cd frontend
npm run build
```

The backend is already configured to serve the built SPA from `frontend/dist` when running in production. Start the server normally:
```bash
cd backend
npm start
```

## Admin Setup

Promote an existing user to admin using the script:
```bash
cd backend
# After the user has signed up with email you specify below
npm run promote-admin -- admin@example.com
```

Alternatively, update directly in Mongo:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Optional: Mongo Express (DB UI)

A convenience `docker-compose.mongo-express.yml` is provided to inspect your local MongoDB via a browser UI.

```bash
docker compose -f docker-compose.mongo-express.yml up -d
# Visit http://localhost:8081 (user: admin / pass: admin)
```

Note: This compose file assumes MongoDB is already running on your host at `127.0.0.1:27017`.

## API Endpoints

### Authentication
- `POST /api/auth/signup` — Register a new user
- `POST /api/auth/login` — Login user

### Feedback (Protected)
- `POST /api/feedback` — Create new feedback
- `GET /api/feedback/my-feedback` — Get the authenticated user's feedback
- `GET /api/feedback/:id` — Get feedback by ID
- `GET /api/feedback` — Get all feedback (Admin only)
- `PUT /api/feedback/:id/status` — Update feedback status (Admin only)

### Health
- `GET /api/health` — Server status

## Usage Flow

1. Sign up with name, email, password
2. Login to obtain JWT (stored automatically by the app)
3. Submit feedback (rating + message)
4. View your submitted feedback in Home
5. Promote your account to admin (optional) and manage all feedback in Admin

## Notes on Configuration

- Dev proxy: `frontend/vite.config.js` proxies `/api` to `http://localhost:5001`. Ensure your backend `PORT=5001` for a plug‑and‑play dev setup. If you prefer a different port, update either the `.env` or the proxy target accordingly.
- Axios base URL: Frontend uses relative `baseURL: '/api'` so it works in both dev (via proxy) and prod (same origin) without changes.

## Troubleshooting

- **Cannot login / 401 repeatedly**: Your token may have expired or is missing. Try logging out and back in. Ensure `JWT_SECRET` is set and consistent.
- **API requests failing in dev**: Confirm backend is on `http://localhost:5001` and Vite dev server shows the proxy. If not, align `PORT` or adjust `frontend/vite.config.js` proxy target.
- **Mongo connection error**: Verify `MONGODB_URI` and that MongoDB is running. For Atlas, ensure IP access is allowed and the URI includes credentials and the database name.
- **Blank page in production**: Ensure you built the frontend (`npm run build` in `frontend`) and are serving the `frontend/dist` folder via the backend (`npm start` in `backend`).

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected routes via middleware
- Role-based (admin) authorization for sensitive endpoints

## Submission Info (College)

- Title: Customer Feedback Portal
- Objective: Build a full‑stack CRUD app with authentication and role‑based admin features
- Technologies: React (Vite), Node.js, Express, MongoDB (Mongoose), JWT, Axios
- How to run: See Quick Start and Environment Configuration
- Screens/Flows: Signup, Login, Home (user feedback list & submission), Admin (manage all feedback)

## License

This project is created for educational purposes.
