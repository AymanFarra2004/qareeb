"use client";

import { useState } from "react";
import { updateHubStatus } from "@/src/actions/admin";
import { Loader2, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HubsTable({ initialHubs }: { initialHubs: any[] }) {
  const [hubs, setHubs] = useState(initialHubs);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handleStatusChange = async (hubId: string, slug: string, newStatus: string) => {
    // Some routes might expect ID, some might expect slug. We'll use ID first based on recent discoveries.
    const identifier = hubId || slug;
    if (!identifier) return;

    setLoadingId(hubId);
    const res = await updateHubStatus(identifier, newStatus);
    
    if (res.success) {
      setHubs(prev => prev.map(h => h.id === hubId || h.slug === slug ? { ...h, status: newStatus } : h));
      router.refresh();
    } else {
      alert(res.error || "Failed to update status");
    }
    setLoadingId(null);
  };

  if (hubs.length === 0) {
    return (
      <div className="py-20 text-center border border-border bg-background rounded-2xl">
        <p className="text-muted-foreground">No hubs found on the platform.</p>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Hub Name</th>
              <th className="px-6 py-4">Owner</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {hubs.map((hub) => {
              const name = hub.name?.en || hub.name || "Unnamed";
              const isPending = hub.status === 'pending';
              const isApproved = hub.status === 'approved' || hub.status === 'active';
              
              return (
                <tr key={hub.id || hub.slug} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {name}
                    <div className="text-xs text-muted-foreground font-mono mt-1">{hub.slug}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {hub.owner?.name || hub.user?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      isPending ? 'bg-yellow-100 text-yellow-700' :
                      isApproved ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {hub.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {hub.address_details?.en || hub.address || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {loadingId === hub.id ? (
                      <div className="flex justify-end pr-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                    ) : (
                      <div className="flex justify-end gap-2">
                         {!isApproved && (
                           <button 
                             onClick={() => handleStatusChange(hub.id, hub.slug, 'approved')}
                             className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                           >
                             <Check className="h-4 w-4" /> Approve
                           </button>
                         )}
                         {hub.status !== 'rejected' && (
                           <button 
                             onClick={() => handleStatusChange(hub.id, hub.slug, 'rejected')}
                             className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                           >
                             <X className="h-4 w-4" /> Reject
                           </button>
                         )}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
