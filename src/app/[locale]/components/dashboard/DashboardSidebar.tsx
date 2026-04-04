"use client"
import { Link, usePathname, useRouter } from "@/src/i18n/routing";
import { LayoutDashboard, PlusCircle, Settings, LogOut, Menu } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "@/src/store/authSlice";
import { logoutUser } from "@/src/actions/auth";

export function DashboardSidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const handleSignOut = async () => {
    await logoutUser();
    dispatch(logout());
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <aside className="w-64 bg-background border-r border-border flex-col hidden md:flex h-full">
      <div className="p-6">
        <Link href="/" className="font-bold text-2xl tracking-tight text-primary">
          Habbat Owner
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
            isActive("/dashboard") && !pathname.includes("/hubs/new") && !pathname.includes("/settings")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          My Hubs
        </Link>

        <Link
          href="/dashboard/hubs/new"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
            isActive("/dashboard/hubs/new")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <PlusCircle className="h-5 w-5" />
          Create Hub
        </Link>

        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
            isActive("/dashboard/settings")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </nav>

      <div className="p-4 border-t border-border">
        <button onClick={handleSignOut} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-medium text-sm">
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
