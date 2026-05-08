"use client";

import { Shield, LayoutDashboard, Server, Bell, Settings, LogOut, CheckSquare, AlertTriangle, X, Users, MessageSquare, MapPin } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { useSelector } from "react-redux";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AdminHeader } from "../components/admin/AdminHeader";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const auth = useSelector((state: any) => state.auth);
  const isLoggedIn = !!(auth && auth.isLoggedIn);
  const isAdmin = isLoggedIn && auth?.user?.role === "admin";
  const t = useTranslations("AdminLayout");

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="bg-background p-8 rounded-2xl shadow-lg text-center max-w-md w-full border border-border">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-3">{t("accessDenied")}</h1>
          <p className="text-muted-foreground mb-8">
            {t("accessDeniedDesc")}
          </p>
          <Link href="/" className="cursor-pointer inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors w-full">
            {t("returnHome")}
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen bg-muted/40 relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Admin Sidebar */}
      <aside className={`
        fixed inset-y-0 start-0 z-50 w-64 bg-background border-e border-border transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full lg:ltr:translate-x-0 lg:rtl:translate-x-0"}
        flex flex-col
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Qareeb Logo" className="h-12 w-auto object-contain" />
            <h1 className="text-xl font-bold text-foreground tracking-tight">Qareeb | قريب</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="cursor-pointer lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 relative">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">{t("management")}</div>
          
          <Link 
            href="/admin" 
            onClick={() => setIsSidebarOpen(false)}
            className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-muted text-foreground font-medium"
          >
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
            {t("dashboard")}
          </Link>
          
          <Link 
            href="/admin/hubs" 
            onClick={() => setIsSidebarOpen(false)}
            className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-muted text-foreground font-medium flex-1"
          >
            <CheckSquare className="h-5 w-5 text-muted-foreground" />
            {t("hubApprovals")}
          </Link>
          
          <Link 
            href="/admin/services" 
            onClick={() => setIsSidebarOpen(false)}
            className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-muted text-foreground font-medium"
          >
            <Server className="h-5 w-5 text-muted-foreground" />
            {t("globalServices")}
          </Link>
          
          <Link 
            href="/admin/notifications" 
            onClick={() => setIsSidebarOpen(false)}
            className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-muted text-foreground font-medium"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            {t("notifications")}
          </Link>
          <Link 
            href="/admin/users" 
            onClick={() => setIsSidebarOpen(false)}
            className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-muted text-foreground font-medium"
          >
            <Users className="h-5 w-5 text-muted-foreground" />
            {t("userManagement")}
          </Link>
          
          <Link 
            href="/admin/locations" 
            onClick={() => setIsSidebarOpen(false)}
            className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-muted text-foreground font-medium"
          >
            <MapPin className="h-5 w-5 text-muted-foreground" />
            {t("locations")}
          </Link>
          
          <Link 
            href="/admin/reviews" 
            onClick={() => setIsSidebarOpen(false)}
            className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-muted text-foreground font-medium"
          >
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            {t("reviewManagement")}
          </Link>
        </nav>
        
        <div className="p-4 border-t border-border">
          <Link href="/" className="cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-red-50 text-red-600 font-medium">
            <LogOut className="h-5 w-5" />
            {t("exitAdmin")}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />

        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
