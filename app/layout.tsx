import type { Metadata } from "next";
import { Poppins, Caveat } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import FirebaseProvider from "./components/FirebaseProvider";
import { PageTransitionProvider } from "./components/PageTransitionProvider";
import ConditionalSidebar from "./components/ConditionalSidebar";
import MobileHeader from "./components/MobileHeader";
import FloatingControls from "./components/FloatingControls";
import MainContent from "./components/MainContent";

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
          <FirebaseProvider>
            <PageTransitionProvider>
              <MobileHeader />
              <ConditionalSidebar />
              <FloatingControls />
              <MainContent>{children}</MainContent>
            </PageTransitionProvider>
          </FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}