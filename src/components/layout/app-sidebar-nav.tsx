"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Home, Search, MessageSquareText, FileUp, Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/search", label: "Semantic Search", icon: Search },
  { href: "/rag", label: "Ask Your Data (RAG)", icon: MessageSquareText },
  // { href: "/settings", label: "Settings", icon: Settings }, // Future placeholder
];

export function AppSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: pathname === item.href ? "secondary" : "ghost" }),
            "w-full justify-start"
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
