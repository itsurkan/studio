
"use client";

import { Link, usePathname } from "@/navigation"; // Use localized Link and usePathname
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Home, Search, MessageSquareText } from "lucide-react";
import { useTranslations } from 'next-intl';

export function AppSidebarNav() {
  const pathname = usePathname();
  const t = useTranslations('AppSidebarNav');

  const navItems = [
    { href: "/dashboard" as const, labelKey: "dashboard", icon: Home },
    { href: "/search" as const, labelKey: "semanticSearch", icon: Search },
    { href: "/rag" as const, labelKey: "rag", icon: MessageSquareText },
  ];

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
          {t(item.labelKey as any)} {/* Use t() for labels */}
        </Link>
      ))}
    </nav>
  );
}
