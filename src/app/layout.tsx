import "./globals.css";

// import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "../trpc/react";

export const metadata: Metadata = {
  title: "一个人的一生 | Life Museum",
  description: "记录生命中每一个有意义的瞬间",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">
        <TRPCReactProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      一个人的一生
                    </h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <a
                      href="/"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      首页
                    </a>
                    <a
                      href="/admin"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      管理后台
                    </a>
                  </div>
                </div>
              </div>
            </nav>
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-white border-t border-gray-200 mt-16">
              <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="text-center text-gray-500 text-sm">
                  <p>© 2024 一个人的一生. 记录每一个有意义的瞬间.</p>
                </div>
              </div>
            </footer>
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
} 