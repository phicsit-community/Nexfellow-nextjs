# Admin Panel Migration to Next.js - Comprehensive Plan

## 📋 Executive Summary

This document outlines a comprehensive migration strategy to migrate the **NexFellow Admin Panel** from the current **Vite + React** stack to **Next.js 14+ with App Router**. The migration aims to improve performance, SEO, developer experience, and maintainability.

---

## 🎯 MIGRATION STATUS (Updated: December 31, 2024)

### ✅ COMPLETED ITEMS - MIGRATION 100% COMPLETE

#### Phase 1: Project Setup & Infrastructure ✅
| Task | Status | Notes |
|------|--------|-------|
| Initialize Next.js 16.1.1 project | ✅ Complete | Created `admin-nextjs` with App Router |
| Install core dependencies | ✅ Complete | Redux, Chart.js, Sonner, Axios, etc. |
| Configure environment variables | ✅ Complete | `env.example.txt` created |
| Setup Redux store with persist | ✅ Complete | `lib/store/store.ts`, `lib/store/slices/userSlice.ts` |
| Create Providers component | ✅ Complete | `app/providers.tsx` |
| Configure `next.config.ts` | ✅ Complete | Image domains, redirects |
| Utility functions | ✅ Complete | `lib/utils.ts` (cn, formatDate, formatDateTime) |
| Middleware | ✅ Complete | `middleware.ts` with security headers |

#### Phase 2: Core Components Migration ✅
| Component | Status | Location |
|-----------|--------|----------|
| SideBar | ✅ Complete | `components/layout/SideBar/index.tsx` |
| Navbar | ✅ Complete | `components/layout/Navbar/index.tsx` |
| Loader | ✅ Complete | `components/ui/Loader/index.tsx` |
| Pagination | ✅ Complete | `components/ui/Pagination/index.tsx` |
| Table | ✅ Complete | `components/ui/Table/index.tsx` |
| AuthGuard | ✅ Complete | `components/AuthGuard.tsx` |

#### Phase 3: Layout & Error Handling ✅
| Layout | Status | Location |
|--------|--------|----------|
| Root Layout | ✅ Complete | `app/layout.tsx` |
| Auth Layout | ✅ Complete | `app/(auth)/layout.tsx` |
| Dashboard Layout | ✅ Complete | `app/(dashboard)/layout.tsx` |
| Dashboard Loading | ✅ Complete | `app/(dashboard)/loading.tsx` |
| Global Error Boundary | ✅ Complete | `app/error.tsx` |
| Dashboard Error Boundary | ✅ Complete | `app/(dashboard)/error.tsx` |
| Not Found Page | ✅ Complete | `app/not-found.tsx` |

#### Phase 4: Page Migration ✅ (ALL PAGES COMPLETE)
| Page | Route | Status | Files |
|------|-------|--------|-------|
| **Login** | `/login` | ✅ Complete | `page.tsx`, `LoginClient.tsx`, `Login.module.css` |
| **Users** | `/users` | ✅ Complete | `page.tsx`, `UsersClient.tsx`, `Users.module.css` |
| **Analytics** | `/analytics` | ✅ Complete | `page.tsx`, `AnalyticsClient.tsx`, `Analytics.module.css` |
| **Blogs** | `/blogs` | ✅ Complete | `page.tsx`, `BlogsClient.tsx`, `BlogPage.module.css` |
| **Notifications** | `/notifications` | ✅ Complete | `page.tsx`, `NotificationsClient.tsx`, `Notifications.module.css` |
| **Posts** | `/posts` | ✅ Complete | `page.tsx`, `PostsClient.tsx`, `Posts.module.css` |
| **Referrals** | `/referrals` | ✅ Complete | `page.tsx`, `ReferralsClient.tsx`, `Referrals.module.css` |
| **Advertisements** | `/advertisements` | ✅ Complete | `page.tsx`, `AdvertisementsClient.tsx`, `Advertisements.module.css` |
| **Featured Communities** | `/featured-communities` | ✅ Complete | `page.tsx`, `FeaturedCommunitiesClient.tsx`, `FeaturedCommunities.module.css` |
| **Requests/Verifications** | `/requests` | ✅ Complete | `page.tsx`, `RequestsClient.tsx`, `Requests.module.css` |
| **Checkout Details** | `/checkout-details` | ✅ Complete | `page.tsx`, `CheckoutDetailsClient.tsx`, `CheckoutDetails.module.css` |
| **Quiz List** | `/quiz` | ✅ Complete | `page.tsx`, `QuizListC
lient.tsx`, `Quiz.module.css` |
| **Quiz Detail** | `/quiz/[id]` | ✅ Complete | `page.tsx`, `QuizDetailClient.tsx` |
| **Create Quiz** | `/quiz/create` | ✅ Complete | `page.tsx`, `CreateQuizClient.tsx` |
| **Challenges** | `/challenges` | ✅ Complete | `page.tsx`, `ChallengesClient.tsx`, `Challenges.module.css` |
| **Rewards** | `/rewards` | ✅ Complete | `page.tsx`, `RewardsClient.tsx`, `Rewards.module.css` |
| **Add Rewards to Quiz** | `/rewards/add/[quizId]` | ✅ Complete | `page.tsx`, `AddRewardsClient.tsx` |
| **Root Redirect** | `/` | ✅ Complete | Redirects to `/users` |

#### Phase 5: Assets & Styling ✅
| Task | Status | Notes |
|------|--------|-------|
| Copy static assets | ✅ Complete | Copied to `public/assets/` |
| Global CSS | ✅ Complete | `app/globals.css` with Montserrat font |
| CSS Modules | ✅ Complete | All component styles migrated |
| TailwindCSS | ✅ Complete | Configured in project |

#### Build Status ✅
```
✅ Build succeeded with all routes:
├ ○ /                    
├ ○ /_not-found          
├ ○ /advertisements      
├ ○ /analytics           
├ ○ /blogs               
├ ○ /challenges          
├ ○ /checkout-details    
├ ○ /featured-communities
├ ○ /login
├ ○ /notifications
├ ○ /posts
├ ○ /quiz
├ ƒ /quiz/[id]
├ ○ /quiz/create
├ ○ /referrals
├ ○ /requests
├ ○ /rewards
├ ƒ /rewards/add/[quizId]
└ ○ /users

ƒ Proxy (Middleware)
○ (Static) prerendered as static content
ƒ (Dynamic) server-rendered on demand
```

---

### ⚠️ KNOWN ISSUES / NOTES

#### 1. React 19 Compatibility
| Package | Issue | Workaround Applied |
|---------|-------|-------------------|
| `react-quill` | Not compatible with React 19 | Blog rich text editor uses basic textarea |
| `react-beautiful-dnd` | Not compatible with React 19 | Featured Communities uses up/down buttons instead of drag-drop |

**Recommended Solutions (if needed later):**
- For rich text editor: Use `@tiptap/react` or `lexical` instead of react-quill
- For drag-and-drop: Use `@dnd-kit/core` instead of react-beautiful-dnd

#### 2. Testing Required
- [ ] Login and authentication flow with actual backend
- [ ] All API integrations
- [ ] User CRUD operations
- [ ] Blog publish/unpublish actions
- [ ] Post takedown/restore functionality
- [ ] Notification sending
- [ ] Advertisement upload
- [ ] Featured communities ordering and save
- [ ] Verification request approve/reject
- [ ] CSV export functionality
- [ ] Chart data rendering in Analytics
- [ ] Quiz creation and management
- [ ] Challenge creation
- [ ] Rewards management

#### 3. Environment Configuration Required
- [ ] Create `.env.local` with `NEXT_PUBLIC_API_URL`
- [ ] Configure correct API endpoint

---

### 📁 Project Structure (Final)

```
admin-nextjs/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx (redirects to /users)
│   ├── providers.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   └── login/
│   │       ├── page.tsx
│   │       ├── LoginClient.tsx
│   │       └── Login.module.css
│   └── (dashboard)/
│       ├── layout.tsx
│       ├── dashboard.module.css
│       ├── loading.tsx
│       ├── error.tsx
│       ├── users/
│       ├── analytics/
│       ├── blogs/
│       ├── notifications/
│       ├── posts/
│       ├── referrals/
│       ├── advertisements/
│       ├── featured-communities/
│       ├── requests/
│       ├── checkout-details/
│       ├── quiz/
│       │   ├── page.tsx, QuizListClient.tsx, Quiz.module.css
│       │   ├── [id]/ (detail page)
│       │   └── create/ (create form)
│       ├── challenges/
│       │   ├── page.tsx, ChallengesClient.tsx, Challenges.module.css
│       │   └── create/
│       └── rewards/
│           ├── page.tsx, RewardsClient.tsx, Rewards.module.css
│           └── add/[quizId]/ (add rewards to quiz)
├── components/
│   ├── AuthGuard.tsx
│   ├── layout/
│   │   ├── Navbar/
│   │   └── SideBar/
│   └── ui/
│       ├── Loader/
│       ├── Pagination/
│       └── Table/
├── lib/
│   ├── utils.ts
│   └── store/
│       ├── store.ts
│       ├── hooks.ts
│       └── slices/
│           └── userSlice.ts
├── public/
│   └── assets/
├── middleware.ts
├── env.example.txt
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 🔍 Current Architecture Analysis

### Current Tech Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| Vite | 5.3.4 | Build Tool & Dev Server |
| React Router DOM | 6.26.0 | Client-side Routing |
| Redux Toolkit | 2.2.7 | State Management |
| Redux Persist | 6.0.0 | State Persistence |
| TailwindCSS | 3.4.10 | Utility CSS |
| SASS | 1.77.8 | CSS Preprocessor |
| Axios | 1.9.0 | HTTP Client |

### Current Project Structure
```
admin/
├── src/
│   ├── App.jsx                # Main app with React Router
│   ├── main.jsx               # Entry point with Redux Provider
│   ├── index.css              # Global styles
│   ├── App.scss               # App-level styles
│   ├── Components/            # Reusable components (21 items)
│   │   ├── AddQuestion/
│   │   ├── Button/
│   │   ├── ChallengeForm/
│   │   ├── ConfirmationModal/
│   │   ├── DeleteConfirm/
│   │   ├── DropDown/
│   │   ├── EditQuestion/
│   │   ├── EditQuiz/
│   │   ├── ImageUploader/
│   │   ├── Input/
│   │   ├── Loader/
│   │   ├── Navbar/
│   │   ├── Pagination/
│   │   ├── Pagination2/
│   │   ├── ProtectedRoute.jsx
│   │   ├── Question/
│   │   ├── QuizForm/
│   │   ├── SideBar/
│   │   ├── Table/
│   │   ├── TemplateCard/
│   │   └── authSide/
│   ├── Pages/                 # Page components (20 pages)
│   │   ├── AddRewards/
│   │   ├── Advertisements/
│   │   ├── Analytics/
│   │   ├── BlogPage/
│   │   ├── Challenge/
│   │   ├── CheckoutDetails/
│   │   ├── CreateChallenge/
│   │   ├── CreateQuiz/
│   │   ├── CreateReward/
│   │   ├── Edit/
│   │   ├── FeaturedCommunities/
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── Notifications/
│   │   ├── Posts/
│   │   ├── Quiz/
│   │   ├── Referrals/
│   │   ├── Requests/
│   │   ├── ShareChallenge/
│   │   └── Users/
│   ├── slices/                # Redux slices
│   │   └── userSlice.js
│   ├── store/                 # Redux store
│   │   └── store.js
│   ├── utils/
│   │   └── utils.js
│   └── assests/               # Static assets
│       ├── Icons/
│       ├── Login/
│       ├── Navbar/
│       ├── SideBar/
│       ├── Userpage/
│       ├── badges/
│       └── challenges/
├── package.json
├── vite.config.js
├── postcss.config.js
└── tailwind.config.js
```

### Active Routes (from App.jsx)
| Route | Component | Status |
|-------|-----------|--------|
| `/` | Users | Protected |
| `/users` | Users | Protected |
| `/blogs` | BlogPage | Protected |
| `/notifications` | Notifications | Protected |
| `/analytics` | Analytics | Protected |
| `/posts` | Posts | Protected |
| `/requests` | Requests | Protected |
| `/advertisements` | Advertisements | Protected |
| `/featured-communities` | FeaturedCommunities | Protected |
| `/referrals` | Referrals | Protected |
| `/checkout-details` | CheckoutDetails | Protected |
| `/login` | Login | Public |

### Key Dependencies to Migrate
- **UI Libraries**: MUI, Radix UI, Lucide React, React Icons
- **State Management**: Redux Toolkit + Redux Persist
- **Data Fetching**: Native fetch API with `import.meta.env.VITE_API_URL`
- **Forms**: React state management
- **Charts**: Chart.js + react-chartjs-2
- **Styling**: CSS Modules + SASS + TailwindCSS
- **Toast/Notifications**: Sonner, React Toastify

---

## 🎯 Migration Goals & Benefits

### Performance Improvements
1. **Server-Side Rendering (SSR)** - Faster initial page loads
2. **Static Generation (SSG)** - Pre-render static content
3. **Automatic Code Splitting** - Smaller bundle sizes
4. **Image Optimization** - Next.js Image component
5. **Built-in Caching** - Request memoization

### Developer Experience
1. **App Router** - Modern routing with layouts
2. **Server Components** - Reduce client-side JavaScript
3. **API Routes** - Backend functions when needed
4. **TypeScript Support** - Better type safety (optional)
5. **Turbopack** - Faster development builds

### SEO & Metadata
1. **Metadata API** - Dynamic page titles and descriptions
2. **OpenGraph Support** - Social media previews (if needed)

---

## 🏗️ Target Architecture

### New Project Structure
```
admin-nextjs/
├── app/                           # App Router directory
│   ├── layout.tsx                 # Root layout (Redux Provider, global styles)
│   ├── page.tsx                   # Home page (redirects to /users)
│   ├── globals.css                # Global styles
│   ├── providers.tsx              # Client-side providers wrapper
│   │
│   ├── (auth)/                    # Auth route group (no SideBar)
│   │   ├── layout.tsx             # Auth layout
│   │   └── login/
│   │       └── page.tsx           # Login page
│   │
│   ├── (dashboard)/               # Dashboard route group (with SideBar)
│   │   ├── layout.tsx             # Dashboard layout with SideBar & Navbar
│   │   ├── users/
│   │   │   └── page.tsx
│   │   ├── blogs/
│   │   │   └── page.tsx
│   │   ├── notifications/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── posts/
│   │   │   └── page.tsx
│   │   ├── requests/
│   │   │   └── page.tsx
│   │   ├── advertisements/
│   │   │   └── page.tsx
│   │   ├── featured-communities/
│   │   │   └── page.tsx
│   │   ├── referrals/
│   │   │   └── page.tsx
│   │   └── checkout-details/
│   │       └── page.tsx
│   │
│   └── api/                       # API Routes (optional)
│       └── [...]/
│
├── components/                     # Shared components
│   ├── ui/                        # Base UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── DropDown/
│   │   ├── Loader/
│   │   ├── Pagination/
│   │   ├── Table/
│   │   └── Modal/
│   │
│   ├── layout/                    # Layout components
│   │   ├── Navbar/
│   │   └── SideBar/
│   │
│   └── features/                  # Feature-specific components
│       ├── AddQuestion/
│       ├── ChallengeForm/
│       ├── EditQuestion/
│       ├── EditQuiz/
│       ├── ImageUploader/
│       ├── QuizForm/
│       └── TemplateCard/
│
├── lib/                           # Utilities and configurations
│   ├── store/                     # Redux store
│   │   ├── store.ts
│   │   └── slices/
│   │       └── userSlice.ts
│   ├── utils.ts                   # Utility functions
│   └── api.ts                     # API client configuration
│
├── hooks/                         # Custom React hooks
│   ├── useAuth.ts
│   └── useApi.ts
│
├── types/                         # TypeScript types (optional)
│   ├── user.ts
│   └── api.ts
│
├── public/                        # Static assets
│   └── assets/
│       ├── icons/
│       ├── images/
│       └── badges/
│
├── styles/                        # Additional styles
│   └── components/                # Component-specific styles
│
├── middleware.ts                  # Next.js middleware for auth
├── next.config.js                 # Next.js configuration
├── tailwind.config.ts             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json
```

---

## 📅 Migration Phases

### Phase 1: Project Setup & Infrastructure (Week 1)
**Estimated Time: 3-5 days**

#### 1.1 Initialize Next.js Project
```bash
cd /Users/shubhupadhyay/Desktop/Nexfellow-nextjs
npx create-next-app@latest admin-nextjs --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

#### 1.2 Install Dependencies
```bash
cd admin-nextjs
npm install @reduxjs/toolkit react-redux redux-persist
npm install @emotion/react @emotion/styled @mui/material
npm install @radix-ui/react-dialog @radix-ui/react-slot
npm install lucide-react react-icons
npm install axios date-fns
npm install chart.js react-chartjs-2
npm install sonner react-toastify
npm install file-saver marked markdown-it
npm install class-variance-authority classnames
npm install sass
# Dev dependencies
npm install -D @types/file-saver
```

#### 1.3 Configure Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=your_api_url_here
```

#### 1.4 Setup Redux Store with Next.js
Create `lib/store/store.ts`:
```typescript
'use client';

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userReducer from './slices/userSlice';

const persistConfig = {
  key: 'user',
  storage,
  whitelist: ['user', 'token', 'expiresIn'],
};

const persistedUserReducer = persistReducer(persistConfig, userReducer);

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: persistedUserReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
          ignoredPaths: ['user._persist'],
        },
      }),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
```

#### 1.5 Create Providers Component
Create `app/providers.tsx`:
```typescript
'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { makeStore, AppStore } from '@/lib/store/store';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>();
  
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  const persistor = persistStore(storeRef.current);

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistor}>
        <Toaster position="bottom-right" richColors />
        {children}
      </PersistGate>
    </Provider>
  );
}
```

#### 1.6 Setup Authentication Middleware
Create `middleware.ts`:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';
  
  // For client-side auth (localStorage), we'll handle this in components
  // This middleware can be extended for cookie-based auth
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

### Phase 2: Core Components Migration (Week 2)
**Estimated Time: 5-7 days**

#### 2.1 Layout Components (Priority: HIGH)

**Migrate Navbar.jsx → components/layout/Navbar/index.tsx**
```typescript
// Mark as client component if using hooks
'use client';

import styles from './Navbar.module.css';

export function Navbar() {
  return <div className={styles.navbar}></div>;
}
```

**Migrate SideBar.jsx → components/layout/SideBar/index.tsx**
- Convert NavLink to Next.js Link component
- Replace `useNavigate` with `useRouter` from `next/navigation`
- Use `usePathname` for active state detection

```typescript
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { clearUser } from '@/lib/store/slices/userSlice';
import styles from './SideBar.module.css';
// ... icons imports

export function SideBar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.clear();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className={styles.sidebar}>
      {/* ... */}
      <Link
        href="/users"
        className={`${styles.navLink} ${isActive('/users') ? styles.active : ''}`}
      >
        <FiUsers className={styles.sideIcon} />
        <p>Users</p>
      </Link>
      {/* ... */}
    </div>
  );
}
```

#### 2.2 Create Dashboard Layout
Create `app/(dashboard)/layout.tsx`:
```typescript
import { Navbar } from '@/components/layout/Navbar';
import { SideBar } from '@/components/layout/SideBar';
import { AuthGuard } from '@/components/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div>
        <Navbar />
        <SideBar />
        <main className="maincontainer">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
```

#### 2.3 Create Auth Guard Component
Create `components/AuthGuard.tsx`:
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const expiresIn = localStorage.getItem('expiresIn');

    if (!token || !expiresIn) {
      router.push('/login');
      return;
    }

    const expirationDate = new Date(JSON.parse(expiresIn));
    if (expirationDate <= new Date()) {
      localStorage.clear();
      router.push('/login');
    }
  }, [router]);

  return <>{children}</>;
}
```

#### 2.4 UI Components Migration Checklist
| Component | Priority | Complexity | Notes |
|-----------|----------|------------|-------|
| Loader | High | Low | Simple, no hooks changes |
| Button | High | Low | Minimal changes |
| Input | High | Low | Minimal changes |
| DropDown | Medium | Medium | Check event handlers |
| Table | High | High | Complex, many API calls |
| Pagination | Medium | Low | Straightforward |
| Modal (ConfirmationModal/DeleteConfirm) | Medium | Medium | Use Radix Dialog |
| ImageUploader | Medium | Medium | File handling |

---

### Phase 3: Page Components Migration (Week 3-4)
**Estimated Time: 7-10 days**

#### 3.1 Migration Order (by complexity)
1. **Login Page** (Simple, foundational)
2. **Users Page** (Core functionality)
3. **Analytics Page** (Charts, data fetching)
4. **Blog Page** (CRUD operations)
5. **Posts Page**
6. **Notifications Page**
7. **Referrals Page**
8. **Requests Page**
9. **Advertisements Page** (Complex - file uploads)
10. **Featured Communities Page** (Complex)
11. **Checkout Details Page**

#### 3.2 Page Migration Template

**Example: Users Page**

Create `app/(dashboard)/users/page.tsx`:
```typescript
import { UsersClient } from './UsersClient';

export const metadata = {
  title: 'Users | NexFellow Admin',
  description: 'Manage registered users',
};

export default function UsersPage() {
  return <UsersClient />;
}
```

Create `app/(dashboard)/users/UsersClient.tsx`:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { saveAs } from 'file-saver';
import { IoIosSearch } from 'react-icons/io';

import { Table } from '@/components/ui/Table';
import { Loader } from '@/components/ui/Loader';
import type { RootState } from '@/lib/store/store';
import styles from './Users.module.css';

export function UsersClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { user } = useSelector((state: RootState) => state.user);
  const adminId = user;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${apiUrl}/admin/${adminId}/registered-users`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }
        );

        if (!response.ok) throw new Error('Failed to fetch users');
        
        const result = await response.json();
        const sortedUsers = result.sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setData(sortedUsers);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    if (adminId) fetchUsers();
  }, [apiUrl, adminId]);

  const downloadCSV = () => {
    // ... same logic
  };

  return (
    <div className={styles.maincontainer}>
      <div className={styles.userHeader}>
        <div>
          <div className={styles.title}>Users</div>
          <div className={styles.totalUser}>Total User: {data.length}</div>
        </div>
        <div className={styles.searchBarAndFilter}>
          <div className={styles.searchContainer}>
            <IoIosSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search user"
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <button onClick={downloadCSV} className={styles.downloadBtn}>
          Download CSV
        </button>
      </div>
      <Table
        searchQuery={searchQuery}
        data={data}
        setData={setData}
        loading={loading}
        setLoading={setLoading}
      />
    </div>
  );
}
```

#### 3.3 API Changes Summary
| Current (Vite) | Next.js Equivalent |
|----------------|-------------------|
| `import.meta.env.VITE_API_URL` | `process.env.NEXT_PUBLIC_API_URL` |
| `useNavigate()` | `useRouter()` from `next/navigation` |
| `<Link to="/path">` | `<Link href="/path">` |
| `<Navigate to="/login" />` | `redirect('/login')` or `router.push('/login')` |
| `useHistory()` | `useRouter()` |

---

### Phase 4: Styling & Assets Migration (Week 4)
**Estimated Time: 2-3 days**

#### 4.1 CSS Modules Migration
- CSS Modules work the same way in Next.js
- Copy `.module.css` files alongside components
- Update import paths

#### 4.2 SASS Setup
Already supported in Next.js, just ensure `sass` is installed.

#### 4.3 Tailwind Configuration
Migrate `tailwind.config.js`:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

#### 4.4 Static Assets Migration
- Move `src/assests/` → `public/assets/`
- Update import paths:
  ```typescript
  // Before (Vite)
  import logo from '../assests/Navbar/NexFellowLogo.svg';
  
  // After (Next.js)
  // Option 1: Public folder
  <Image src="/assets/Navbar/NexFellowLogo.svg" alt="Logo" width={100} height={40} />
  
  // Option 2: Import (with next.config.mjs configuration)
  import logo from '@/public/assets/Navbar/NexFellowLogo.svg';
  ```

---

### Phase 5: Testing & Optimization (Week 5)
**Estimated Time: 3-5 days**

#### 5.1 Testing Checklist
- [ ] Authentication flow (login/logout)
- [ ] Protected routes redirect correctly
- [ ] All API calls work with new env variable
- [ ] Redux persistence works
- [ ] All navigation links work
- [ ] CSS styles render correctly
- [ ] Charts render properly
- [ ] File uploads work (Advertisements)
- [ ] CSV download works (Users)
- [ ] Toast notifications appear

#### 5.2 Performance Optimization
1. **Use Server Components** where possible (no client interactivity)
2. **Implement Loading States** with Next.js Suspense
3. **Add Error Boundaries** with `error.tsx` files
4. **Optimize Images** with `next/image`
5. **Implement Caching** for API responses

#### 5.3 Create Loading & Error States
```typescript
// app/(dashboard)/users/loading.tsx
import { Loader } from '@/components/ui/Loader';

export default function Loading() {
  return <Loader />;
}

// app/(dashboard)/users/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

---

### Phase 6: Deployment & Cleanup (Week 5-6)
**Estimated Time: 2-3 days**

#### 6.1 Next.js Configuration
Create `next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports if needed for specific deployment
  // output: 'export',
  
  images: {
    domains: ['your-image-domain.com'],
  },
  
  // Redirect root to users
  async redirects() {
    return [
      {
        source: '/',
        destination: '/users',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
```

#### 6.2 Vercel Deployment
Create `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/((?!api/.*).*)",
      "destination": "/$1"
    }
  ]
}
```

#### 6.3 Cleanup Tasks
1. Remove old `admin/` directory after successful migration
2. Update CI/CD pipelines
3. Update documentation
4. Update environment variable references in deployment platform

---

## 📊 Migration Complexity by Component

### Low Complexity (< 2 hours each)
- Navbar
- Loader
- Button
- Input
- Pagination
- Pagination2
- Login Page
- Home Page

### Medium Complexity (2-4 hours each)
- SideBar (NavLink → Link conversion)
- DropDown
- ProtectedRoute → AuthGuard
- ConfirmationModal
- DeleteConfirm
- Users Page
- Posts Page
- Notifications Page
- Referrals Page

### High Complexity (4-8 hours each)
- Table Component (complex state, API calls)
- Analytics Page (Charts, data visualization)
- BlogPage & BlogWriter (rich text editing)
- Requests Page (multiple sub-views)
- Advertisements Page (file uploads)
- FeaturedCommunities Page

---

## ⚠️ Potential Challenges & Solutions

### Challenge 1: Redux Persist with SSR
**Problem**: Redux Persist uses localStorage, which isn't available on the server.
**Solution**: Wrap the store initialization in a client component and use dynamic imports.

### Challenge 2: React Router → Next.js Router
**Problem**: Different API for routing.
**Solution**: 
- Replace `useNavigate` with `useRouter` from `next/navigation`
- Replace `<Link to="">` with `<Link href="">`
- Replace `<Navigate>` with `redirect()` or `router.push()`

### Challenge 3: Environment Variables
**Problem**: Vite uses `import.meta.env.VITE_*`, Next.js uses `process.env.NEXT_PUBLIC_*`
**Solution**: Find and replace all environment variable references.

### Challenge 4: CSS Modules Import Paths
**Problem**: Different path resolution.
**Solution**: Use path aliases (`@/`) for cleaner imports.

### Challenge 5: Chart.js with SSR
**Problem**: Chart.js requires window object.
**Solution**: Use dynamic import with `{ ssr: false }`:
```typescript
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('@/components/Chart'), { ssr: false });
```

---

## 📈 Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1: Setup | 3-5 days | New Next.js project, Redux setup, Auth middleware |
| Phase 2: Core Components | 5-7 days | Layouts, SideBar, Navbar, UI components |
| Phase 3: Pages | 7-10 days | All 12 page components migrated |
| Phase 4: Styling | 2-3 days | CSS modules, Tailwind, assets |
| Phase 5: Testing | 3-5 days | Full testing, optimization |
| Phase 6: Deployment | 2-3 days | Production deployment, cleanup |

**Total Estimated Time: 4-6 weeks**

---

## ✅ Success Criteria

1. All existing functionality works identically
2. Build succeeds without errors
3. All protected routes work correctly
4. API calls work with new environment variables
5. CSS renders correctly on all pages
6. Charts and data visualizations work
7. File upload/download features work
8. Redux state persists across sessions
9. Performance metrics improve (LCP, FCP, TTI)

---

## 🚀 Quick Start Commands

```bash
# 1. Create new Next.js project
cd /Users/shubhupadhyay/Desktop/Nexfellow-nextjs
npx create-next-app@latest admin-nextjs --typescript --tailwind --eslint --app

# 2. Install dependencies
cd admin-nextjs
npm install @reduxjs/toolkit react-redux redux-persist @emotion/react @emotion/styled @mui/material lucide-react react-icons axios date-fns chart.js react-chartjs-2 sonner file-saver marked class-variance-authority classnames sass

# 3. Start development
npm run dev
```

---

## 📝 Notes

- ✅ Migration to TypeScript has been completed for all migrated components
- The client app is already using Vite; consider keeping admin separate or co-locating
- Some commented routes in App.jsx (quiz, challenge, rewards) may need to be migrated later
- The `GeekMailer` external link should remain as an external link
- React 19 compatibility issues with `react-quill` and `react-beautiful-dnd` require alternative libraries

---

## 🏁 Quick Start (Post-Migration)

```bash
# Navigate to the Next.js admin project
cd /Users/shubhupadhyay/Desktop/Nexfellow-nextjs/admin-nextjs

# Create environment file
cp env.example.txt .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL

# Install dependencies (if not already done)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

*Document created: December 31, 2024*
*Last updated: December 31, 2024 - Migration ~95% complete*
*Status: Core admin pages migrated, Quiz/Challenge/Rewards routes pending*
