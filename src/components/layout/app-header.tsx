
"use client";

import { BrainCircuit, Menu } from "lucide-react";
import { Link } from "@/navigation"; // Use localized Link
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AppSidebarNav } from "./app-sidebar-nav";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserNav } from "@/components/auth/user-nav"; 
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from "./language-switcher";

export function AppHeader() {
  const isMobile = useIsMobile();
  const t = useTranslations('AppHeader');

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10 items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold">{t('title')}</span>
          </Link>
          {isMobile && ( 
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">{t('toggleMenu')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0 bg-sidebar w-[250px] sm:w-[300px]" aria-label={t('toggleMenu')}>
                <SheetHeader className="p-6 border-b border-sidebar-border">
                   {/* SheetTitle is required for Radix Dialog (Sheet) accessibility. 
                       It will be visually hidden if not explicitly rendered but is needed by screen readers.
                       Here we make it the app title.
                   */}
                  <SheetTitle>
                    <Link href="/dashboard" className="flex items-center space-x-2 text-sidebar-foreground hover:text-sidebar-primary">
                      <BrainCircuit className="h-6 w-6 text-sidebar-primary" />
                      <span className="text-lg font-semibold">{t('title')}</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-grow p-4 overflow-y-auto">
                 <AppSidebarNav />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
           <LanguageSwitcher />
           <UserNav /> 
        </div>
      </div>
    </header>
  );
}

