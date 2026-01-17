# GeekMailer

A full-stack email scheduling and management platform with Next.js frontend and Express.js backend.

## Features

- 📧 Send emails immediately or schedule them for later
- 📅 Set up recurring emails (daily, weekly, monthly, yearly)
- 📋 Manage contact lists
- 👥 Store and organize contacts
- 📊 Dashboard with email statistics

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit with redux-persist
- **Icons**: React Icons
- **Notifications**: Sonner

### Backend
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT + Cookies
- **Email Service**: Nodemailer
- **Scheduling**: node-cron

## Project Structure

```
GeekMailer/
├── frontend/                 # Next.js Frontend (Port 3000)
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # React components
│   │   └── lib/              # Store & utilities
│   ├── public/               # Static assets
│   ├── package.json
│   └── .env.local            # Frontend environment variables
│
├── backend/                  # Express.js Backend (Port 4040)
│   ├── controllers/          # API controllers
│   ├── models/               # MongoDB models
│   ├── routes/               # API routes
│   ├── services/             # Cron job scheduler
│   ├── middlewares/          # Auth middleware
│   ├── utils/                # Utility functions
│   ├── index.js              # Server entry point
│   ├── package.json
│   └── .env                  # Backend environment variables
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- MongoDB database (local or Atlas)

### Installation

1. Clone the repository and navigate to GeekMailer:
   ```bash
   cd GeekMailer
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd ../backend
   npm install
   ```

### Environment Setup

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4040
```

#### Backend (`backend/.env`)
```env
PORT=4040
SECRET=your_cookie_secret_here
DB_URI=your_mongodb_connection_string
SITE_URL=http://localhost:3000
```

## Development

**Run both frontend and backend in separate terminals:**

### Terminal 1 - Backend:
```bash
cd backend
npm start
```
Backend runs at: http://localhost:4040

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
Frontend runs at: http://localhost:3000

## Production Build

### Frontend:
```bash
cd frontend
npm run build
npm start
```

### Backend:
```bash
cd backend
npm start
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User authentication |
| `/api/home` | GET | Dashboard statistics |
| `/api/users` | GET | List all contacts |
| `/api/emails/admin/:adminId` | GET | Get admin's emails |
| `/api/emails/send-immediate` | POST | Send email immediately |
| `/api/emails/schedule` | POST | Schedule email |
| `/api/contact-lists/all` | GET | Get all contact lists |
| `/api/lists/admin/:adminId` | GET | Get admin's lists |

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set root directory to `frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL=<your-backend-url>`

### Backend (Railway/Render/Heroku)
1. Deploy the `backend` folder
2. Set environment variables: `PORT`, `SECRET`, `DB_URI`, `SITE_URL`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)

---

*Migrated from React/Vite to Next.js 16 + TypeScript on January 8, 2026*
