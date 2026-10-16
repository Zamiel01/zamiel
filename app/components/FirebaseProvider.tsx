"use client";

import { app, analytics } from "@/lib/firebase";

export default function FirebaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
