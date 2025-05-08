"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { AppSidebarNav } from "./app-sidebar-nav";
import { BrainCircuit } from "lucide-react";
import Link from "next/link";

export function AppSidebar() {
  return (
    <aside className="fixed top-0 left-0 z-30 hidden h-screen w-64 flex-col border-r bg-sidebar pt-16 md:flex">
      <ScrollArea className="flex-1 py-4 px-2">
         <AppSidebarNav />
      </ScrollArea>
    </aside>
  );
}
