import { Header } from "@/components/header/Header"
import { Footer } from "@/components/footer/Footer"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Browse Hubs | Habbat",
  description: "Explore available internet and electricity hubs across Gaza.",
}
import { staticHubs } from "@/data/hubs"
import HubsHeader from "@/components/hubs/HubsHeader"
import HubsClient from "@/components/hubs/HubsClient"

export default function HubsDirectory() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-24 pb-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <HubsHeader />

          <HubsClient hubs={staticHubs} />
        </div>
      </main>

      <Footer />
    </div>
  )
}