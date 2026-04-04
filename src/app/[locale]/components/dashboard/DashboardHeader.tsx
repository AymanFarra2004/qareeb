"use client";

import { Menu, Bell, User, LogOut, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "@/src/store/authSlice";
import { logoutUser } from "@/src/actions/auth";
import { useRouter } from "@/src/i18n/routing";

export function DashboardHeader() {
  const [showMenu, setShowMenu] = useState(false);
  const [userName, setUserName] = useState("User");
  const dispatch = useDispatch();
  const router = useRouter();

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

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 border-2 border-background"></span>
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block">{userName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-lg py-1 z-50">
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
