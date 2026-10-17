// app/components/navbar/Navbar.tsx
// SERVER COMPONENT — renders on server, zero client JS for the shell
// Only the interactive dropdown is client-side (NavbarUserMenu.tsx)

import Link from "next/link";
import NavbarMiddleLink from "./NavbarMiddleLink";
import { BrainCircuit } from "lucide-react";


export default async function Navbar() {


  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Frosted glass bar */}
      <div className="mx-auto max-w-[1100px] px-5 my-3 i-fonts">
        <nav className="flex items-center justify-between h-11 px-5 rounded-2xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-2xl shadow-[0_2px_24px_rgba(0,0,0,0.4),inset_0_0_0_0.5px_rgba(255,255,255,0.05)]">

          {/* Left — Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="Home"
          >
            <BrainCircuit
              className="w-[20px] h-[20px] text-blue-400 group-hover:text-blue-300 transition-colors duration-200"
            />
            <span className="text-[15px] font-semibold text-white/85 group-hover:text-white tracking-[-0.3px] transition-colors duration-200">
              SMS Threat Analyzer
            </span>
          </Link>

          <NavbarMiddleLink></NavbarMiddleLink>
        
         

        </nav>
      </div>
    </header>
  );
}