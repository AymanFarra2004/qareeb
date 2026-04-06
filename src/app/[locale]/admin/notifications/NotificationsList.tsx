"use client";

import { useState } from "react";
import { markAllAdminNotificationsRead } from "@/src/actions/admin";
import { Loader2, BellRing, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationsList({ initialNotifications }: { initialNotifications: any[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isMarking, setIsMarking] = useState(false);
  const router = useRouter();

  const handleMarkAll = async () => {
    setIsMarking(true);
    const res = await markAllAdminNotificationsRead();
    if (res.success) {
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      router.refresh();
    } else {
      alert(res.error || "Failed to mark as read");
    }
    setIsMarking(false);
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-background rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <BellRing className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Activity Log</h3>
            <p className="text-muted-foreground text-sm">You have {unreadCount} unread notifications.</p>
          </div>
        </div>
        <button 
          onClick={handleMarkAll}
          disabled={isMarking || unreadCount === 0}
          className="bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isMarking ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Mark All Read
        </button>
      </div>

      <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No notifications available.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notif) => (
              <div key={notif.id} className={`p-4 hover:bg-muted/30 transition-colors flex items-start gap-4 ${!notif.read_at ? 'bg-primary/5' : ''}`}>
                <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${!notif.read_at ? 'bg-primary' : 'bg-muted'}`} />
                <div className="flex-1">
                  <p className={`text-sm ${!notif.read_at ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                    {notif.data?.message || "Internal system notification"}
                  </p>
                  <span className="text-xs text-muted-foreground mt-1.5 block">
                    {new Date(notif.created_at || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
