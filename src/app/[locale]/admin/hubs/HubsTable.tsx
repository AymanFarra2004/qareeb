"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { updateHubStatus } from "@/src/actions/admin";
import { Loader2, Check, X, Clock, ShieldCheck, ShieldAlert, Box, ExternalLink, Eye, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useTranslations, useLocale } from "next-intl";

type TabType = "all" | "pending" | "active" | "rejected";

export default function HubsTable({ initialHubs }: { initialHubs: any[] }) {
  const [hubs, setHubs] = useState(initialHubs);
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 9;
  const router = useRouter();
  const t = useTranslations("AdminHubsTable");
  const locale = useLocale();

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [hubToReject, setHubToReject] = useState<{ id: string, slug: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Helper to normalize status checks
  const getStatus = (hub: any) => {
    const s = String(hub.status || "").toLowerCase();
    if (s === "pending" || s === "new") return "pending";
    if (s === "approved" || s === "active" || s === "verified") return "active";
    if (s === "rejected" || s === "refused") return "rejected";
    return "unknown";
  };

  // Data groupings
  const groups = {
    all: hubs,
    pending: hubs.filter(h => getStatus(h) === 'pending'),
    active: hubs.filter(h => getStatus(h) === 'active'),
    rejected: hubs.filter(h => getStatus(h) === 'rejected')
  };

  const currentHubs = groups[activeTab];

  // Search filtering logic
  const filteredHubs = currentHubs.filter((hub) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = (hub.name?.[locale] || hub.name?.en || hub.name?.ar || hub.name || "").toLowerCase();
    const slug = (hub.slug || "").toLowerCase();
    const ownerName = (hub.owner?.name || hub.user?.name || "").toLowerCase();
    const contact = (hub.contact || "").toLowerCase();
    
    return name.includes(q) || slug.includes(q) || ownerName.includes(q) || contact.includes(q);
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredHubs.length / itemsPerPage);
  const paginatedHubs = filteredHubs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusChange = async (hubId: string, slug: string, newStatus: string) => {
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
      setHubs(prev => prev.map(h => h.id === hubToReject.id || h.slug === hubToReject.slug ? { ...h, status: "rejected", rejection_reason: rejectionReason } : h));
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

  const TabButton = ({ type, label, icon: Icon, color }: { type: TabType, label: string, icon: any, color: string }) => {
    const isActive = activeTab === type;
    const count = groups[type].length;
    
    return (
      <button
        onClick={() => setActiveTab(type)}
        className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all font-semibold text-sm ${
          isActive 
            ? `border-${color}-500 text-${color}-600 bg-${color}-50/50` 
            : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
        }`}
      >
        <Icon className={`h-4 w-4 ${isActive ? `text-${color}-500` : "opacity-50"}`} />
        {label}
        <span className={`ms-1 px-2 py-0.5 rounded-full text-[10px] ${
          isActive ? `bg-${color}-500 text-white` : "bg-muted text-muted-foreground"
        }`}>
          {count}
        </span>
      </button>
    );
  };

  return (
    <>
      <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-border bg-background">
          <div className="relative max-w-md">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 ps-10 pe-4 rounded-xl border border-input bg-muted/20 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>
        </div>

        {/* Tabs Header */}
        <div className="flex border-b border-border bg-muted/20 overflow-x-auto scrollbar-hide">
          <TabButton type="pending" label={t("pendingApprovals")} icon={Clock} color="yellow" />
          <TabButton type="active" label={t("activeHubs")} icon={ShieldCheck} color="green" />
          <TabButton type="rejected" label={t("rejectedApplications")} icon={ShieldAlert} color="red" />
          <TabButton type="all" label={t("allRecords")} icon={Box} color="blue" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4 text-start">{t("hubDetails")}</th>
                <th className="px-6 py-4 text-start">{t("ownerContact")}</th>
                <th className="px-6 py-4 text-start">{t("status")}</th>
                <th className="px-6 py-4 text-end">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedHubs.map((hub) => {
                const name = hub.name?.[locale] || hub.name?.en || hub.name?.ar || hub.name || "Unnamed";
                const status = getStatus(hub);
                const isPending = status === 'pending';
                const isApproved = status === 'active';
                const isRejected = status === 'rejected';
                
                return (
                  <tr key={hub.id || hub.slug} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-6">
                      <div className="font-bold text-foreground text-base">{name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-1 opacity-70">{hub.slug}</div>
                      {isRejected && hub.rejection_reason && (
                        <div className="mt-2 p-2 bg-red-50 rounded-lg text-red-700 text-[11px] max-w-xs border border-red-100 italic">
                          {t("reason")}: {hub.rejection_reason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-6 font-medium text-foreground">
                      <div>{hub.owner?.name || hub.user?.name || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{hub.contact || t("noContactInfo")}</div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isPending ? 'bg-yellow-100 text-yellow-700 shadow-[0_0_10px_rgba(234,179,8,0.1)]' :
                        isApproved ? 'bg-green-100 text-green-700 shadow-[0_0_10px_rgba(34,197,94,0.1)]' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {hub.status || t("unknown")}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-end">
                      {loadingId === hub.id ? (
                        <div className="flex justify-end pr-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                      ) : (
                        <div className="flex justify-end gap-2">
                           {/* View Hub — conditional link */}
                           {hub.slug && (
                             isApproved ? (
                               <Link
                                 href={`/${locale}/hubs/${hub.slug}`}
                                 title={t("view_live")}
                                 className="flex items-center gap-1.5 px-3 py-2 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-xl transition-all font-semibold text-xs"
                               >
                                 <ExternalLink className="h-3.5 w-3.5" />
                                 {t("view_live")}
                               </Link>
                             ) : (
                               <Link
                                 href={`/${locale}/admin/hubs/${hub.slug}/preview`}
                                 title={t("view_preview")}
                                 className="flex items-center gap-1.5 px-3 py-2 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-xl transition-all font-semibold text-xs"
                               >
                                 <Eye className="h-3.5 w-3.5" />
                                 {t("view_preview")}
                               </Link>
                             )
                           )}

                           {(isPending || isRejected) && (
                             <button 
                                onClick={() => handleStatusChange(hub.id, hub.slug, 'approved')}
                                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-xl transition-all shadow-sm font-semibold text-xs"
                             >
                               <Check className="h-3.5 w-3.5" /> {t("approve")}
                             </button>
                           )}
                           {(isPending || isApproved) && (
                             <button 
                                onClick={() => openRejectModal(hub.id, hub.slug)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all border border-red-100 font-semibold text-xs"
                             >
                               <X className="h-3.5 w-3.5" /> {t("reject")}
                             </button>
                           )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {currentHubs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <ShieldCheck className="h-10 w-10 text-muted-foreground" />
                      <p className="text-base font-medium">{t("noHubsInSection")}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {currentHubs.length > 0 && (
          <div className="px-6 py-4 bg-muted/20 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground font-medium">
              {t("showing", {
                count: paginatedHubs.length,
                total: filteredHubs.length,
              })}
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-border bg-background rounded-lg text-xs font-semibold hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("previous")}
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                          currentPage === pageNum
                            ? "bg-primary text-white shadow-sm"
                            : "hover:bg-muted text-muted-foreground border border-transparent"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-border bg-background rounded-lg text-xs font-semibold hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("next")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reject Reason Modal Overlay */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 tracking-tight">
          <div className="bg-background rounded-3xl shadow-xl w-full max-w-md border border-border animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-2">{t("rejectHub")}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t("rejectModalDesc")}
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    {t("rejectionReason")}
                  </label>
                  <textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-3 border border-input rounded-xl bg-background text-sm resize-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                    rows={4}
                    placeholder={t("rejectionPlaceholder")}
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
                  setRejectionReason("");
                }}
                disabled={isRejecting}
                className="px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isRejecting || !rejectionReason.trim()}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                {t("confirmRejection")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
