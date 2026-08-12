import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlgoVision | Algorithm Visual Learning Platform",
  description: "Learn Computer Science algorithms & data structures through synchronized code, visual animation, runtime state, and explanation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}
