import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "区块链早起闹钟",
  description: "基于Sui区块链的早起激励应用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased font-sans">
        <Providers>
          <NavBar />
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
