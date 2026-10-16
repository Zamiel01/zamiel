"use client";

export default function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen relative w-full">{children}</main>
  );
}