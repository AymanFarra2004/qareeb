import { Header } from "@/components/header/Header"
import { Footer } from "@/components/footer/Footer"
import { Metadata } from "next"
import HubsHeader from "@/components/hubs/HubsHeader"
import HubsClient from "@/components/hubs/HubsClient"
import { getAllHubs } from "@/src/actions/hubs"
export const metadata: Metadata = {
  title: "Browse Hubs | Habbat",
  description: "Explore available internet and electricity hubs across Gaza.",
}

export default async function HubsDirectory() {
  const res = await getAllHubs();
  let rawHubs = res.data || [];
  if (!Array.isArray(rawHubs)) rawHubs = [];

  const mappedHubs = rawHubs.map((apiHub: any) => ({
    id: String(apiHub.id),
    slug: apiHub.slug,
    name: apiHub.name?.en || apiHub.name?.ar || apiHub.name || "Unknown Hub",
    description: apiHub.description?.en || apiHub.description?.ar || apiHub.description || "No description",
    location: apiHub.address_details?.en || apiHub.address_details?.ar || apiHub.address_details || "Unknown",
    governorate: apiHub.location?.name || "Gaza",
    pricing: apiHub.pricing || "Free",
    operatingHours: "24/7",
    services: Array.isArray(apiHub.services) ? apiHub.services.map((s:any) => s.name?.en || s.name) : [],
    imageUrl: apiHub.images?.main ? 
      (apiHub.images.main.startsWith('http') ? apiHub.images.main : `https://karam.idreis.net${apiHub.images.main.startsWith('/') ? '' : '/'}${apiHub.images.main}`) 
      : "https://placehold.co/600x400?text=No+Image",
    verificationStatus: apiHub.status === "approved" ? "Verified" : "Pending",
    contact: { contactNumber: apiHub.contact || "" }
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