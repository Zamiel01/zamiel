"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function ConditionalSidebar() {
  const pathname = usePathname();
  if (
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/projects" ||
    pathname === "/contact"
  )
    return null;
  return <Sidebar />;
}