"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Check, X, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { updateHubStatus } from "@/src/actions/admin";

interface Props {
  hubId: string;
  slug: string;
  isApproved: boolean;
  isPending: boolean;
  locale: string;
}

export default function HubPreviewActions({ hubId, slug, isApproved, isPending, locale }: Props) {
  const t = useTranslations("AdminHubPreview");
  const tTable = useTranslations("AdminHubsTable");
  const router = useRouter();

  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const handleApprove = async () => {
    setLoading("approve");
    const identifier = slug || hubId;
    const res = await updateHubStatus(identifier, "approved");
    if (res.success) {
      toast.success(t("approvedSuccess"));
      router.refresh();
    } else {
      toast.error(res.error || t("actionFailed"));
    }
    setLoading(null);
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error(tTable("rejectionPlaceholder"));
      return;
    }
    setLoading("reject");
    const identifier = slug || hubId;
    const res = await updateHubStatus(identifier, "rejected", reason);
    if (res.success) {
      toast.success(t("rejectedSuccess"));
      setRejectOpen(false);
      setReason("");
      router.refresh();
    } else {
      toast.error(res.error || t("actionFailed"));
    }
    setLoading(null);
  };

  return (
    <>
      <div className="flex flex-wrap gap-3 p-4 bg-muted/30 border border-border rounded-2xl">
        <p className="w-full text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          {t("quickActions")}
        </p>

        {!isApproved && (
          <button
            onClick={handleApprove}
            disabled={loading !== null}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white hover:bg-green-700 rounded-xl font-semibold text-sm transition-all shadow-sm disabled:opacity-50"
          >
            {loading === "approve" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {tTable("approve")}
          </button>
        )}

        {!isPending || isApproved ? (
          <button
            onClick={() => setRejectOpen(true)}
            disabled={loading !== null}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            {tTable("reject")}
          </button>
        ) : (
          <button
            onClick={() => setRejectOpen(true)}
            disabled={loading !== null}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            {tTable("reject")}
          </button>
        )}
      </div>

      {/* Reject Modal */}
      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background rounded-3xl shadow-xl w-full max-w-md border border-border animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-2">{tTable("rejectHub")}</h3>
              <p className="text-sm text-muted-foreground mb-6">{tTable("rejectModalDesc")}</p>
              <label className="block text-sm font-semibold mb-1.5">{tTable("rejectionReason")}</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder={tTable("rejectionPlaceholder")}
                className="w-full px-4 py-3 border border-input rounded-xl bg-background text-sm resize-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                autoFocus
              />
            </div>
            <div className="px-6 py-4 bg-muted/30 flex justify-end gap-3 border-t border-border">
              <button
                onClick={() => { setRejectOpen(false); setReason(""); }}
                disabled={loading !== null}
                className="px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors disabled:opacity-50"
              >
                {tTable("cancel")}
              </button>
              <button
                onClick={handleReject}
                disabled={loading !== null || !reason.trim()}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                {tTable("confirmRejection")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
