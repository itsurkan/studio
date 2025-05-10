
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/theme-provider";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

export function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();
  const t = useTranslations("ThemeSwitcher");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label={t('toggleTheme')}>
          {resolvedTheme === 'dark' ? 
            <Moon className="h-[1.2rem] w-[1.2rem] transition-all" /> : 
            <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
          }
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          {t('light')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          {t('dark')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Laptop className="mr-2 h-4 w-4" />
          {t('system')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
