import type { Metadata } from "next";
import "./globals.css";
import { Figtree, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar/Navbar";

// Keep the same font setup and CSS-variable approach as the existing project.
const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL("https://ml-mini-project-2-nextjs.vercel.app"),

  title: {
    default: "SMS Threat Analyzer",
    template: "%s | SMS Threat Analyzer",
  },

  description:
    "Analyze SMS messages using machine learning to identify Ham, Smishing, and Spam threats.",

  applicationName: "SMS Threat Analyzer",

  keywords: [
    "SMS Threat Analyzer",
    "SMS spam detection",
    "smishing detection",
    "SMS phishing detection",
    "spam message classifier",
    "machine learning",
    "SMS threat classification",
  ],

  authors: [{ name: "Dev Malik" }],
  creator: "Dev Malik",
  publisher: "SMS Threat Analyzer",

  category: "technology",

  icons: {
    icon: "/favicon2.ico",
  },

  openGraph: {
    title: "SMS Threat Analyzer",
    description:
      "Analyze SMS messages and detect potential spam and smishing threats using machine learning.",
    url: "https://ml-mini-project-2-nextjs.vercel.app",
    siteName: "SMS Threat Analyzer",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SMS Threat Analyzer",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "SMS Threat Analyzer",
    description:
      "Classify SMS messages as Ham, Smishing, or Spam using machine learning.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className={`min-h-full flex flex-col bg-i-black ${geistSans.variable} ${geistMono.variable} ${figtree.variable}`}
      >
        <Navbar></Navbar>
        {children}
        <Toaster  theme="dark"/>
      </body>
    </html>
  );
}
