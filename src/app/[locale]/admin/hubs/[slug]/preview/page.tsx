import { getHubBySlug } from "@/src/actions/hubs";
import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Phone,
  Clock,
  Image as ImageIcon,
  Layers,
  Share2,
  Tag,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import HubPreviewActions from "./HubPreviewActions";

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function AdminHubPreviewPage({ params }: PageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations("AdminHubPreview");
  const currentLocale = await getLocale();

  // Try the public endpoint first; falls back gracefully if the hub is private/pending
  const res = await getHubBySlug(slug, currentLocale);

  if (!res.success || !res.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-bold">{t("hubNotFound")}</h2>
          <Link
            href={`/${currentLocale}/admin/hubs`}
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToHubs")}
          </Link>
        </div>
      </div>
    );
  }

  const hub = res.data;
  const name =
    hub.name?.[currentLocale] || hub.name?.en || hub.name?.ar || hub.name || "Unnamed Hub";
  const description =
    hub.description?.[currentLocale] ||
    hub.description?.en ||
    hub.description?.ar ||
    hub.description ||
    "";
  const address =
    hub.address_details?.[currentLocale] ||
    hub.address_details?.en ||
    hub.address_details?.ar ||
    "";

  const statusRaw = String(hub.status || "").toLowerCase();
  const isApproved =
    statusRaw === "approved" || statusRaw === "active" || statusRaw === "verified";
  const isPending = statusRaw === "pending" || statusRaw === "new";
  const isRejected = statusRaw === "rejected" || statusRaw === "refused";

  const statusConfig = isApproved
    ? { label: t("statusApproved"), icon: CheckCircle2, color: "green" }
    : isPending
    ? { label: t("statusPending"), icon: AlertCircle, color: "yellow" }
    : { label: t("statusRejected"), icon: XCircle, color: "red" };

  const StatusIcon = statusConfig.icon;

  const gallery: string[] = hub.gallery || hub.images || [];
  const mainImage: string | null = hub.main_image || hub.image || gallery[0] || null;
  const services: any[] = hub.services || [];
  const socials: any[] = hub.social_accounts || hub.socials || [];
  const workingHours = hub.working_hours || null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/${currentLocale}/admin/hubs`}
            className="p-2 rounded-xl border border-border hover:bg-muted/40 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{name}</h1>
            <p className="text-xs font-mono text-muted-foreground mt-0.5 opacity-70">
              {hub.slug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status badge */}
          <span
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
            ${
              isApproved
                ? "bg-green-100 text-green-700"
                : isPending
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {statusConfig.label}
          </span>

          {/* Live page link (only if approved) */}
          {isApproved && (
            <Link
              href={`/${currentLocale}/hubs/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs font-semibold hover:bg-muted/40 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("viewLive")}
            </Link>
          )}
        </div>
      </div>

      {/* ── Quick Actions (Approve / Reject) ── */}
      {(isPending || isRejected || isApproved) && (
        <HubPreviewActions
          hubId={hub.id}
          slug={hub.slug}
          isApproved={isApproved}
          isPending={isPending}
          locale={currentLocale}
        />
      )}

      {/* ── Rejection reason banner ── */}
      {isRejected && hub.rejection_reason && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <span className="font-bold">{t("rejectionReason")}:</span> {hub.rejection_reason}
        </div>
      )}

      {/* ── Main Image ── */}
      {mainImage && (
        <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-border shadow-sm">
          <img
            src={mainImage}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      {/* ── Detail Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Description */}
        <div className="md:col-span-2 bg-background border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            <Layers className="h-4 w-4" />
            {t("description")}
          </h2>
          <p className="text-sm leading-relaxed text-foreground">
            {description || <span className="opacity-40 italic">{t("noDescription")}</span>}
          </p>
        </div>

        {/* Location & Contact */}
        <div className="bg-background border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="flex items-center gap-2 font-bold text-sm text-muted-foreground uppercase tracking-wider">
            <MapPin className="h-4 w-4" />
            {t("location")}
          </h2>
          <div className="text-sm space-y-2">
            <p className="text-foreground">
              {hub.location?.name || hub.governorate || (
                <span className="opacity-40 italic">{t("noLocation")}</span>
              )}
            </p>
            {address && <p className="text-muted-foreground">{address}</p>}
          </div>

          {hub.contact && (
            <div className="pt-2 border-t border-border">
              <h3 className="flex items-center gap-2 font-bold text-xs text-muted-foreground uppercase tracking-wider mb-2">
                <Phone className="h-3.5 w-3.5" />
                {t("contact")}
              </h3>
              <p className="text-sm font-mono text-foreground">{hub.contact}</p>
            </div>
          )}
        </div>

        {/* Working Hours */}
        <div className="bg-background border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="flex items-center gap-2 font-bold text-sm text-muted-foreground uppercase tracking-wider">
            <Clock className="h-4 w-4" />
            {t("workingHours")}
          </h2>
          {workingHours ? (
            <div className="text-sm text-foreground space-y-1">
              <p>
                <span className="text-muted-foreground font-medium">{t("opens")}:</span>{" "}
                {workingHours.start || workingHours.open || "—"}
              </p>
              <p>
                <span className="text-muted-foreground font-medium">{t("closes")}:</span>{" "}
                {workingHours.end || workingHours.close || "—"}
              </p>
            </div>
          ) : (
            <p className="text-sm opacity-40 italic">{t("noWorkingHours")}</p>
          )}

          {hub.hourly_price != null && (
            <div className="pt-2 border-t border-border">
              <h3 className="flex items-center gap-2 font-bold text-xs text-muted-foreground uppercase tracking-wider mb-2">
                <Tag className="h-3.5 w-3.5" />
                {t("hourlyPrice")}
              </h3>
              <p className="text-sm font-semibold text-foreground">
                ₪{hub.hourly_price} / {t("hour")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Services ── */}
      {services.length > 0 && (
        <div className="bg-background border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">
            <Layers className="h-4 w-4" />
            {t("services")} ({services.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {services.map((svc: any, i: number) => {
              const svcName =
                svc.name?.[currentLocale] || svc.name?.en || svc.name?.ar || svc.name || `Service ${i + 1}`;
              return (
                <span
                  key={svc.id || i}
                  className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-full"
                >
                  {svcName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Gallery ── */}
      {gallery.length > 0 && (
        <div className="bg-background border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">
            <ImageIcon className="h-4 w-4" />
            {t("gallery")} ({gallery.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {gallery.map((imgUrl: string, i: number) => (
              <a
                key={i}
                href={imgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-square rounded-xl overflow-hidden border border-border hover:ring-2 hover:ring-primary/40 transition-all"
              >
                <img
                  src={imgUrl}
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Social Accounts ── */}
      {socials.length > 0 && (
        <div className="bg-background border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">
            <Share2 className="h-4 w-4" />
            {t("socialAccounts")}
          </h2>
          <div className="flex flex-wrap gap-3">
            {socials.map((s: any, i: number) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted/40 transition-colors capitalize"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {s.platform}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
