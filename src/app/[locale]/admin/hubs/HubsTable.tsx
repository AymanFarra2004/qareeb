"use client";

import { useState } from "react";
import { updateHubStatus } from "@/src/actions/admin";
import { Loader2, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function HubsTable({ initialHubs }: { initialHubs: any[] }) {
  const [hubs, setHubs] = useState(initialHubs);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [hubToReject, setHubToReject] = useState<{ id: string, slug: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const handleStatusChange = async (hubId: string, slug: string, newStatus: string) => {
    // API route uses slug for model binding
    const identifier = slug || hubId;
    if (!identifier) return;

    setLoadingId(hubId);
    const res = await updateHubStatus(identifier, newStatus);
    
    if (res.success) {
      setHubs(prev => prev.map(h => h.id === hubId || h.slug === slug ? { ...h, status: newStatus } : h));
      router.refresh();
      toast.success(`Hub status updated to ${newStatus}`);
    } else {
      toast.error(res.error || "Failed to update status");
    }
    setLoadingId(null);
  };

  const handleConfirmReject = async () => {
    if (!hubToReject) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }

    setIsRejecting(true);
    const identifier = hubToReject.slug || hubToReject.id;
    
    const res = await updateHubStatus(identifier, "rejected", rejectionReason);
    
    if (res.success) {
      setHubs(prev => prev.map(h => h.id === hubToReject.id || h.slug === hubToReject.slug ? { ...h, status: "rejected" } : h));
      router.refresh();
      toast.success("Hub rejected successfully");
      setRejectModalOpen(false);
      setHubToReject(null);
      setRejectionReason("");
    } else {
      toast.error(res.error || "Failed to reject hub");
    }
    setIsRejecting(false);
  };

  const openRejectModal = (hubId: string, slug: string) => {
    setHubToReject({ id: hubId, slug });
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  if (hubs.length === 0) {
    return (
      <div className="py-20 text-center border border-border bg-background rounded-2xl">
        <p className="text-muted-foreground">No hubs found on the platform.</p>
      </div>
    );
  }

  return (
    <>
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
                               onClick={() => openRejectModal(hub.id, hub.slug)}
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

      {/* Reject Reason Modal Overlay */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 tracking-tight">
          <div className="bg-background rounded-3xl shadow-xl w-full max-w-md border border-border animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-2">Reject Hub</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Please provide a reason to help the hub owner understand why this request is being rejected. They will be able to read this message.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Rejection Reason
                  </label>
                  <textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-3 border border-input rounded-xl bg-background text-sm resize-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                    rows={4}
                    placeholder="e.g. Identity verification failed..."
                    autoFocus
                  />
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-muted/30 flex justify-end gap-3 border-t border-border mt-2">
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setHubToReject(null);
                }}
                disabled={isRejecting}
                className="px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isRejecting || !rejectionReason.trim()}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
