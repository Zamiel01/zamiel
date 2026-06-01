"use client";

import { usePathname } from "next/navigation";
import TransitionLink from "./TransitionLink";
import {
  FaHouse,
  FaUser,
  FaListUl,
  FaBriefcase,
  FaCommentDots,
} from "react-icons/fa6";

const navItems = [
  { href: "/", label: "Home", icon: FaHouse },
  { href: "/about", label: "About", icon: FaUser },
  { href: "/services", label: "Services", icon: FaListUl },
  { href: "/projects", label: "Projects", icon: FaBriefcase },
  { href: "/contact", label: "Contact", icon: FaCommentDots },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="mobile-bottom-nav">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <TransitionLink
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${isActive ? "active" : ""}`}
          >
            <item.icon />
            <span>{item.label}</span>
          </TransitionLink>
        );
      })}
    </div>
  );
}
