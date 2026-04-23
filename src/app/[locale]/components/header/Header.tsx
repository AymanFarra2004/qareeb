"use client";

import * as React from "react";
import { Link, usePathname, useRouter } from '@/src/i18n/routing';
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, X, MapPin, User, LogOut, LayoutDashboard, Settings, Languages } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/src/store/authSlice";
import { logoutUser } from "@/src/actions/auth";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", labelKey: "home" },
  { href: "/about", labelKey: "about" },
  { href: "/hubs", labelKey: "services" },
  { href: "/contact", labelKey: "contact" },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const { setTheme, theme } = useTheme();

  const pathname = usePathname();
  const t = useTranslations("Header");
  const router = useRouter();
  const locale = useLocale();

  // Redux Auth state
  const auth = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();

  const isLoggedIn = !!(auth && auth.isLoggedIn);
  const isHubOwner = isLoggedIn && auth?.user?.role === "hub_owner";
  const isAdmin = isLoggedIn && auth?.user?.role === "admin";
  const userName = auth?.user?.name || "User";

  const handleLogout = async () => {
    await logoutUser();
    dispatch(logout());
    localStorage.removeItem("token");
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const handleLocaleSwitch = () => {
    const nextLocale = locale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  React.useEffect(() => {
    const handleScroll = () => { setIsUserMenuOpen(false); };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-border/40 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <div className="shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
              <img src="/logo.png" alt="Qareeb Logo" className="h-13 w-auto object-contain drop-shadow-md" />
              <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Qareeb | قريب
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive
                      ? "bg-foreground/5 text-foreground"
                      : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                    }`}
                >
                  {t(`nav.${link.labelKey}`)}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Side Operations */}
          <div className="hidden md:flex items-center space-x-3 rtl:space-x-reverse">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-full bg-foreground/5 text-foreground hover:bg-foreground/10 transition-colors"
              aria-label={t('aria.toggleTheme')}
            >
              <Sun className="h-4 w-4 hidden dark:block" />
              <Moon className="h-4 w-4 block dark:hidden" />
            </button>

            {/* Language Switcher */}
            <button
              onClick={handleLocaleSwitch}
              className="p-2.5 rounded-full bg-foreground/5 text-foreground hover:bg-foreground/10 transition-colors flex items-center gap-1.5 text-sm font-semibold"
              aria-label={t('aria.switchLanguage')}
            >
              <Languages className="h-4 w-4" />
              {locale === "en" ? "عربي" : "EN"}
            </button>

            {/* Auth or User Burger Menu */}
            {!isLoggedIn ? (
              <div className="flex items-center space-x-2 rtl:space-x-reverse border-s border-border/50 ps-3">
                <Link href="/sign-in" className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                  {t('auth.signIn')}
                </Link>
                <Link href="/sign-up" className="px-5 py-2.5 text-sm font-semibold rounded-full bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 bg-gradient-to-l from-blue-600 to-purple-600">
                  {t('auth.signUp')}
                </Link>
              </div>
            ) : (
              <div className="relative border-s border-border/50 ps-3">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-full border border-border bg-background hover:bg-muted transition-all shadow-sm"
                >
                  <Menu className="h-5 w-5 text-muted-foreground" />
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="text-primary font-bold text-sm uppercase">{userName.charAt(0)}</span>
                  </div>
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute end-0 mt-3 w-56 rounded-2xl bg-background border border-border shadow-2xl overflow-hidden py-2"
                    >
                      <div className="px-4 py-3 border-b border-border/50">
                        <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                        <p className="text-xs text-muted-foreground truncate">{auth?.user?.email || "Signed in"}</p>
                      </div>

                      <div className="py-2">
                        {isHubOwner && (
                          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                            <LayoutDashboard className="h-4 w-4 text-primary" />
                            {t('userMenu.dashboard')}
                          </Link>
                        )}
                        {isAdmin && (
                          <Link href="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                            <Settings className="h-4 w-4 text-destructive" />
                            {t('userMenu.adminDashboard')}
                          </Link>
                        )}
                        <Link
                          href="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${pathname === '/profile'
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-foreground hover:bg-muted'
                            }`}
                        >
                          <User className="h-4 w-4" />
                          {t('userMenu.profile')}
                        </Link>
                      </div>

                      <div className="border-t border-border/50 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 w-full text-start transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          {t('userMenu.logout')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-3 rtl:space-x-reverse">
            {/* Language Switcher Mobile */}
            <button
              onClick={handleLocaleSwitch}
              className="p-2 rounded-full bg-foreground/5 text-foreground hover:bg-foreground/10 transition-colors text-xs font-bold"
            >
              {locale === "en" ? "عربي" : "EN"}
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-foreground/5 text-foreground hover:bg-foreground/10 transition-colors"
            >
              <Sun className="h-4 w-4 hidden dark:block" />
              <Moon className="h-4 w-4 block dark:hidden" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-foreground bg-foreground/5 hover:bg-foreground/10 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                  >
                    {t(`nav.${link.labelKey}`)}
                  </Link>
                );
              })}

              <div className="pt-4 mt-4 border-t border-border">
                {!isLoggedIn ? (
                  <div className="flex flex-col gap-3">
                    <Link onClick={() => setIsMobileMenuOpen(false)} href="/sign-in" className="w-full px-4 py-3 text-center text-sm font-medium rounded-xl border border-border hover:bg-muted transition-colors">
                      {t('auth.signIn')}
                    </Link>
                    <Link onClick={() => setIsMobileMenuOpen(false)} href="/sign-up" className="w-full px-4 py-3 text-center text-sm font-semibold rounded-xl bg-primary text-primary-foreground shadow-md">
                      {t('auth.signUp')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="px-4 py-2 mb-2 rounded-xl bg-muted/50 border border-border">
                      <p className="text-sm flex items-center gap-2"><User className="w-4 h-4" />{userName}</p>
                    </div>
                    {isHubOwner && (
                      <Link onClick={() => setIsMobileMenuOpen(false)} href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium">
                        <LayoutDashboard className="h-5 w-5" /> {t('userMenu.dashboard')}
                      </Link>
                    )}
                    {isAdmin && (
                      <Link onClick={() => setIsMobileMenuOpen(false)} href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 text-destructive font-medium">
                        <Settings className="h-5 w-5" /> {t('userMenu.adminDashboard')}
                      </Link>
                    )}
                    <Link
                      onClick={() => setIsMobileMenuOpen(false)}
                      href="/profile"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/profile'
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                      <User className="h-5 w-5" /> {t('userMenu.profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 rounded-xl w-full text-start transition-colors font-medium border border-transparent hover:border-destructive/20"
                    >
                      <LogOut className="h-5 w-5" />
                      {t('userMenu.logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}