import { Header } from "@/components/header/Header"
import { Footer } from "@/components/footer/Footer"
import { Metadata } from "next"
import HubsHeader from "@/components/hubs/HubsHeader"
import HubsClient from "@/components/hubs/HubsClient"
import { getAllHubs } from "@/src/actions/hubs"
import { getLocale, getTranslations } from "next-intl/server"
import { format24to12 } from "@/src/lib/utils"
export const metadata: Metadata = {
  title: "Browse Hubs | Habbat",
  description: "Explore available internet and electricity hubs across Gaza.",
}

export default async function HubsDirectory() {
  const locale = await getLocale();
  const t = await getTranslations("HubsPage");
  const res = await getAllHubs(locale);
  let rawHubs = res.data || [];
  if (!Array.isArray(rawHubs)) rawHubs = [];

  const mappedHubs = rawHubs.map((apiHub: any) => ({
    id: String(apiHub.id),
    slug: apiHub.slug,
    name: typeof apiHub.name === 'string' ? apiHub.name : (apiHub.name?.[locale] || apiHub.name?.en || apiHub.name?.ar || "Unknown Hub"),
    description: typeof apiHub.description === 'string' ? apiHub.description : (apiHub.description?.[locale] || apiHub.description?.en || apiHub.description?.ar || "No description"),
    location: typeof apiHub.address_details === 'string' ? apiHub.address_details : (apiHub.address_details?.[locale] || apiHub.address_details?.en || apiHub.address_details?.ar || "Unknown"),
    locationId: apiHub.location_id || apiHub.location?.id || null,
    governorate: apiHub.location?.name || "Gaza",
    pricing: apiHub.hourly_price || "Free",
    operatingHours: apiHub.working_hours 
      ? `${format24to12(apiHub.working_hours.start, t("am"), t("pm"))} - ${format24to12(apiHub.working_hours.end, t("am"), t("pm"))}`
      : apiHub.operating_hours || "Contact for hours",
    services: Array.isArray(apiHub.all_services || apiHub.services) ? (apiHub.all_services || apiHub.services).map((s:any) => typeof s.name === 'string' ? s.name : (s.name?.[locale] || s.name?.en || s.name)) : [],
    imageUrl: apiHub.images?.main ? 
      (apiHub.images.main.startsWith('http') ? apiHub.images.main : `https://karam.idreis.net${apiHub.images.main.startsWith('/') ? '' : '/'}${apiHub.images.main}`) 
      : "https://placehold.co/600x400?text=No+Image",
    verificationStatus: apiHub.status === "approved" ? "Verified" : "Pending",
    contact: { contactNumber: apiHub.contact || "" },
    activeOffer: (apiHub.hasOffer || apiHub.offers) && (apiHub.hasOffer || apiHub.offers).length > 0 ? (apiHub.hasOffer || apiHub.offers)[0] : null,
  }));

  // Only show approved hubs to the public directory
  const displayHubs = mappedHubs.filter((h: any) => h.verificationStatus === "Verified");

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-24 pb-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <HubsHeader />

          <HubsClient hubs={displayHubs} />
        </div>
      </main>

      <Footer />
    </div>
  )
}