import { HubCard } from "@/src/app/[locale]/components/general/HubCard";

export default function FeaturedHubSection({filter, hubs = []}: {filter: {governorate: string, service: string}, hubs?: any[]}){
    const mappedHubs = hubs.map(apiHub => ({
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

    const displayHubs = mappedHubs;

    const filteredHubs = (filter.governorate === "" && filter.service === "")
      ? displayHubs
      : displayHubs.filter((hub) => {
          const govMatch =
            filter.governorate === "" ||
            (hub.governorate || "").toLowerCase().includes(filter.governorate.toLowerCase()) ||
            filter.governorate.toLowerCase().includes((hub.governorate || "").toLowerCase());

          const srvMatch =
            filter.service === "" ||
            (hub.services || []).some((s: string) =>
              s.toLowerCase().includes(filter.service.toLowerCase())
            );

          return govMatch && srvMatch;
        });
  return(
         <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Featured Hubs</h2>
                <p className="mt-2 text-muted-foreground">Top-rated and verified locations across Gaza.</p>
              </div>
              <a href="/hubs" className="hidden sm:flex text-primary font-medium hover:underline items-center gap-1">
                View all hubs <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHubs.map((hub: any) => (
                <HubCard key={hub.id} hub={hub} />
              ))}
            </div>
            
            <div className="mt-10 sm:hidden">
              <a href="/hubs" className="block w-full bg-muted text-center py-3 rounded-lg text-foreground font-medium hover:bg-muted/80 transition-colors">
                View all hubs
              </a>
            </div>
          </div>
        </section>
    );
}