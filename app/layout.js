import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Providers from "../components/providers";
import { Toaster } from "sonner"
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Wealth",
  description: "One stop for all your wealth management needs",
};

export default function RootLayout({ children }) {
  return (
    <Providers>
      <html lang="en">
        <body
          className={`${inter.className}`}
        >
          {/* Header */}
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster richColors />
          {/* footer */}
          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto py-4 text-center text-gray-500">
              <p>© 2025 Wealth. All rights reserved.</p>
            </div>
          </footer>
        </body>
      </html>
    </Providers>
  );
}
