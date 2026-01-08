# Nexfellow Developer Quick Reference

**Last Updated:** January 8, 2026

---

## 🚀 Quick Start Commands

### Backend
```bash
cd backend
npm install
# Create .env file with required credentials
npm run dev          # Development with nodemon
npm start            # Production
```

### Client (Vite)
```bash
cd client
npm install
npm run dev          # Development (usually port 5173)
npm run build        # Production build
npm run preview      # Preview production build
```

### Admin Panel (Next.js)
```bash
cd admin
npm install
# Create .env.local with NEXT_PUBLIC_API_URL
npm run dev          # Development (port 3000)
npm run build        # Production build
npm start            # Production server
```

### Next.js Client
```bash
cd nexfellow-next
npm install
npm run dev          # Development
npm run build        # Production build
```

---

## 📁 Key File Locations

### Backend
```
backend/
├── index.js                          # Entry point
├── controllers/                      # Business logic (33 files)
│   ├── userController.js            # User management
│   ├── challengeController.js       # Challenge system
│   ├── communityQuizController.js   # Quiz system
│   └── ...
├── models/                          # Database schemas (38 files)
│   ├── userModel.js                # User schema
│   ├── challengeModel.js           # Challenge schema
│   └── ...
├── routes/                          # API routes
├── middleware.js                    # Auth & validation
└── .env                             # Environment variables
```

### Admin Panel
```
admin/
├── app/
│   ├── layout.tsx                   # Root layout
│   ├── providers.tsx                # Redux + Toast
│   ├── (auth)/login/                # Login page
│   └── (dashboard)/                 # All admin routes
│       ├── users/
│       ├── challenges/
│       ├── quiz/
│       └── ...
├── components/
│   ├── layout/                      # Navbar, Sidebar
│   ├── ui/                          # Reusable UI
│   └── challenges/                  # Challenge components
├── lib/
│   └── store/                       # Redux store
└── .env.local                       # Environment variables
```

### Client
```
client/src/
├── App.jsx                          # Root component
├── routes.jsx                       # Route definitions
├── Pages/                           # Page components (289+)
├── components/                      # Reusable components (470+)
├── store/                           # Redux store
└── utils/                           # Utility functions
```

---

## 🔑 Environment Variables

### Backend (.env)
```env
# Database
MONGO_URI=mongodb://...
DB_NAME=nexfellow

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# OAuth Providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...

# File Storage
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
BUNNY_CDN_STORAGE_ZONE_NAME=...
BUNNY_CDN_API_KEY=...

# Payment
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

# Email
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...

# App Config
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:3000

# Firebase (for push notifications)
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# Redis (optional)
REDIS_URL=...
```

### Admin Panel (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🛣️ API Endpoints Quick Reference

### Authentication
```
POST   /api/auth/register              # User registration
POST   /api/auth/login                 # User login
GET    /api/auth/google               # Google OAuth
GET    /api/auth/linkedin             # LinkedIn OAuth
GET    /api/auth/github               # GitHub OAuth
GET    /api/auth/facebook             # Facebook OAuth
POST   /api/auth/logout               # User logout
GET    /api/auth/me                   # Get current user
```

### Users
```
GET    /api/users                     # Get all users (admin)
GET    /api/users/:id                 # Get user by ID
PUT    /api/users/:id                 # Update user
DELETE /api/users/:id                 # Delete user
GET    /api/users/:id/posts           # Get user posts
GET    /api/users/:id/communities     # Get user communities
```

### Posts
```
GET    /api/posts                     # Get all posts
POST   /api/posts                     # Create post
GET    /api/posts/:id                 # Get post by ID
PUT    /api/posts/:id                 # Update post
DELETE /api/posts/:id                 # Delete post
POST   /api/posts/:id/like            # Like post
POST   /api/posts/:id/comment         # Comment on post
```

### Communities
```
GET    /api/communities               # Get all communities
POST   /api/communities               # Create community
GET    /api/communities/:id           # Get community
PUT    /api/communities/:id           # Update community
DELETE /api/communities/:id           # Delete community
POST   /api/communities/:id/join      # Join community
POST   /api/communities/:id/leave     # Leave community
```

### Challenges
```
GET    /api/challenge/public          # Get public challenges
POST   /api/challenge/create          # Create challenge
GET    /api/challenge/my/created      # Get my created challenges
GET    /api/challenge/my/enrolled     # Get my enrolled challenges
POST   /api/challenge/enroll/:id      # Enroll in challenge
POST   /api/challenge/:id/submit/:day # Submit daily task
GET    /api/challenge/:id/progress    # Get progress
GET    /api/challenge/:id/analytics   # Get analytics (admin)
PUT    /api/challenge/:id/status      # Update status
```

### Quizzes
```
GET    /api/quiz                      # Get all quizzes
POST   /api/quiz/create               # Create quiz
GET    /api/quiz/:id                  # Get quiz
POST   /api/quiz/:id/submit           # Submit quiz answers
GET    /api/quiz/:id/leaderboard      # Get leaderboard
GET    /api/quiz/:id/results          # Get results
```

### Messages
```
GET    /api/messages                  # Get conversations
POST   /api/messages                  # Send message
GET    /api/messages/:conversationId  # Get conversation messages
DELETE /api/messages/:id              # Delete message
```

### Notifications
```
GET    /api/notifications             # Get user notifications
PUT    /api/notifications/:id/read    # Mark as read
DELETE /api/notifications/:id         # Delete notification
POST   /api/notifications/send        # Send notification (admin)
```

### Admin
```
GET    /api/admin/users               # Get all users
GET    /api/admin/analytics           # Get analytics
POST   /api/admin/blogs               # Create blog
PUT    /api/admin/posts/:id/takedown  # Takedown post
POST   /api/admin/advertisements      # Create ad
GET    /api/admin/requests            # Get verification requests
```

---

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  avatar: String,
  bio: String,
  location: String,
  website: String,
  socialLinks: Object,
  followers: [ObjectId],
  following: [ObjectId],
  joinedCommunities: [ObjectId],
  joinedChallenges: [ObjectId],
  achievements: Array,
  role: String (user/admin),
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Challenge Model
```javascript
{
  title: String,
  description: String,
  coverImage: String,
  duration: Number,
  startDate: Date,
  endDate: Date,
  status: String (unpublished/upcoming/ongoing/completed),
  creator: ObjectId,
  community: ObjectId,
  dailyTasks: [{
    day: Number,
    title: String,
    description: String,
    submissionType: String (text/image),
    submissionPrompt: String
  }],
  checkpointRewards: [{
    checkpointDay: Number,
    rewardType: String,
    rewardName: String,
    rewardDescription: String
  }],
  participants: [{
    user: ObjectId,
    enrolledAt: Date,
    progress: Number,
    completedDays: [Number],
    earnedRewards: Array
  }],
  settings: {
    allowLateSubmissions: Boolean,
    autoApproveSubmissions: Boolean,
    requireApprovalForRewards: Boolean
  }
}
```

### Post Model
```javascript
{
  content: String,
  author: ObjectId,
  community: ObjectId,
  images: [String],
  attachments: Array,
  likes: [ObjectId],
  comments: [ObjectId],
  bookmarks: [ObjectId],
  isPublic: Boolean,
  isPinned: Boolean,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 Component Conventions

### Naming Conventions
```
Components:     PascalCase (UserProfile.jsx)
Files:          kebab-case or PascalCase
CSS Modules:    ComponentName.module.css
Utilities:      camelCase (formatDate.js)
Constants:      UPPER_SNAKE_CASE
```

### Component Structure (React)
```javascript
// Imports
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './Component.module.css';

// Component
export default function Component({ prop1, prop2 }) {
  // Hooks
  const dispatch = useDispatch();
  const stateValue = useSelector(state => state.slice.value);
  const [localState, setLocalState] = useState(null);

  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  // Handlers
  const handleAction = () => {
    // Logic
  };

  // Render
  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  );
}
```

### Component Structure (Next.js)
```typescript
// Server Component (default)
export default function ServerComponent() {
  return <div>Server rendered</div>;
}

// Client Component
'use client';

import { useState } from 'react';

export default function ClientComponent() {
  const [state, setState] = useState(null);
  return <div>Client rendered</div>;
}
```

---

## 🔧 Utility Functions

### Common Utils (client/src/utils/ or admin/lib/)
```javascript
// Format date
formatDate(date) => "Jan 8, 2026"
formatDateTime(date) => "Jan 8, 2026 6:42 PM"
formatRelativeTime(date) => "2 hours ago"

// String manipulation
truncate(text, length) => "Truncated text..."
slugify(text) => "url-friendly-slug"

// Validation
isValidEmail(email) => boolean
isValidURL(url) => boolean

// File handling
getFileExtension(filename) => "jpg"
formatFileSize(bytes) => "2.5 MB"

// API helpers
buildQueryString(params) => "?key=value&key2=value2"
handleAPIError(error) => formatted error message
```

---

## 🎭 Redux Store Structure

### Admin Panel Store
```javascript
{
  user: {
    user: null | User,
    token: null | string,
    expiresIn: null | string,
    isAuthenticated: boolean
  }
}
```

### Client Store
```javascript
{
  user: {
    currentUser: null | User,
    token: null | string,
    isAuthenticated: boolean
  },
  posts: {
    feed: Post[],
    loading: boolean,
    error: string | null
  },
  communities: {
    list: Community[],
    current: Community | null
  },
  // ... other slices
}
```

---

## 🔐 Authentication Flow

### Admin Login
```javascript
// 1. User enters credentials
const handleLogin = async (email, password) => {
  // 2. Send to backend
  const response = await fetch(`${API_URL}/admin/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  // 3. Get token and user data
  const { token, user, expiresIn } = await response.json();
  
  // 4. Store in Redux + localStorage
  dispatch(setUser({ user, token, expiresIn }));
  localStorage.setItem('token', token);
  
  // 5. Redirect to dashboard
  router.push('/users');
};
```

### Protected Routes (Next.js)
```javascript
// components/AuthGuard.tsx
'use client';

export function AuthGuard({ children }) {
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const expiresIn = localStorage.getItem('expiresIn');
    
    if (!token || new Date(expiresIn) <= new Date()) {
      router.push('/login');
    }
  }, []);
  
  return <>{children}</>;
}
```

---

## 📊 Chart.js Usage

### Basic Chart Setup
```javascript
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Data structure
const data = {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [{
    label: 'Users',
    data: [12, 19, 3],
    borderColor: 'rgb(75, 192, 192)',
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
  }]
};

// Options
const options = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'User Growth' }
  }
};

// Usage
<Line data={data} options={options} />
```

---

## 🎨 Styling Best Practices

### CSS Modules
```javascript
// Component.module.css
.container {
  padding: 20px;
}

.title {
  font-size: 24px;
  color: var(--primary-color);
}

// Component.jsx
import styles from './Component.module.css';

<div className={styles.container}>
  <h1 className={styles.title}>Title</h1>
</div>
```

### Tailwind CSS
```javascript
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
</div>
```

### Combining Styles
```javascript
import { cn } from '@/lib/utils'; // Tailwind merge utility

<div className={cn(
  styles.container,
  "flex items-center",
  isActive && styles.active
)}>
  Content
</div>
```

---

## 🔔 Toast Notifications

### Using Sonner (Admin)
```javascript
import { toast } from 'sonner';

// Success
toast.success('User created successfully!');

// Error
toast.error('Failed to create user');

// Info
toast.info('Processing...');

// Custom
toast('Custom message', {
  description: 'Additional details',
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo')
  }
});
```

### Using React Toastify (Client)
```javascript
import { toast } from 'react-toastify';

toast.success('Success message');
toast.error('Error message');
toast.info('Info message');
toast.warning('Warning message');
```

---

## 🚨 Error Handling

### API Error Handling
```javascript
// Backend response format
{
  success: boolean,
  message: string,
  data?: any,
  error?: string
}

// Frontend handling
try {
  const response = await fetch(url);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Something went wrong');
  }
  
  return data.data;
} catch (error) {
  console.error(error);
  toast.error(error.message);
  return null;
}
```

---

## 📝 Code Snippets

### Fetch with Auth Header
```javascript
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
  
  return response.json();
};
```

### File Upload
```javascript
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

### Pagination Component Usage
```javascript
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={(page) => setCurrentPage(page)}
/>
```

---

## 🐛 Common Issues & Solutions

### Issue: CORS Error
**Solution:** 
```javascript
// backend/index.js
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
```

### Issue: Redux Persist Warning
**Solution:**
```javascript
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
    },
  }),
```

### Issue: Next.js Hydration Error
**Solution:**
- Ensure server and client HTML match
- Use `suppressHydrationWarning` sparingly
- Check for browser-only code in server components

### Issue: File Upload Size Limit
**Solution:**
```javascript
// backend/index.js
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

---

## 📚 Useful Resources

### Documentation
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- Redux Toolkit: https://redux-toolkit.js.org
- Tailwind CSS: https://tailwindcss.com
- Chart.js: https://www.chartjs.org
- Socket.io: https://socket.io/docs
- Mongoose: https://mongoosejs.com

### UI Libraries
- Radix UI: https://www.radix-ui.com
- Material-UI: https://mui.com
- Lucide Icons: https://lucide.dev
- React Icons: https://react-icons.github.io/react-icons

---

## 🎯 Git Workflow (Recommended)

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request for review
```

### Commit Message Convention
```
feat: new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code restructuring
test: adding tests
chore: maintenance
```

---

## 📞 Quick Help

**Backend Port:** 5000  
**Client Port:** 5173 (Vite)  
**Admin Port:** 3000 (Next.js)  
**Database:** MongoDB (local or Atlas)

**Admin Login Path:** `/login`  
**Default Redirect:** `/users`

---

**Document Version:** 1.0  
**Last Updated:** January 8, 2026
