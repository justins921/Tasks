import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskFlow - Time Tracker",
  description: "Track tasks and time across clients and projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
