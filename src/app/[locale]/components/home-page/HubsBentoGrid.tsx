"use client";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { MapPin, Zap, Clock, Coins, Wifi, Power, Users, Star } from "lucide-react";
import { format24to12 } from "@/src/lib/utils";
import { getServiceIcon } from "@/src/data/hubs";

export default function HubsBentoGrid({ hubs = [] }: { hubs?: any[] }) {
  const t = useTranslations("HubsGrid");
  const locale = useLocale();

  const mappedHubs = hubs.map(apiHub => ({
    id: String(apiHub.id),
    slug: apiHub.slug,
    name: typeof apiHub.name === 'string' ? apiHub.name : (apiHub.name?.[locale] || apiHub.name?.en || apiHub.name?.ar || "Unknown Hub"),
    description: typeof apiHub.description === 'string' ? apiHub.description : (apiHub.description?.[locale] || apiHub.description?.en || apiHub.description?.ar || "No description"),
    location: typeof apiHub.address_details === 'string' ? apiHub.address_details : (apiHub.address_details?.[locale] || apiHub.address_details?.en || apiHub.address_details?.ar || "Unknown"),
    locationId: apiHub.location?.id || apiHub.location_id,
    city: (() => {
      const breadcrumb = apiHub.location?.breadcrumb || [];
      const city = breadcrumb[1]?.name || "";
      return city.trim();
    })(),
    area: (() => {
      const breadcrumb = apiHub.location?.breadcrumb || [];
      const area = breadcrumb[2]?.name || "";
      return area;
    })(),
    pricing: apiHub.pricing || "Free",
    hourlyPrice: apiHub.hourly_price,
    operatingHours: apiHub.working_hours
      ? `${format24to12(apiHub.working_hours.start, t("am"), t("pm"))} - ${format24to12(apiHub.working_hours.end, t("am"), t("pm"))}`
      : apiHub.operating_hours || "Contact for hours",
    services: [
      ...Array.isArray(apiHub.all_services || apiHub.services) ? (apiHub.all_services || apiHub.services).map((s: any) => typeof s.name === 'string' ? s.name : (s.name?.[locale] || s.name?.en || s.name)) : [],
      ...Array.isArray(apiHub.custom_services) ? apiHub.custom_services.map((s: any) => typeof s.name === 'string' ? s.name : (s.name?.[locale] || s.name?.en || s.name)) : [],
    ],
    imageUrl: apiHub.images?.main ?
      (apiHub.images.main.startsWith('http') ? apiHub.images.main : `https://karam.idreis.net${apiHub.images.main.startsWith('/') ? '' : '/'}${apiHub.images.main}`)
      : "https://placehold.co/600x400?text=No+Image",
    verificationStatus: apiHub.status === "approved" ? "Verified" : "Pending",
    review: apiHub.reviews?.average_rating || 0,
  }));

  // Only show approved hubs
  const displayHubs = mappedHubs.filter((apiHub: any) => apiHub.verificationStatus === "Verified");
  const bentoHubs = displayHubs.slice(0, 6);

  // Helper to map a service string to an icon (simple matching)
  // const renderServiceIcon = (service: string, key: number) => {
  //   const s = service.toLowerCase();
  //   let Icon = MapPin;
  //   if (s.includes("internet") || s.includes("wifi") || s.includes("fiber")) Icon = Wifi;
  //   else if (s.includes("power") || s.includes("electricity") || s.includes("solar")) Icon = Power;
  //   else if (s.includes("space") || s.includes("room") || s.includes("desk")) Icon = Users;
    
  //   return (
  //     <div key={key} className="flex items-center gap-2 text-sm text-muted-foreground">
  //       <Icon className="text-purple-600 dark:text-purple-400 w-5 h-5" />
  //       <span className="truncate max-w-[80px]">{service}</span>
  //     </div>
  //   );
  // };

  return (
    <section className="py-24 bg-background relative z-10 transition-colors duration-300" id="hubs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">
              {t("titleQareeb")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-400">
                {t("titleHighlightQareeb")}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <a href="/hubs" className="hidden md:flex items-center gap-2 text-[#9333EA] font-medium hover:text-[#7e22ce] transition-colors">
            {t("viewAll")} <span className="transform rtl:rotate-180">&rarr;</span>
          </a>
        </div>

        {/* 3-Column Grid Layout matching HTML exactly */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bentoHubs.map((hub: any, i: number) => (
            <motion.div
              key={hub.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`bg-card dark:bg-card/50 rounded-2xl overflow-hidden group hover:shadow-[0_20px_40px_rgba(25,28,30,0.06)] dark:hover:shadow-[0_20px_40px_rgba(255,255,255,0.02)] transition-shadow duration-300 border border-border/50 flex-col ${i >= 3 ? 'hidden md:flex' : 'flex'}`}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={hub.imageUrl}
                  alt={hub.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-background/70 backdrop-blur-md text-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-border/50">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> {t("verified")}
                  </span>
                  {hub.hourlyPrice && (
                    <span className="bg-background/70 backdrop-blur-md text-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-border/50">
                      <Coins className="w-3 h-3 text-amber-500" /> ₪{hub.hourlyPrice}/{t("hour")}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-4 mb-6">
                  <div className="w-full">
                    <h3 className="text-xl font-bold text-foreground mb-1 line-clamp-1">{hub.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {(hub.city || "") + (hub.city && hub.area ? " - " : "") + (hub.area || "")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 bg-secondary/50 px-2 py-1 rounded-md text-sm font-medium">
                    {hub.review && hub.review > 0 ? (
                      <>
                        <span>{Number(Number(hub.review).toFixed(1))}/5</span>
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {locale === "ar" ? "لا يوجد تقييمات بعد" : "no reviews yet"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Utility Icons */}
                <div className="flex flex-wrap gap-4 mb-6 mt-auto">
                  {hub.services.slice(0, 3).map((service: string, idx: number) => <div key={idx} className="text-foreground flex items-center gap-1 text-xs">{service} {getServiceIcon(service, "h-4 w-4")}</div>)}
                </div>

                <a 
                  href={`/hubs/${hub.slug}`} 
                  className="w-full text-center py-3 rounded-xl bg-[#9333EA] hover:bg-[#7e22ce] text-white font-medium transition-colors block"
                >
                  {t("viewDetails")}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
