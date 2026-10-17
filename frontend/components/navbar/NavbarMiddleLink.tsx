// app/components/navbar/NavbarMiddleLink.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Home } from "lucide-react";

export default function NavbarMiddleLink() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <Link
      href={isHome ? "/ml-info" : "/"}
      className=" hidden sm:flex justify-center items-center gap-2 h-7 px-3 rounded-xl bg-white/[0.07] border border-white/[0.09] hover:bg-white/[0.11] transition-all duration-150 group"
    >
      {isHome ? (
        <LayoutDashboard className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors duration-150" />
      ) : (
        <Home className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors duration-150" />
      )}
      <span className="text-[13px] font-medium text-white/75 group-hover:text-white tracking-[-0.2px] transition-colors duration-150">
        {isHome ? "Ml Info" : "Home"}
      </span>
    </Link>
  );
}