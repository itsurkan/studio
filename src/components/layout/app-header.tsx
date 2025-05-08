"use client";

import { BrainCircuit, Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebarNav } from "./app-sidebar-nav";
import { useIsMobile } from "@/hooks/use-mobile";


export function AppHeader() {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold">Gnosis.AI</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0 bg-sidebar">
                <Link href="/dashboard" className="flex items-center space-x-2 p-4 border-b">
                  <BrainCircuit className="h-6 w-6 text-primary" />
                  <span className="inline-block font-bold">Gnosis.AI</span>
                </Link>
                <div className="p-4">
                 <AppSidebarNav />
                </div>
              </SheetContent>
            </Sheet>
          )}
           {/* Placeholder for User Avatar/Auth actions */}
           {/* <UserNav /> */}
        </div>
      </div>
    </header>
  );
}
