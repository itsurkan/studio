
"use client";

import { usePathname, useRouter, Link } from "@/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { locales } from "@/i18n";

export function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const onSelectChange = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <Select value={locale} onValueChange={onSelectChange}>
      <SelectTrigger className="w-auto h-10 px-3 border-0 md:border md:border-input bg-transparent md:bg-background shadow-none md:shadow-sm focus:ring-0 md:focus:ring-2 md:focus:ring-ring md:focus:ring-offset-2">
        <Globe className="h-5 w-5 text-muted-foreground mr-0 md:mr-2" />
        <SelectValue placeholder={t("selectLanguage")} className="hidden md:block" />
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {loc.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
