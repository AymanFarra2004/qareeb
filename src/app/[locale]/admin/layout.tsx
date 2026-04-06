import { Shield, LayoutDashboard, Server, Bell, Settings, LogOut, CheckSquare } from "lucide-react";
import { Link } from "@/src/i18n/routing";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-background border-r border-border hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Shield className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-xl font-bold text-foreground">Habbat Admin</h1>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 relative">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Management</div>
          
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-muted text-foreground font-medium">
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
            Dashboard
          </Link>
          
          <Link href="/admin/hubs" className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-muted text-foreground font-medium flex-1">
            <CheckSquare className="h-5 w-5 text-muted-foreground" />
            Hub Approvals
          </Link>
          
          <Link href="/admin/services" className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-muted text-foreground font-medium">
            <Server className="h-5 w-5 text-muted-foreground" />
            Global Services
          </Link>
          
          <Link href="/admin/notifications" className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-muted text-foreground font-medium">
            <Bell className="h-5 w-5 text-muted-foreground" />
            Notifications
          </Link>
        </nav>
        
        <div className="p-4 border-t border-border">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-red-50 text-red-600 font-medium">
            <LogOut className="h-5 w-5" />
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-background border-b border-border flex items-center px-4 md:hidden justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-primary mr-2" />
            <span className="font-bold">Admin</span>
          </div>
          {/* Mobile menu trigger could go here */}
        </header>

        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
