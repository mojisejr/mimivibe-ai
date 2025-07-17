"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Logo } from "@/components/ui";

interface NavbarProps {
  /** Additional CSS classes for the navbar container */
  className?: string;
  /** Logo size variant */
  logoSize?: "sm" | "md" | "lg" | "xl";
  /** Show text alongside logo on desktop */
  showText?: boolean;
}

export const Navbar = ({
  className = "",
  logoSize = "xl",
  showText = false,
}: NavbarProps) => {
  return (
    <header className={`navbar bg-base-100/90 backdrop-blur-sm shadow-lg ${className}`}>
      <div className="navbar-start">
        {/* Mobile: Logo only, Desktop: Logo + Text (if enabled) */}
        <Link href="/" className="flex items-center">
          <div className="flex items-center">
            {/* Mobile version - logo only */}
            <div className="sm:hidden">
              <Logo
                size={logoSize}
                showText={false}
                className="hover:scale-105 transition-transform duration-200 cursor-pointer"
              />
            </div>

            {/* Desktop version - logo + text (conditional) */}
            <div className="hidden sm:flex">
              <Logo
                size={logoSize}
                showText={showText}
                className="hover:scale-105 transition-transform duration-200 cursor-pointer"
              />
            </div>
          </div>
        </Link>
      </div>
      <div className="navbar-end">
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
};