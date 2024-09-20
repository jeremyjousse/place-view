"use client";

import Link from "next/link";

const Navbar = () => {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/"
          className="text-foreground transition-colors hover:text-foreground"
        >
          Places
        </Link>

        <Link
          href="/places/add"
          className="text-foreground transition-colors hover:text-foreground"
        >
          Add place
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
