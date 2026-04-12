import { getAdminHubs } from "@/src/actions/admin";
import HubsTable from "./HubsTable";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";

export default async function AdminHubsPage() {
  const locale = await getLocale();
  const res = await getAdminHubs(locale);
  const t = await getTranslations("Admin");
  
  // Guard for error state to ensure res.data exists in the success path
  if (res.error) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight underline decoration-primary/30 underline-offset-8">{t("hubManagement")}</h2>
          <p className="text-muted-foreground mt-2">{t("hubManagementDesc")}</p>
        </div>
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {res.error}
        </div>
      </div>
    );
  }

  const hubs = res.data || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight underline decoration-primary/30 underline-offset-8">{t("hubManagement")}</h2>
        <p className="text-muted-foreground mt-2">{t("hubManagementDesc")}</p>
      </div>

      <HubsTable initialHubs={hubs} />
    </div>
  );
}
