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
  title: "ScamLens | SMS Message Intelligence",
  description:
    "Analyze SMS messages with a machine-learning model and inspect the prediction, class probabilities, and message indicators.",
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
