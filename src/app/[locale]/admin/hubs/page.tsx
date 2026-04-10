import { getAdminHubs } from "@/src/actions/admin";
import HubsTable from "./HubsTable";

export default async function AdminHubsPage() {
  const res = await getAdminHubs();
  
  // Guard for error state to ensure res.data exists in the success path
  if (res.error) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight underline decoration-primary/30 underline-offset-8">Hub Management</h2>
          <p className="text-muted-foreground mt-2">Manage the lifecycle of all hubs, including new applications and active listings.</p>
        </div>
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {res.error}
        </div>
      </div>
    );
  }

  const hubs = res.data || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight underline decoration-primary/30 underline-offset-8">Hub Management</h2>
        <p className="text-muted-foreground mt-2">Manage the lifecycle of all hubs, including new applications and active listings.</p>
      </div>

      <HubsTable initialHubs={hubs} />
    </div>
  );
}
