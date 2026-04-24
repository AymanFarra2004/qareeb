"use client";

import { Link } from "@/src/i18n/routing";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="relative bg-background border-t border-border mt-auto overflow-hidden">
      {/* Background Image (Desktop) */}
      {/* <Image
        src="/assets/images/logos/footer-bg.svg"
        alt="background"
        fill
        className="hidden md:block object-fill p-[60px]"
        priority
        quality={100}
      /> */}
      <div className="hidden md:block text-center absolute bottom-0 left-0 right-0 flex justify-center">
        <div className="text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] text-center py-10">
          Qareeb | قريب
        </div>
      </div>
      {/* Background Image (Mobile) */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center md:hidden -z-10">
        <div className="hidden md:block text-center absolute bottom-0 left-0 right-0 flex justify-center">
          <div className="text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] text-center py-10">
            Qareeb | قريب
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-500/20 backdrop-blur-[12px]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="Qareeb Logo"
                className="h-11 w-auto object-contain"
              />
              <span className="font-bold text-xl tracking-tight text-foreground">
                Qareeb | قريب
              </span>
            </Link>

            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              {t("tagline")}
            </p>

            <div className="flex space-x-4 rtl:space-x-reverse text-muted-foreground">
              <span className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" /> support@habbat.example.com
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {t("quickLinks")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/hubs"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("findHubs")}
                </Link>
              </li>
              <li>
                <Link
                  href="/submit"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("submitHub")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("contactUs")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">{t("legal")}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("termsOfService")}
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-in"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("hubOwnerLogin")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>{t("rights", { year: new Date().getFullYear() })}</p>
          <p className="mt-4 md:mt-0 flex items-center gap-1">
            {t("builtFor")} <span className="text-red-500">❤️</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
