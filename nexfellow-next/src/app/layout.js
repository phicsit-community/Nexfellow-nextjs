import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/Providers";
import { playfair } from "./fonts";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  metadataBase: new URL("https://nexfellow.com"),
  title: "NexFellow - Bringing Geeks Together",
  description: "Join NexFellow to connect with tech enthusiasts, participate in challenges, attend events, and grow your skills in a supportive community.",
  openGraph: {
    title: "NexFellow - Bringing Geeks Together",
    description: "Join NexFellow to connect with tech enthusiasts, participate in challenges, attend events, and grow your skills in a supportive community.",
    url: "https://nexfellow.com",
    siteName: "NexFellow",
    images: [
      {
        url: "https://nexfellow.com/og-v2.png",
        width: 1200,
        height: 630,
        alt: "NexFellow - Bringing Geeks Together",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexFellow - Bringing Geeks Together",
    description: "Join NexFellow to connect with tech enthusiasts, participate in challenges, attend events, and grow your skills in a supportive community.",
    images: ["https://nexfellow.com/og-v2.png"],
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
      <body id="root" className={`${poppins.className} ${playfair.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
