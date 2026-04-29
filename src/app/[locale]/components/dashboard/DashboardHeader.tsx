"use client";

import { Menu, Bell, User, LogOut, ChevronDown, Home, Sun, Moon, Languages } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "@/src/store/authSlice";
import { logoutUser } from "@/src/actions/auth";
import { useRouter, Link, usePathname } from "@/src/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";

export function DashboardHeader() {
  const [showMenu, setShowMenu] = useState(false);
  const [userName, setUserName] = useState("User");
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { setTheme, theme } = useTheme();
  const t = useTranslations("DashboardHeader");

  useEffect(() => {
    try {
      const raw = document.cookie.split(';').find(c => c.trim().startsWith('user='));
      if (raw) {
        const user = JSON.parse(decodeURIComponent(raw.split('=').slice(1).join('=')));
        setUserName(user.name || "User");
      }
    } catch {}
  }, []);

  const handleSignOut = async () => {
    await logoutUser();
    dispatch(logout());
    localStorage.removeItem("token");
    router.push("/");
  };

  const handleLocaleSwitch = () => {
    const nextLocale = locale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <button className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1 sm:gap-2">
          
          <Link 
            href="/" 
            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
            title={t("home")}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline-block">{t("home")}</span>
          </Link>
          
          {/* <div className="flex items-center gap-2 px-2">
            <img src="/logo.png" alt="Qareeb Logo" className="h-8 w-auto object-contain" />
            <h1 className="text-base sm:text-lg font-bold text-foreground truncate max-w-[120px] sm:max-w-none">
              Qareeb | قريب
            </h1>
          </div> */}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="cursor-pointer p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={t("toggleTheme")}
        >
          <Sun className="h-5 w-5 hidden dark:block" />
          <Moon className="h-5 w-5 block dark:hidden" />
        </button>

        {/* Language Switcher 
        <button
          onClick={handleLocaleSwitch}
          className="cursor-pointer p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-bold"
          title={t("switchLanguage")}
        >
          <Languages className="h-5 w-5" />
          <span className="hidden xs:inline-block">{locale === "en" ? "عربي" : "EN"}</span>
        </button>
        */}

        <button className="cursor-pointer p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border-2 border-background"></span>
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="cursor-pointer flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl hover:bg-muted transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-foreground hidden md:block max-w-[80px] truncate">{userName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
          </button>

          {showMenu && (
            <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-48 bg-background border border-border rounded-xl shadow-lg py-1 z-50">
              <button 
                onClick={handleSignOut}
                className="cursor-pointer w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {t("signOut")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
