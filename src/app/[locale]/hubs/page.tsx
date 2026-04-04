import { Header } from "@/components/header/Header"
import { Footer } from "@/components/footer/Footer"
import { staticHubs } from "@/data/hubs"
import HubsHeader from "@/components/hubs/HubsHeader"
import HubsFilters from "@/components/hubs/HubsFilters"
import HubsList from "@/components/hubs/HubsList"
import { getMyHubs } from "@/src/actions/hubs"

function mapApiHubs(apiHubs: any[]) {
  return apiHubs.map((apiHub) => ({
    id: String(apiHub.id),
    slug: apiHub.slug,
    name: apiHub.name?.en || apiHub.name?.ar || apiHub.name || "Unknown Hub",
    description: apiHub.description?.en || apiHub.description?.ar || apiHub.description || "No description",
    location: apiHub.address_details?.en || apiHub.address_details?.ar || apiHub.address_details || "Unknown",
    governorate: apiHub.location?.name || "Gaza",
    pricing: apiHub.pricing || "Free",
    operatingHours: "24/7",
    services: Array.isArray(apiHub.services) ? apiHub.services.map((s: any) => s.name?.en || s.name) : [],
    imageUrl: apiHub.images?.main || staticHubs[Math.floor(Math.random() * staticHubs.length)].imageUrl,
    verificationStatus: apiHub.status === "approved" ? "Verified" : "Pending",
    contact: { contactNumber: apiHub.contact || "" },
  }));
}

export default async function HubsDirectory() {
  const { data: apiHubs } = await getMyHubs();
  const hubs = apiHubs && apiHubs.length > 0 ? mapApiHubs(apiHubs) : staticHubs;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-24 pb-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <HubsHeader />

          <div className="flex flex-col lg:flex-row gap-8">
            <HubsFilters />

            <HubsList hubsData={hubs} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}