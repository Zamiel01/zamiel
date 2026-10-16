"use client";

import { usePathname } from "next/navigation";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/projects" ||
    pathname === "/contact";
  return (
    <main className={`flex-1 min-h-screen relative ${hideSidebar ? "" : "ml-[280px]"}`}>
      {children}
    </main>
  );
}