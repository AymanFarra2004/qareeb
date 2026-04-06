import { getAdminHubs } from "@/src/actions/admin";
import HubsTable from "./HubsTable";

export default async function AdminHubsPage() {
  const res = await getAdminHubs();
  
  let hubs = res.data || [];
  if (!Array.isArray(hubs)) {
    hubs = hubs.data || [];
  }
  if (!Array.isArray(hubs)) hubs = [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Hub Approvals</h2>
        <p className="text-muted-foreground mt-1">Review and manage hub applications from providers.</p>
      </div>

      {res.error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {res.error}
        </div>
      ) : (
        <HubsTable initialHubs={hubs} />
      )}
    </div>
  );
}
