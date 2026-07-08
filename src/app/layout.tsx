import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "5th Sem CSE Timetable Downloader",
  description: "Filter and download your personalized 5th-semester core CSE and PE1/PE2 elective timetable instantly as PDF or high-quality Image.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
