import type { Metadata } from "next";
import { Poppins, Caveat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { PageTransitionProvider } from "./components/PageTransitionProvider";
import Sidebar from "./components/Sidebar";
import MobileHeader from "./components/MobileHeader";
import MobileBottomNav from "./components/MobileBottomNav";
import FloatingControls from "./components/FloatingControls";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Nkuin Eugene - Portfolio",
  description: "Software Engineer Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${caveat.variable} antialiased`}>
      <body className="min-h-screen flex overflow-x-hidden select-none">
        <ThemeProvider>
          <PageTransitionProvider>
            <MobileHeader />
            <Sidebar />
            <FloatingControls />
            <main className="flex-1 ml-[280px] min-h-screen relative">
              {children}
            </main>
            <MobileBottomNav />
          </PageTransitionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
