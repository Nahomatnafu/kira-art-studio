"use client";
import Link from "next/link";
import {useImageSettings} from "./ImageSettingsProvider";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import type { Artwork, Content } from "@/lib/content";
import { getStudioContacts } from "@/lib/content";
import SocialLinks, { InstagramIcon } from "./SocialLinks";
const nav = [
  ["Home", "/"],
  ["About", "/about"],
  ["Artwork", "/artwork"],
  ["Commissions", "/commissions"],
  ["Exhibitions", "/exhibitions"],
  ["Community", "/community"],
  ["Contact", "/contact"],
];
export function Logo() {
  const images=useImageSettings();
  return (
    <picture className="brand-logo">
      <source
        media="(max-width: 640px)"
        srcSet={images["brand.vertical"]?.src || "/images/kira-logo-vertical.jpg"}
      />
      <img
        src={images["brand.horizontal"]?.src || "/images/kira-logo-horizontal.jpg"}
        alt="Kira Art Studio"
        width={190}
        height={95}
      />
    </picture>
  );
}
export function Header({
  artworks,
  instagram,
}: {
  artworks: Artwork[];
  instagram: string;
}) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setMenu(false);
    setSearch(false);
  }, [pathname]);
  useEffect(() => {
    if (!search) return;
    input.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearch(false);
        searchButton.current?.focus();
      }
      if (e.key === "Tab") {
        const dialog = document.querySelector<HTMLElement>(".search-dialog");
        const focusable = dialog?.querySelectorAll<HTMLElement>(
          "button,a[href],input",
        );
        if (!focusable?.length) return;
        const first = focusable[0],
          last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = previous;
    };
  }, [search]);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <Link href="/" aria-label="KIRA Art Studio home">
          <Logo />
        </Link>
        <nav
          aria-label="Main navigation"
          className={menu ? "main-nav open" : "main-nav"}
        >
          {nav.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              onClick={() => setMenu(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button
            ref={searchButton}
            className="icon-button"
            aria-label="Search artwork"
            onClick={() => setSearch(true)}
          >
            <Search size={18} />
          </button>
          {instagram && (
            <a
              className="icon-button social-header"
              href={instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <InstagramIcon size={18} />
            </a>
          )}
          <button
            className="icon-button menu-toggle"
            aria-label={menu ? "Close navigation" : "Open navigation"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {search && (
        <div
          className="search-backdrop"
          onClick={() => {
            setSearch(false);
            searchButton.current?.focus();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-heading"
            className="search-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="section-top">
              <h2 id="search-heading">Find a work of art.</h2>
              <button
                className="icon-button"
                aria-label="Close search"
                onClick={() => {
                  setSearch(false);
                  searchButton.current?.focus();
                }}
              >
                <X />
              </button>
            </div>
            <input
              ref={input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search artwork by title or medium…"
              aria-label="Search artwork"
            />
            <div className="search-results">
              {artworks
                .filter(
                  (a) =>
                    a.published &&
                    (a.title + " " + a.materials)
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                )
                .map((a) => (
                  <Link
                    key={a.id}
                    onClick={() => setSearch(false)}
                    href={"/artwork/" + a.slug}
                  >
                    <span>
                      {a.title}
                      <small>{a.materials}</small>
                    </span>
                  </Link>
                ))}
              {!artworks.some(
                (a) =>
                  a.published &&
                  (a.title + " " + a.materials)
                    .toLowerCase()
                    .includes(query.toLowerCase()),
              ) && <p>No artwork found. Try another title or medium.</p>}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
export function Footer({ settings }: { settings: Pick<Content["settings"],"email"|"phone"|"instagram"|"tiktok"|"location"> }) {
  const contact = getStudioContacts(settings);
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Link href="/" aria-label="KIRA Art Studio home">
            <Logo />
          </Link>
        </div>
        <div className="footer-links">
          {nav.slice(1).map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
          <Link href="/collections">Collections</Link>
        </div>
        <div className="footer-invitation">
          <span className="eyebrow">LET’S CONNECT</span>
          <Link href="/contact">Send a Message</Link>
          <p>{settings.location}</p>
          <SocialLinks instagram={contact.instagram} tiktok={contact.tiktok} />
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Kira Art Studio. All rights reserved.
        </span>
        <span>Original artwork. Do not reproduce without permission.</span>

      </div>
    </footer>
  );
}
