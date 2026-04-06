import { getAllServices } from "@/src/actions/hubs";
import ServicesList from "./ServicesList";

export default async function AdminServicesPage() {
  const res = await getAllServices();
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Global Services</h2>
        <p className="text-muted-foreground mt-1">Manage the master list of services available for hubs.</p>
      </div>

      {res.error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          Failed to load services: {res.error}
        </div>
      ) : (
        <ServicesList initialServices={res.data || []} />
      )}
    </div>
  );
}
