"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaBars, FaXmark } from "react-icons/fa6";
import styles from "./SiteNavbar.module.css";
import TransitionLink from "./TransitionLink";

const routes = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/memories", label: "Memories" },
  { href: "/contact", label: "Contact" },
] as const;

const focusableElements =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isCurrentRoute(pathname: string, href: string) {
  const normalizedPath = pathname === "/" ? pathname : pathname.replace(/\/+$/, "");
  return normalizedPath === href || (href !== "/" && normalizedPath.startsWith(`${href}/`));
}

export default function SiteNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openedOnPath, setOpenedOnPath] = useState(pathname);
  const isOpen = menuOpen && openedOnPath === pathname;
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const menuButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLElement>(focusableElements)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(focusableElements)
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      menuButton?.focus();
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (isOpen) {
      setMenuOpen(false);
      return;
    }
    setOpenedOnPath(pathname);
    setMenuOpen(true);
  };

  const renderLinks = (onSelect?: () => void) =>
    routes.map((route) => {
      const active = isCurrentRoute(pathname, route.href);
      return (
        <li key={route.href}>
          <TransitionLink
            href={route.href}
            active={active}
            className={styles.link}
            onClick={onSelect}
          >
            {route.label}
          </TransitionLink>
        </li>
      );
    });

  return (
    <>
      <header className={styles.siteNavbar}>
        <div className={styles.inner}>
          <TransitionLink href="/" className={styles.brand} aria-current={isCurrentRoute(pathname, "/") ? "page" : undefined}>
            NE
          </TransitionLink>

          <nav className={styles.desktop} aria-label="Main navigation">
            <ul>{renderLinks()}</ul>
          </nav>

          <button
            ref={menuButtonRef}
            type="button"
            className={styles.menuButton}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            aria-controls="site-navbar-drawer"
            onClick={toggleMenu}
          >
            {isOpen ? <FaXmark aria-hidden="true" /> : <FaBars aria-hidden="true" />}
          </button>
        </div>
      </header>

      <div
        className={styles.overlay}
        hidden={!isOpen}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close navigation menu"
          tabIndex={-1}
          onClick={() => setMenuOpen(false)}
        />
        <div
          ref={drawerRef}
          id="site-navbar-drawer"
          className={styles.drawer}
          role="dialog"
          aria-modal={isOpen ? true : undefined}
          aria-labelledby="site-navbar-drawer-title"
          aria-hidden={!isOpen}
        >
          <div className={styles.drawerHeader}>
            <span className={styles.brand} aria-hidden="true">
              NE
            </span>
            <h2 id="site-navbar-drawer-title">Navigation</h2>
            <button
              type="button"
              className={styles.menuButton}
              aria-label="Close navigation menu"
              onClick={() => setMenuOpen(false)}
            >
              <FaXmark aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Main navigation">
            <ul>{renderLinks(() => setMenuOpen(false))}</ul>
          </nav>
        </div>
      </div>
    </>
  );
}
