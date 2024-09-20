import "./globals.css";

import { Inter as FontSans } from "next/font/google";
import type { Metadata } from "next";
import Navbar from "@/components/organisms/Navbar";
import { cn } from "@/lib/client/ui/utils";

const fontSans = FontSans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Place view admin tools",
  description: "Simple dashboard to mange places",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased w-full flex flex-col",
          fontSans.variable
        )}
      >
        <Navbar></Navbar>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
