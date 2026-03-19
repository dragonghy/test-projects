import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DevToolBox — Free Online Developer Tools",
  description:
    "Free online developer tools — JSON formatter, Base64 encoder, UUID generator, regex tester, color picker, and more. Fast, modern, no signup required.",
  keywords:
    "developer tools, online tools, json formatter, base64, uuid generator, regex tester, free",
  metadataBase: new URL("https://devtoolbox-gules.vercel.app"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "DevToolBox — Free Online Developer Tools",
    description:
      "Free online developer tools — JSON formatter, Base64 encoder, UUID generator, and more.",
    siteName: "DevToolBox",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
