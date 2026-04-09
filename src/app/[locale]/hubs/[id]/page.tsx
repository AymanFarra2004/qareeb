import Link from "next/link"
import { notFound } from "next/navigation"
import { Wifi, Zap, Monitor, Coffee, ChevronLeft } from "lucide-react"

import { Header } from "@/components/header/Header"
import { Footer } from "@/components/footer/Footer"
import { staticHubs } from "@/data/hubs"
import { getAllHubs } from "@/src/actions/hubs"
import HubHeroImage from "@/components/hubs/hub/HubHeroImage"
import HubMainContent from "@/components/hubs/hub/HubMainContent"
import HhubSideBar from "@/components/hubs/hub/HhubSideBar"

const serviceIcons: Record<string, React.ReactNode> = {
  Internet: <Wifi className="h-5 w-5" />,
  Electricity: <Zap className="h-5 w-5" />,
  Workspace: <Monitor className="h-5 w-5" />,
  "Coffee/Tea": <Coffee className="h-5 w-5" />,
}

function mapApiHub(apiHub: any) {
  return {
    id: String(apiHub.id),
    slug: apiHub.slug,
    name: apiHub.name?.en || apiHub.name?.ar || apiHub.name || "Unknown Hub",
    description:
      apiHub.description?.en ||
      apiHub.description?.ar ||
      apiHub.description ||
      "No description",
    location:
      apiHub.address_details?.en ||
      apiHub.address_details?.ar ||
      apiHub.address_details ||
      "Unknown",
    governorate: apiHub.location?.name || "Gaza",
    pricing: apiHub.hourly_price
      ? `${apiHub.hourly_price} / hour`
      : apiHub.pricing || "Contact for pricing",
    operatingHours: apiHub.operating_hours || "Contact for hours",
    services: Array.isArray(apiHub.services)
      ? apiHub.services.map((s: any) => s.name?.en || s.name || s)
      : [],
    imageUrl: apiHub.images?.main
      ? apiHub.images.main.startsWith("http")
        ? apiHub.images.main
        : `https://karam.idreis.net${
            apiHub.images.main.startsWith("/") ? "" : "/"
          }${apiHub.images.main}`
      : staticHubs[0].imageUrl,
    verificationStatus: (apiHub.status === "approved" ? "Verified" : "Pending") as "Verified" | "Pending",
    contact: {
      contactNumber: apiHub.contact || "",
      email: apiHub.email || "",
    },
  }
}

export default async function HubDetails({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Fetch all hubs from the API and find the one matching id or slug
  const res = await getAllHubs()
  let rawHubs = res.data || []
  if (!Array.isArray(rawHubs)) rawHubs = []

  const rawHub = rawHubs.find(
    (h: any) => String(h.id) === id || String(h.slug) === id
  )

  // Fall back to static hubs only if API returned nothing
  let hub
  if (rawHub) {
    hub = mapApiHub(rawHub)
  } else {
    const staticHub = staticHubs.find((h) => h.id === id)
    if (!staticHub) {
      notFound()
    }
    hub = staticHub!
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <Link
            href="/hubs"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Hubs
          </Link>

          <HubHeroImage hub={hub} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <HubMainContent hub={hub} serviceIcons={serviceIcons} />
            <HhubSideBar hub={hub} />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}