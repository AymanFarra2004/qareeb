"use client";

import { useMemo, useState } from "react";
import { deleteAdminReview } from "@/src/actions/admin";
import {
  Star, Trash2, Loader2, MessageSquare, AlertTriangle, Search, Filter, X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useTranslations, useLocale } from "next-intl";

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  user?: { id: number; name: string } | null;
  // Hub name may be a string OR a translated object { en: string, ar: string }
  hub?: { id?: number; slug?: string; name?: string | Record<string, string> } | null;
  hub_name?: string;
  hub_slug?: string;
  hub_id?: number;
  user_name?: string;
  created_at?: string;
}

// Resolve hub display name — handles plain string, translated object, or flat field
function resolveHubName(review: Review, locale: string): string {
  const hub = review.hub;
  if (hub) {
    if (typeof hub.name === "string" && hub.name) return hub.name;
    if (hub.name && typeof hub.name === "object") {
      return (hub.name as Record<string, string>)[locale]
        || (hub.name as Record<string, string>).en
        || (hub.name as Record<string, string>).ar
        || "—";
    }
  }
  return review.hub_name || "—";
}

// Resolve a stable hub identifier for filtering
function resolveHubKey(review: Review): string {
  return review.hub?.slug ?? review.hub_slug ?? String(review.hub?.id ?? review.hub_id ?? "");
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

function StarFilterButton({
  stars,
  active,
  onClick,
}: {
  stars: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
        active
          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
          : "bg-background text-muted-foreground border-border hover:border-amber-400 hover:text-amber-600"
      }`}
    >
      <Star className={`h-3 w-3 ${active ? "fill-white text-white" : "fill-amber-400 text-amber-400"}`} />
      {stars}★
    </button>
  );
}

export default function AdminReviewsTable({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [search, setSearch] = useState("");
  const [hubFilter, setHubFilter] = useState<string>("all");
  const [starFilter, setStarFilter] = useState<number>(0); // 0 = all
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmModalId, setConfirmModalId] = useState<number | null>(null);
  const router = useRouter();
  const t = useTranslations("AdminReviews");
  const locale = useLocale();

  // Build unique hub list for the Hub filter dropdown
  const uniqueHubs = useMemo(() => {
    const map = new Map<string, string>();
    reviews.forEach((r) => {
      const key = resolveHubKey(r);
      const name = resolveHubName(r, locale);
      if (key && name !== "—") map.set(key, name);
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [reviews, locale]);

  // Apply all active filters
  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      // Text search
      const q = search.toLowerCase();
      const hubName = resolveHubName(r, locale).toLowerCase();
      const userName = (r.user?.name ?? r.user_name ?? "").toLowerCase();
      const comment = (r.comment ?? "").toLowerCase();
      if (q && !hubName.includes(q) && !userName.includes(q) && !comment.includes(q)) return false;

      // Hub filter
      if (hubFilter !== "all" && resolveHubKey(r) !== hubFilter) return false;

      // Star filter
      if (starFilter > 0 && r.rating !== starFilter) return false;

      return true;
    });
  }, [reviews, search, hubFilter, starFilter, locale]);

  const hasActiveFilters = search !== "" || hubFilter !== "all" || starFilter > 0;

  const clearFilters = () => {
    setSearch("");
    setHubFilter("all");
    setStarFilter(0);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    const res = await deleteAdminReview(id);
    setDeletingId(null);
    if (res.success) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setConfirmModalId(null);
      toast.success(t("deleted"));
      router.refresh();
    } else {
      toast.error(res.error || "Failed to delete review");
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(locale === "ar" ? "ar-PS" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">

        {/* ── Filter Bar ── */}
        <div className="p-4 border-b border-border space-y-3">
          {/* Row 1: search + hub select */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Text search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="admin-reviews-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`${t("hub")}, ${t("user")}...`}
                className="w-full ps-9 pe-4 py-2.5 text-sm border border-input rounded-xl bg-muted/30 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            {/* Hub filter */}
            <div className="relative">
              <Filter className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <select
                id="admin-reviews-hub-filter"
                value={hubFilter}
                onChange={(e) => setHubFilter(e.target.value)}
                className="ps-9 pe-8 py-2.5 text-sm border border-input rounded-xl bg-muted/30 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none cursor-pointer"
              >
                <option value="all">{t("allHubs")}</option>
                {uniqueHubs.map(({ slug, name }) => (
                  <option key={slug} value={slug}>{name}</option>
                ))}
              </select>
            </div>

            {/* Clear button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-muted/30 transition-all"
              >
                <X className="h-3.5 w-3.5" />
                {t("clearFilters")}
              </button>
            )}
          </div>

          {/* Row 2: Star rating filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground me-1">{t("rating")}:</span>
            <button
              onClick={() => setStarFilter(0)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                starFilter === 0
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {t("allStars")}
            </button>
            {[1, 2, 3, 4, 5].map((s) => (
              <StarFilterButton
                key={s}
                stars={s}
                active={starFilter === s}
                onClick={() => setStarFilter(starFilter === s ? 0 : s)}
              />
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4 text-start">{t("hub")}</th>
                <th className="px-6 py-4 text-start">{t("user")}</th>
                <th className="px-6 py-4 text-start">{t("rating")}</th>
                <th className="px-6 py-4 text-start">{t("comment")}</th>
                <th className="px-6 py-4 text-start">{t("date")}</th>
                <th className="px-6 py-4 text-end">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((review) => {
                const hubName = resolveHubName(review, locale);
                const userName = review.user?.name ?? review.user_name ?? "Anonymous";
                return (
                  <tr key={review.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-5">
                      <span className="font-semibold text-foreground text-sm">{hubName}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {(userName[0] ?? "?").toUpperCase()}
                        </div>
                        <span className="text-foreground text-sm">{userName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <StarDisplay rating={review.rating} />
                    </td>
                    <td className="px-6 py-5 max-w-xs">
                      <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                        {review.comment || <span className="italic opacity-50">{t("noComment")}</span>}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(review.created_at)}
                    </td>
                    <td className="px-6 py-5 text-end">
                      {deletingId === review.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ms-auto" />
                      ) : (
                        <button
                          id={`delete-review-${review.id}`}
                          onClick={() => setConfirmModalId(review.id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-all ms-auto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t("deleteReview")}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <MessageSquare className="h-10 w-10 text-muted-foreground" />
                      <p className="text-base font-medium">{t("noReviews")}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer stats */}
        <div className="px-6 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
          <span>
            {t("showing")} <strong>{filtered.length}</strong> / <strong>{reviews.length}</strong>
          </span>
          {hasActiveFilters && (
            <span className="text-primary font-medium">{t("filtersActive")}</span>
          )}
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {confirmModalId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background rounded-3xl shadow-xl w-full max-w-sm border border-border animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{t("deleteReview")}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t("deleteConfirm")}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-muted/30 flex justify-end gap-3 border-t border-border">
              <button
                onClick={() => setConfirmModalId(null)}
                disabled={deletingId !== null}
                className="px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => handleDelete(confirmModalId)}
                disabled={deletingId !== null}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {deletingId !== null ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {t("confirmDelete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
