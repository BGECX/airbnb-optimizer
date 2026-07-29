"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function LangSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(newLocale: Locale) {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{localeNames[locale]}</span>
        <span className="text-gray-400 text-xs">▼</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            <p className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {t("language")}
            </p>
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  loc === locale
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="mr-2">{loc === locale ? "✓" : ""}</span>
                {localeNames[loc]}
                <span className="ml-2 text-gray-400 text-xs">({loc})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
