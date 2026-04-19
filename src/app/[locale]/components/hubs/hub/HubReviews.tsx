"use client";

import { useState, useTransition, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Star, MessageSquare, Loader2, LogIn, Edit2, Check, X, Trash2, AlertTriangle,
} from "lucide-react";
import { submitHubReview, deleteMyHubReview } from "@/src/actions/hubs";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  user: { id: number; name: string } | null;
  has_reviewed: boolean;
  created_at?: string;
}

interface HubReviewsProps {
  hubSlug: string;
  reviews: Review[];
  isAuthenticated: boolean;
  myReview: Review | null;
  averageRating?: number;
}

// ── Interactive star selector ──────────────────────────────────────────────
function StarSelector({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const dim =
    size === "sm" ? "h-5 w-5" : size === "lg" ? "h-9 w-9" : "h-7 w-7";
  const display = hovered || value;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className={`${dim} transition-colors duration-100 ${
              star <= display
                ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                : "fill-muted text-muted-foreground/20"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Read-only star display ─────────────────────────────────────────────────
function StarDisplay({
  value,
  size = "sm",
  onClick,
  clickLabel,
}: {
  value: number;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  clickLabel?: string;
}) {
  const dim =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5";

  const stars = (
    <div className={`flex gap-0.5 ${onClick ? "cursor-pointer" : ""}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${dim} transition-colors duration-100 ${
            star <= value
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/20"
          } ${onClick ? "group-hover:text-amber-500 group-hover:fill-amber-500" : ""}`}
        />
      ))}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group flex items-center gap-2 hover:opacity-80 transition-opacity"
        aria-label={clickLabel ?? "Edit rating"}
      >
        {stars}
        {clickLabel && (
          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {clickLabel}
          </span>
        )}
      </button>
    );
  }

  return stars;
}

// ── Individual review card ─────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  const locale = useLocale();
  const dateStr = review.created_at
    ? new Date(review.created_at).toLocaleDateString(
        locale === "ar" ? "ar-PS" : "en-US",
        { year: "numeric", month: "short", day: "numeric" }
      )
    : "";

  return (
    <div className="p-5 rounded-2xl border border-border bg-background shadow-sm space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
            {(review.user?.name || "?")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              {review.user?.name || "Anonymous"}
            </p>
            {dateStr && (
              <p className="text-[11px] text-muted-foreground">{dateStr}</p>
            )}
          </div>
        </div>
        <StarDisplay value={review.rating} size="sm" />
      </div>
      {review.comment && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {review.comment}
        </p>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function HubReviews({
  hubSlug,
  reviews,
  isAuthenticated,
  myReview,
  averageRating,
}: HubReviewsProps) {
  const t = useTranslations("HubReviews");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ── State for submitting a NEW review ──
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  // ── State for EDITING an existing review ──
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(myReview?.rating ?? 0);
  const [editComment, setEditComment] = useState(myReview?.comment ?? "");

  // ── Delete confirmation ──
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  console.log("myReview", myReview?.has_reviewed);
  const hasExistingReview = myReview?.has_reviewed == true;
  console.log("hasExistingReview", hasExistingReview);

  const avg =
    averageRating ??
    (reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0);

  // Submit NEW review
  const handleSubmitNew = useCallback(() => {
    if (newRating === 0) {
      toast.error(t("ratingRequired"));
      return;
    }
    startTransition(async () => {
      const res = await submitHubReview(hubSlug, newRating, newComment, false);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(t("submitted"));
        setNewRating(0);
        setNewComment("");
        router.refresh();
      }
    });
  }, [hubSlug, newRating, newComment, t, router]);

  // Save EDIT
  const handleSaveEdit = useCallback(() => {
    if (editRating === 0) {
      toast.error(t("ratingRequired"));
      return;
    }
    startTransition(async () => {
      const res = await submitHubReview(hubSlug, editRating, editComment, true);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(t("updated"));
        setIsEditing(false);
        router.refresh();
      }
    });
  }, [hubSlug, editRating, editComment, t, router]);

  const handleCancelEdit = useCallback(() => {
    setEditRating(myReview?.rating ?? 0);
    setEditComment(myReview?.comment ?? "");
    setIsEditing(false);
  }, [myReview]);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteMyHubReview(hubSlug);
    setIsDeleting(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(t("deleted"));
      setShowDeleteConfirm(false);
      setNewRating(0);
      setNewComment("");
      router.refresh();
    }
  };

  return (
    <section id="reviews" className="space-y-8">
      {/* ── Section header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">{t("title")}</h2>
        </div>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-amber-700 text-lg">
              {avg.toFixed(1)}
            </span>
            <span className="text-amber-600 text-sm">/ 5</span>
            <span className="text-muted-foreground text-xs ms-1">
              ({reviews.length}{" "}
              {t("reviewCount", { count: reviews.length })})
            </span>
          </div>
        )}
      </div>

      {/* ── Review Block (Submit/Display Own) ── */}
      {isAuthenticated ? (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

          {/* ── CASE A: User HAS an existing review ── */}
          {hasExistingReview && !isEditing && (
            <div className="px-6 py-6 space-y-4">
              {/* Header logic: Hide label, show content in its place if exists */}
              {myReview!.comment ? (
                <p className="text-sm text-foreground font-medium leading-relaxed">
                  {myReview!.comment}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  {t("noComment")}
                </p>
              )}

              {/* Ownership Check: buttons above stars/comment-sub-area */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => {
                    setEditRating(myReview!.rating);
                    setEditComment(myReview!.comment ?? "");
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  {t("edit")}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("deleteReview")}
                </button>
              </div>

              {/* Layout Swap: Star display below buttons/text — click to edit */}
              
              
              <div className="pt-2">
              
              {hasExistingReview ? <StarDisplay
                  value={myReview!.rating}
                  size="lg"
                  onClick={() => {
                    setEditRating(myReview!.rating);
                    setEditComment(myReview!.comment ?? "");
                    setIsEditing(true);
                  }}
                />: <StarDisplay
                  value={0}
                  onClick={() => {
                    console.log("hasExistingReview", hasExistingReview);
                  }}
                  size="lg"
                />}
              </div>

              {/* Delete confirmation inline panel */}
              {showDeleteConfirm && (
                <div className="p-4 mt-2 border border-red-100 rounded-xl bg-red-50/60 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-700">
                        {t("deleteReview")}
                      </p>
                      <p className="text-xs text-red-700/70 mt-0.5">
                        {t("deleteConfirm")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 justify-end mt-4">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                      className="px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      {t("deleteReview")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CASE B: Editing mode ── */}
          {hasExistingReview && isEditing && (
            <div className="px-6 py-6 space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <h3 className="font-semibold text-sm text-foreground">
                  {t("editReviewTitle")}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t("yourRating")}
                  </p>
                  <StarSelector value={editRating} onChange={setEditRating} size="lg" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t("commentLabel")}
                  </p>
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={4}
                    placeholder={t("commentPlaceholder")}
                    className="w-full px-4 py-3 border border-input rounded-xl bg-muted/20 text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={handleCancelEdit}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                >
                  <X className="h-4 w-4" />
                  {t("cancel")}
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isPending || editRating === 0}
                  className="flex items-center gap-2 px-7 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {t("saveChanges")}
                </button>
              </div>
            </div>
          )}

          {/* ── CASE C: New Review Interaction (Star-first) ── */}
          {!hasExistingReview && (
            <div className="px-6 py-8 space-y-6">
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-foreground">
                  {t("addYourReview")}
                </h3>
                {/* Click directly on stars to start */}
                <div className="flex items-center gap-4">
                   <StarSelector value={newRating} onChange={setNewRating} size="lg" />
                   {newRating > 0 && (
                      <span className="text-sm font-bold text-amber-600 animate-in fade-in zoom-in-75 duration-300">
                        {newRating} / 5
                      </span>
                   )}
                </div>
                {newRating === 0 && (
                  <p className="text-sm text-muted-foreground animate-pulse">
                    {t("tapToRate")}
                  </p>
                )}
              </div>

              {/* Expand comment + submit button once stars are picked */}
              <div
                className={`grid transition-all duration-500 ease-in-out ${
                  newRating > 0 ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="space-y-4 pt-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={4}
                      placeholder={t("commentPlaceholder")}
                      className="w-full px-4 py-3 border border-input rounded-xl bg-muted/30 text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={handleSubmitNew}
                        disabled={isPending || newRating === 0}
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                      >
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        {t("submit")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── Login prompt ── */
        <div className="rounded-2xl border border-border bg-muted/20 p-8 text-center space-y-4">
          <LogIn className="h-10 w-10 text-muted-foreground/50 mx-auto" />
          <div className="space-y-1">
            <p className="font-bold text-foreground text-lg">{t("loginToReview")}</p>
            <p className="text-sm text-muted-foreground">{t("loginDesc")}</p>
          </div>
          <Link
            href={`/${locale}/signin`}
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <LogIn className="h-4 w-4" />
            {t("signIn")}
          </Link>
        </div>
      )}

      {/* ── Reviews list ── */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-3 opacity-50">
          <MessageSquare className="h-12 w-12 mx-auto" />
          <div className="space-y-1">
            <p className="font-semibold text-lg">{t("noReviews")}</p>
            <p className="text-sm">{t("beFirst")}</p>
          </div>
        </div>
      )}
    </section>
  );
}
