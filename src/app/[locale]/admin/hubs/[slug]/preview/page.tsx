import { getPrivateHubBySlug } from "@/src/actions/hubs";
import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Phone,
  Clock,
  Tag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Wifi,
  Zap,
  Monitor,
  Coffee,
  ImageOff,
} from "lucide-react";
import HubPreviewActions from "./HubPreviewActions";
import HubGallery from "@/components/hubs/hub/HubGallery";
import HubSocialAccounts from "@/components/hubs/hub/HubSocialAccounts";
import { format24to12 } from "@/src/lib/utils";

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

/** Resolve a relative API image path to a full URL */
function resolveImg(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://karam.idreis.net${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Build a full readable address by joining all breadcrumb segment names */
function buildFullAddress(hub: any, locale: string): string {
  // breadcrumb is an ordered array like [governorate, city, area]
  const breadcrumb: any[] = hub.breadcrumb || hub.location_breadcrumb || [];
  if (breadcrumb.length > 0) {
    return breadcrumb.map((b: any) => b.name || "").filter(Boolean).join(" ← ");
  }
  // Fallback: location name + address_details
  const parts: string[] = [];
  if (hub.location?.name) parts.push(hub.location.name);
  const addr =
    hub.address_details?.[locale] ||
    hub.address_details?.en ||
    hub.address_details?.ar ||
    (typeof hub.address_details === "string" ? hub.address_details : "");
  if (addr) parts.push(addr);
  return parts.join(" — ");
}

const serviceIcons: Record<string, React.ReactNode> = {
  Internet: <Wifi className="h-5 w-5" />,
  Electricity: <Zap className="h-5 w-5" />,
  Workspace: <Monitor className="h-5 w-5" />,
  "Coffee/Tea": <Coffee className="h-5 w-5" />,
};

export default async function AdminHubPreviewPage({ params }: PageProps) {
  const { slug } = await params;
  const t = await getTranslations("AdminHubPreview");
  const tGen = await getTranslations("HubManagement.general");
  const currentLocale = await getLocale();

  // Authenticated fetch — works for pending/rejected hubs too
  const res = await getPrivateHubBySlug(slug, currentLocale);

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

  // ── Core fields ────────────────────────────────────────────────────────────
  const name =
    hub.name?.[currentLocale] || hub.name?.en || hub.name?.ar || hub.name || "Unnamed Hub";

  const description =
    hub.description?.[currentLocale] ||
    hub.description?.en ||
    hub.description?.ar ||
    hub.description ||
    "";

  const fullAddress = buildFullAddress(hub, currentLocale);

  const addressDetail =
    hub.address_details?.[currentLocale] ||
    hub.address_details?.en ||
    hub.address_details?.ar ||
    (typeof hub.address_details === "string" ? hub.address_details : "");

  // ── Status ─────────────────────────────────────────────────────────────────
  const statusRaw = String(hub.status || "").toLowerCase();
  const isApproved = statusRaw === "approved" || statusRaw === "active" || statusRaw === "verified";
  const isPending  = statusRaw === "pending"  || statusRaw === "new";
  const isRejected = statusRaw === "rejected" || statusRaw === "refused";

  const statusConfig = isApproved
    ? { label: t("statusApproved"), icon: CheckCircle2, color: "green" }
    : isPending
    ? { label: t("statusPending"),  icon: AlertCircle,  color: "yellow" }
    : { label: t("statusRejected"), icon: XCircle,      color: "red" };

  const StatusIcon = statusConfig.icon;

  // ── Images ─────────────────────────────────────────────────────────────────
  const mainImage = resolveImg(hub.images?.main || hub.main_image);

  const galleryUrls: string[] = (
    hub.images?.gallery ||
    hub.gallery ||
    []
  )
    .map((g: any) => resolveImg(typeof g === "string" ? g : g?.url || g?.path))
    .filter(Boolean) as string[];

  // ── Services ───────────────────────────────────────────────────────────────
  const rawServices: any[] = hub.all_services || hub.services || [];
  const serviceNames: string[] = rawServices.map((s: any) =>
    s.name?.[currentLocale] || s.name?.en || s.name?.ar || s.name || ""
  ).filter(Boolean);

  // ── Sidebar data ───────────────────────────────────────────────────────────
  const operatingHours = hub.working_hours
    ? `${format24to12(hub.working_hours.start, tGen("am"), tGen("pm"))} – ${format24to12(hub.working_hours.end, tGen("am"), tGen("pm"))}`
    : null;

  const socials: any[] = hub.social_accounts || hub.socials || [];

  // ── Governorate (top-level breadcrumb) ────────────────────────────────────
  const governorate =
    (hub.breadcrumb || [])[0]?.name ||
    hub.location?.name ||
    "";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── Admin navigation bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/${currentLocale}/admin/hubs`}
            className="p-2 rounded-xl border border-border hover:bg-muted/40 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-xs text-muted-foreground">{t("backToHubs")}</p>
            <p className="text-xs font-mono opacity-50">{hub.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status badge */}
          <span
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
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

          {isApproved && (
            <Link
              href={`/${currentLocale}/hubs/${slug}`}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs font-semibold hover:bg-muted/40 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("viewLive")}
            </Link>
          )}
        </div>
      </div>

      {/* ── Quick Actions (Approve / Reject) ── */}
      <HubPreviewActions
        hubId={hub.id}
        slug={hub.slug}
        isApproved={isApproved}
        isPending={isPending}
        locale={currentLocale}
      />

      {/* ── Rejection reason banner ── */}
      {isRejected && hub.rejection_reason && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <span className="font-bold">{t("rejectionReason")}:</span> {hub.rejection_reason}
        </div>
      )}

      {/* ══════════════ PUBLIC-PAGE-STYLE LAYOUT BELOW ══════════════ */}

      {/* Hero Image — mirrors HubHeroImage */}
      <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden shadow-md">
        {mainImage ? (
          <img
            src={mainImage}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <ImageOff className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Hero text */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 text-white">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {isApproved && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/90 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                Verified Partner
              </span>
            )}
            {!isApproved && (
              <span className={`inline-flex items-center gap-1.5 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-sm backdrop-blur-md border border-white/30 ${isPending ? "bg-yellow-500/70" : "bg-red-500/70"}`}>
                <StatusIcon className="h-4 w-4" />
                {statusConfig.label}
              </span>
            )}
            {governorate && (
              <span className="text-white border border-white/40 bg-black/40 backdrop-blur-md text-sm font-medium px-3 py-1 rounded-full">
                {governorate}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">{name}</h1>
          {fullAddress && (
            <div className="flex items-center text-white/90 text-sm md:text-base">
              <MapPin className="h-4 w-4 md:h-5 md:w-5 mr-1.5 shrink-0" />
              {fullAddress}
            </div>
          )}
        </div>
      </div>

      {/* ── Main 2-col grid: content + sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left: Main content */}
        <div className="lg:col-span-2 space-y-10">

          {/* About */}
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("description")}</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {description || <span className="italic opacity-40">{t("noDescription")}</span>}
            </p>
          </section>

          <hr className="border-border" />

          {/* Services */}
          {serviceNames.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">{t("services")}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {serviceNames.map((svc) => (
                  <div
                    key={svc}
                    className="flex flex-col items-center justify-center p-6 rounded-xl bg-muted/50 border border-border text-center transition-colors hover:bg-muted"
                  >
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                      {serviceIcons[svc] || <ShieldCheck className="h-5 w-5" />}
                    </div>
                    <span className="font-medium">{svc}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Gallery */}
          {galleryUrls.length > 0 && (
            <>
              <hr className="border-border" />
              <HubGallery hubName={name} galleryUrls={galleryUrls} />
            </>
          )}

          {/* Location detail */}
          <hr className="border-border" />
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("location")}</h2>
            {/* Full breadcrumb chain */}
            {(hub.breadcrumb || []).length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {(hub.breadcrumb as any[]).map((b: any, i: number) => (
                  <span key={b.id || i} className="flex items-center gap-1.5 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      b.type === "governorate" ? "bg-primary/10 text-primary" :
                      b.type === "city"        ? "bg-blue-100 text-blue-700" :
                                                 "bg-muted text-muted-foreground"
                    }`}>
                      {b.name}
                    </span>
                    {i < (hub.breadcrumb as any[]).length - 1 && (
                      <span className="text-muted-foreground text-xs">›</span>
                    )}
                  </span>
                ))}
              </div>
            )}
            {addressDetail && (
              <p className="text-muted-foreground text-sm">{addressDetail}</p>
            )}
            {/* Map placeholder */}
          </section>

          {/* Social accounts */}
          {socials.length > 0 && (
            <>
              <hr className="border-border" />
              <HubSocialAccounts socials={socials} title={t("socialAccounts")} />
            </>
          )}
        </div>

        {/* Right: Sticky Sidebar — mirrors HhubSideBar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-xl space-y-6">

            {/* Pricing */}
            {hub.hourly_price != null && (
              <div className="pb-6 border-b border-border">
                <div className="flex items-baseline gap-1">
                  <span className="text-primary font-bold text-2xl">₪{hub.hourly_price}</span>
                  <span className="text-muted-foreground text-sm">/ {tGen("hour") || "hr"}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <Tag className="h-3.5 w-3.5 inline mr-1" />
                  {t("hourlyPrice")}
                </p>
              </div>
            )}

            {/* Hours */}
            <div className="space-y-4">
              {operatingHours && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{t("workingHours")}</div>
                    <div className="text-muted-foreground text-sm">{operatingHours}</div>
                  </div>
                </div>
              )}

              {/* Full address in sidebar */}
              {fullAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{t("location")}</div>
                    <div className="text-muted-foreground text-sm">{fullAddress}</div>
                    {addressDetail && addressDetail !== fullAddress && (
                      <div className="text-muted-foreground/70 text-xs mt-0.5">{addressDetail}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact */}
              {hub.contact && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{t("contact")}</div>
                    <div className="text-muted-foreground text-sm font-mono" dir="ltr">{hub.contact}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Owner info */}
            {hub.owner && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">
                  Hub Owner
                </p>
                <p className="text-sm font-medium">{hub.owner.name || "—"}</p>
                {hub.owner.email && (
                  <p className="text-xs text-muted-foreground">{hub.owner.email}</p>
                )}
              </div>
            )}

            {/* Slug / ID metadata */}
            <div className="pt-3 border-t border-border space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Slug</span>
                <span className="font-mono opacity-60">{hub.slug}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono opacity-60">{hub.id}</span>
              </div>
              {hub.reviews?.count != null && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Reviews</span>
                  <span className="font-mono opacity-60">{hub.reviews.count} (avg {hub.reviews.average_rating ?? 0})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
