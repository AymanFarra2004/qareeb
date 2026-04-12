import { getMyHubs } from "@/src/actions/hubs";
import { HubCard } from "../components/dashboard/HubCard";
import { Link } from "@/src/i18n/routing";
import { PlusCircle, Wifi } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";

export default async function DashboardOverviewPage() {
  const locale = await getLocale();
  const { data: hubs, error } = await getMyHubs(locale);
  const t = await getTranslations("Dashboard");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">{t("myHubs")}</h2>
          <p className="text-muted-foreground mt-1">{t("myHubsDesc")}</p>
        </div>
        
        <Link 
          href="/dashboard/hubs/new" 
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium hover:bg-primary/90 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <PlusCircle className="h-5 w-5" />
          {t("createNewHub")}
        </Link>
      </div>

      {error ? (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600">
          <p className="font-medium">{t("failedToLoad")}</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : hubs && hubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hubs.map((hub: any, i: number) => (
             <HubCard key={hub.id || i} hub={hub} />
          ))}
        </div>
      ) : (
        <div className="py-20 px-6 flex flex-col items-center justify-center text-center bg-background rounded-3xl border border-dashed border-border/60">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <Wifi className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">{t("noHubsYet")}</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            {t("noHubsDesc")}
          </p>
          <Link 
            href="/dashboard/hubs/new" 
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 shadow transition-all"
          >
            <PlusCircle className="h-5 w-5" />
            {t("createFirstHub")}
          </Link>
        </div>
      )}
    </div>
  );
}
