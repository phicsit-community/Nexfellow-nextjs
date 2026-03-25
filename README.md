# Nexfellow

**Nexfellow** is a full-stack developer community platform built to connect developers, enable knowledge sharing, and foster collaboration through posts, communities, contests, events, quizzes, challenges, and real-time messaging.

> 🌐 Live at [nexfellow.com](https://nexfellow.com)

---

## 📁 Project Structure

```
Nexfellow-nextjs/
├── nexfellow-next/     # Next.js (App Router) frontend
├── backend/            # Express.js REST API + WebSocket server
├── client/             # Legacy React (Vite) frontend (reference)
├── admin/              # Admin panel
└── GeekMailer/         # Email service utility
```

---

## ✨ Features

- 🔐 **Authentication** — Email/password, Google, GitHub, Facebook, LinkedIn OAuth
- 📝 **Posts & Feed** — Create, like, bookmark, comment, and share posts with rich-text support
- 👥 **Communities** — Create and join developer communities with discussions and quizzes
- 🏆 **Contests & Challenges** — Participate in coding contests and streaks
- 📅 **Events** — Browse and attend tech events
- 🧠 **Quizzes** — Community-driven quizzes with leaderboards
- 🔔 **Notifications** — Real-time notification system
- 💬 **Direct Messages & Chat** — Real-time messaging with Socket.IO
- 📊 **Analytics & Leaderboard** — User activity tracking and popularity scoring
- 🔗 **URL Shortener** — Shareable short links for posts and profiles
- 💳 **Payments** — Razorpay integration for premium features
- 🛡️ **Admin Panel** — Separate admin dashboard for platform management
- 📣 **Broadcasts & Advertisements** — Platform-wide announcements
- 🗺️ **Room Heatmap** — Activity heatmap visualization per user

---

## 🛠 Tech Stack

### Frontend (`nexfellow-next/`)

| Category      | Technology                                               |
| ------------- | -------------------------------------------------------- |
| Framework     | [Next.js 16](https://nextjs.org/) (App Router)           |
| Language      | JavaScript (JSX)                                         |
| State         | Redux Toolkit                                            |
| Styling       | CSS Modules, Tailwind CSS v4, Styled Components          |
| UI Components | Radix UI, MUI, Ant Design, Lucide React, React Icons     |
| Animations    | Framer Motion, GSAP, Lottie                              |
| Charts        | Chart.js, Recharts, React Activity Calendar, UIW Heatmap |
| Forms         | React Hook Form + Zod                                    |
| Real-time     | Socket.IO Client                                         |
| HTTP Client   | Axios                                                    |
| Rich Text     | React Quill, React Markdown, DOMPurify                   |

### Backend (`backend/`)

| Category       | Technology                                              |
| -------------- | ------------------------------------------------------- |
| Framework      | [Express.js](https://expressjs.com/)                    |
| Database       | MongoDB + Mongoose                                      |
| Auth           | JWT, Passport.js (Google, GitHub, Facebook, LinkedIn)   |
| Real-time      | Socket.IO                                               |
| File Storage   | Cloudinary + Multer                                     |
| Email          | Nodemailer + Mailgen                                    |
| Caching        | ioRedis                                                 |
| Payments       | Razorpay                                                |
| Security       | Helmet, express-rate-limit, bcryptjs, express-validator |
| Scheduled Jobs | node-cron (post popularity scoring every 30 min)        |
| Logging        | Winston, Morgan                                         |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **MongoDB** (local or Atlas)
- **Redis** (for caching)
- **Cloudinary** account (for media uploads)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/Nexfellow-nextjs.git
cd Nexfellow-nextjs
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
# App
NODE_ENV=development
SECRET=your_session_secret

# Database
DB_URL=mongodb://localhost:27017/nexfellow

# JWT
JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Redis
REDIS_URL=redis://localhost:6379

# OAuth (Google)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OAuth (GitHub)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Payments (Razorpay)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# URLs
SITE_URL=http://localhost:3001
ADMIN_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
# Server runs on http://localhost:4000
```

---

### 3. Frontend Setup (Next.js)

```bash
cd nexfellow-next
npm install
```

Create a `.env.local` file in the `nexfellow-next/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

Start the development server:

```bash
npm run dev
# App runs on http://localhost:3001
```

---

## 📡 API Overview

The backend exposes the following REST API routes (all prefixed from `http://localhost:4000`):

| Prefix                      | Description                             |
| --------------------------- | --------------------------------------- |
| `/auth`                     | Authentication (login, register, OAuth) |
| `/user`                     | User profile and settings               |
| `/post`                     | Posts CRUD                              |
| `/comment`                  | Comments on posts                       |
| `/like`                     | Likes on posts/comments                 |
| `/bookmarks`                | Bookmark posts                          |
| `/community`                | Communities and membership              |
| `/community-quiz`           | Community quizzes                       |
| `/discussions`              | Community discussions                   |
| `/challenge`                | Coding challenges                       |
| `/task` & `/completedTasks` | Tasks and completion tracking           |
| `/event`                    | Events                                  |
| `/quiz`                     | Quizzes                                 |
| `/leaderboard`              | Platform leaderboard                    |
| `/notifications`            | User notifications                      |
| `/systemNotifications`      | System-wide notifications               |
| `/direct-messages`          | Direct messaging                        |
| `/search`                   | Global search                           |
| `/analytics`                | User analytics                          |
| `/payments`                 | Payment processing (Razorpay)           |
| `/advertisements`           | Advertisements                          |
| `/post-popularity`          | Post popularity scoring                 |
| `/blogs`                    | Blog management                         |
| `/report`                   | Content reporting                       |
| `/admin`                    | Admin-only routes                       |
| `/health`                   | Server health check                     |

---

## 🌐 Pages

| Page          | Route                 | Description                 |
| ------------- | --------------------- | --------------------------- |
| Home          | `/`                   | Landing / marketing page    |
| Feed          | `/feed`               | Personalized developer feed |
| Explore       | `/explore`            | Discover posts and users    |
| Community     | `/community`          | Browse and join communities |
| Contests      | `/contests`           | Coding contests             |
| Events        | `/events`             | Tech events                 |
| Leaderboard   | `/leaderboard`        | Top contributors            |
| Inbox         | `/inbox`              | Direct messages             |
| Notifications | `/notifications`      | User notifications          |
| Dashboard     | `/dashboard`          | User dashboard              |
| User Profile  | `/user/:id`           | Public user profile         |
| Settings      | `/settings`           | Account settings            |
| Blog          | `/blog`               | Developer blog              |
| Auth          | `/login`, `/register` | Authentication pages        |

---

## 🔄 Real-time Features

The backend uses **Socket.IO** for:

- Live notifications
- Real-time direct messaging and group chat
- Live activity feeds

The frontend connects via the `socket.io-client` library.

---

## 🏗️ Deployment

| Service  | Target                                                       |
| -------- | ------------------------------------------------------------ |
| Frontend | [Vercel](https://vercel.com) (`nexfellow-nextjs.vercel.app`) |
| Backend  | [Render](https://render.com) (`nexfellow-dark.onrender.com`) |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is proprietary. All rights reserved © Nexfellow.
