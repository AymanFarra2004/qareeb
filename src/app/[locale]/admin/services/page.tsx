import { getAllServices } from "@/src/actions/hubs";
import ServicesList from "./ServicesList";
import { getTranslations, getLocale } from "next-intl/server";

export default async function AdminServicesPage() {
  const locale = await getLocale();
  const res = await getAllServices(locale);
  const t = await getTranslations("AdminServices");
  
  const services = res.data || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight underline decoration-primary/30 underline-offset-8">{t("globalServicesTitle")}</h2>
        <p className="text-muted-foreground mt-2">{t("globalServicesDesc")}</p>
      </div>

      <ServicesList initialServices={services} />
    </div>
  );
}
