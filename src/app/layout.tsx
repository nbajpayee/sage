import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Sage - Wisdom Guide",
  description: "Connect with history's greatest spiritual teachers through AI-powered conversations that bring ancient wisdom to modern life",
  keywords: ["wisdom", "spirituality", "AI", "Krishna", "philosophy", "guidance"],
  authors: [{ name: "Sage Team" }],
  openGraph: {
    title: "Sage - Wisdom Guide",
    description: "Connect with history's greatest spiritual teachers through AI-powered conversations",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
