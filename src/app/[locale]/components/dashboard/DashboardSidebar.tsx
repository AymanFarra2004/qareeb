"use client"
import { Link, usePathname, useRouter } from "@/src/i18n/routing";
import { LayoutDashboard, PlusCircle, Settings, LogOut, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "@/src/store/authSlice";
import { logoutUser } from "@/src/actions/auth";
import { useTranslations } from "next-intl";

export function DashboardSidebar({ isSidebarOpen, onClose }: { isSidebarOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const t = useTranslations("DashboardSidebar");

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const handleSignOut = async () => {
    await logoutUser();
    dispatch(logout());
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <aside className={`
      fixed inset-y-0 start-0 z-50 w-64 bg-background border-r border-border flex-col transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full lg:ltr:translate-x-0 lg:rtl:translate-x-0"}
      flex
    `}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-border">
        <Link href="/">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Qareeb Logo" className="h-12 w-auto object-contain" />
          <h1 className="text-xl font-bold text-foreground tracking-tight">Qareeb | قريب</h1>
        </div>
        </Link>
        {onClose && (
          <button 
            onClick={onClose}
            className="cursor-pointer lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <Link
          href="/dashboard"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
            isActive("/dashboard") && !pathname.includes("/hubs/new") && !pathname.includes("/settings")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          {t("myHubs")}
        </Link>

        <Link
          href="/dashboard/hubs/new"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
            isActive("/dashboard/hubs/new")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <PlusCircle className="h-5 w-5" />
          {t("createHub")}
        </Link>

        <Link
          href="/dashboard/settings"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
            isActive("/dashboard/settings")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Settings className="h-5 w-5" />
          {t("settings")}
        </Link>
      </nav>

      <div className="p-4 border-t border-border">
        <button onClick={handleSignOut} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-medium text-sm">
          <LogOut className="h-5 w-5" />
          {t("signOut")}
        </button>
      </div>
    </aside>
  );
}
