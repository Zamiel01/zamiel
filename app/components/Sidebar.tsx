"use client";

import { usePathname } from "next/navigation";
import TransitionLink from "./TransitionLink";
import {
  FaHouse,
  FaUser,
  FaListUl,
  FaBriefcase,
  FaCommentDots,
  FaEnvelope,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa6";

const navItems = [
  { href: "/", label: "Home", icon: FaHouse },
  { href: "/about", label: "About", icon: FaUser },
  { href: "/services", label: "Services", icon: FaListUl },
  { href: "/projects", label: "Projects", icon: FaBriefcase },
  { href: "/contact", label: "Contact", icon: FaCommentDots },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed h-full left-0 top-0 z-[100] flex flex-col justify-between px-[35px] py-[50px] shrink-0">
      <div>
        <div className="logo-container mb-[70px]">
          <div className="logo-text text-[var(--text-main)]">NE</div>
        </div>
        <nav>
          <ul className="flex flex-col">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href} className={isActive ? "active" : ""}>
                  <TransitionLink href={item.href}>
                    <item.icon /> {item.label}
                  </TransitionLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className="sidebar-socials flex gap-[14px] pt-[30px]">
        <a href="mailto:nkuinmbeng@gmail.com" title="Email" className="text-lg">
          <FaEnvelope />
        </a>
        <a
          href="https://linkedin.com/in/nkuineugene"
          target="_blank"
          title="LinkedIn"
          className="text-lg"
        >
          <FaLinkedinIn />
        </a>
        <a
          href="https://github.com/zamiel01"
          target="_blank"
          title="GitHub"
          className="text-lg"
        >
          <FaGithub />
        </a>
      </div>
    </aside>
  );
}
