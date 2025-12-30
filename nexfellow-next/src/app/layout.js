import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "NexFellow - Bringing Geeks Together",
  description: "Join NexFellow to connect with tech enthusiasts, participate in challenges, attend events, and grow your skills in a supportive community.",
  openGraph: {
    title: "NexFellow - Bringing Geeks Together",
    description: "Join NexFellow to connect with tech enthusiasts, participate in challenges, attend events, and grow your skills in a supportive community.",
    images: ["https://nexfellow.com/og.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexFellow - Bringing Geeks Together",
    description: "Join NexFellow to connect with tech enthusiasts, participate in challenges, attend events, and grow your skills in a supportive community.",
    images: ["https://nexfellow.com/og.png"],
  },
};

// Theme hydration script to prevent flash of wrong theme
const themeScript = `
  (function() {
    try {
      const theme = localStorage.getItem('theme') || 'light';
      const effectiveTheme = theme === 'system' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;
      document.documentElement.classList.add(effectiveTheme);
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
