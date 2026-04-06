import { getAdminHubs } from "@/src/actions/admin";
import { Link } from "@/src/i18n/routing";
import { CheckSquare, Activity, ShieldAlert, ArrowRight } from "lucide-react";

export default async function AdminDashboardOverview() {
  const hubsRes = await getAdminHubs();
  
  // Handle pagination wrap (result.data.data) or simple array
  let hubs = hubsRes.data || [];
  if (!Array.isArray(hubs)) {
    hubs = hubs.data || [];
  }
  if (!Array.isArray(hubs)) hubs = [];

  const pendingHubs = hubs.filter((h: any) => h.status === 'pending').length;
  const activeHubs = hubs.filter((h: any) => h.status === 'approved' || h.status === 'active').length;
  const rejectedHubs = hubs.filter((h: any) => h.status === 'rejected').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Platform Overview</h2>
        <p className="text-muted-foreground mt-1">Monitor all hubs and pending approvals across the platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background rounded-2xl border border-border p-6 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldAlert className="h-16 w-16 text-yellow-500" /></div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Pending Approvals</p>
          <p className="text-4xl font-extrabold text-foreground">{pendingHubs}</p>
          <div className="mt-auto pt-6">
            <Link href="/admin/hubs" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              Review Hubs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="bg-background rounded-2xl border border-border p-6 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="h-16 w-16 text-green-500" /></div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Active Hubs</p>
          <p className="text-4xl font-extrabold text-foreground">{activeHubs}</p>
        </div>

        <div className="bg-background rounded-2xl border border-border p-6 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><CheckSquare className="h-16 w-16 text-red-500" /></div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Rejected Hubs</p>
          <p className="text-4xl font-extrabold text-foreground">{rejectedHubs}</p>
        </div>
      </div>
    </div>
  );
}
