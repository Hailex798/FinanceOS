import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Finance OS",
  description: "A personal financial operating system"
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${inter.variable} bg-background text-foreground antialiased`}>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_32rem)]">
          {children}
        </div>
      </body>
    </html>
  );
}

