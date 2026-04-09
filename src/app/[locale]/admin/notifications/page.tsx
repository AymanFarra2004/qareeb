import { getAdminNotifications } from "@/src/actions/admin";
import NotificationsList from "./NotificationsList";
import fs from "fs";

export default async function AdminNotificationsPage() {
  const res = await getAdminNotifications();
  
  // DEBUG PORTAL: Write to disk so the agent can inspect the structure
  try {
    fs.writeFileSync('.gemini-debug-notifs.json', JSON.stringify(res, null, 2));
  } catch (e) {}

  let notifications = res.data || [];
  if (!Array.isArray(notifications)) {
    notifications = notifications.data || [];
  }
  if (!Array.isArray(notifications)) notifications = [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Platform Notifications</h2>
        <p className="text-muted-foreground mt-1">Review system alerts, new hub applications, and user activities.</p>
      </div>

      {res.error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          Failed to load notifications: {res.error}
        </div>
      ) : (
        <NotificationsList initialNotifications={notifications} />
      )}
    </div>
  );
}
