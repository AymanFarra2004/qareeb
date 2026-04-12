import { getAdminNotifications } from "@/src/actions/admin";
import NotificationsList from "./NotificationsList";
import { getTranslations, getLocale } from "next-intl/server";

export default async function AdminNotificationsPage() {
  const locale = await getLocale();
  const t = await getTranslations("AdminNotifications");
  const res = await getAdminNotifications(locale);
  
  let notifications = res.data || [];
  if (!Array.isArray(notifications)) {
    notifications = notifications.data || [];
  }
  if (!Array.isArray(notifications)) notifications = [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground mt-1">{t("description")}</p>
      </div>

      {res.error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {t("failedToLoad")}: {res.error}
        </div>
      ) : (
        <NotificationsList initialNotifications={notifications} />
      )}
    </div>
  );
}
