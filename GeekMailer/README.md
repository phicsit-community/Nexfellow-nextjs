# GeekMailer

A Next.js-based email scheduling and management platform.

## Features

- 📧 Send emails immediately or schedule them for later
- 📅 Set up recurring emails (daily, weekly, monthly, yearly)
- 📋 Manage contact lists
- 👥 Store and organize contacts
- 📊 Dashboard with email statistics

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit with redux-persist
- **Icons**: React Icons
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Navigate to the GeekMailer folder:
   ```bash
   cd GeekMailer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

4. Update the `.env.local` file with your API URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/          # Login page
│   ├── (dashboard)/
│   │   ├── page.tsx        # Home/Dashboard
│   │   ├── contact/        # Contacts page
│   │   ├── lists/          # Lists page
│   │   ├── send-email/     # Send email page
│   │   └── view-emails/    # View emails page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/
│   ├── Card.tsx            # Stats card component
│   ├── CardContainer.tsx   # Card container component
│   ├── Header.tsx          # App header
│   ├── Loader.tsx          # Loading spinner
│   ├── RecipientsSelector.tsx
│   ├── RichTextEditor.tsx  # Email content editor
│   ├── SchedulingOptions.tsx
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── modals/             # Modal components
│   └── tables/             # Table components
└── lib/
    ├── store/              # Redux store
    │   ├── store.ts
    │   ├── StoreProvider.tsx
    │   └── slices/
    └── utils/
        └── cronUtils.ts    # Cron expression utilities
```

## API Endpoints

The app expects the following API endpoints:

- `POST /auth/login` - User authentication
- `GET /home` - Dashboard statistics
- `GET /users` - List all contacts
- `GET /emails/admin/:adminId` - Get admin's emails
- `POST /emails/send-immediate` - Send email immediately
- `POST /emails/schedule` - Schedule email
- `GET /contact-lists/all` - Get all contact lists
- `GET /lists/admin/:adminId` - Get admin's lists

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
