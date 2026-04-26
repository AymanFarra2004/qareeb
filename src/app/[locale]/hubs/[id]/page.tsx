import Link from "next/link"
import { notFound } from "next/navigation"
import { Wifi, Zap, Monitor, Coffee, ChevronLeft } from "lucide-react"

import { Header } from "@/components/header/Header"
import { Footer } from "@/components/footer/Footer"
import { getHubOffers, getHubBySlug, getHubReviews, getMyHubReview } from "@/src/actions/hubs"
import HubHeroImage from "@/components/hubs/hub/HubHeroImage"
import HubMainContent from "@/components/hubs/hub/HubMainContent"
import HhubSideBar from "@/components/hubs/hub/HhubSideBar"
import HubReviews from "@/components/hubs/hub/HubReviews"
import { getLocale, getTranslations } from "next-intl/server"
import { format24to12 } from "@/src/lib/utils"
import { Metadata } from "next"
// import { useTranslations } from "next-intl"

export async function generateMetadata({ params }: { params: Promise<{ id: string, locale: string }> }): Promise<Metadata> {
  const { id, locale } = await params;
  const hubRes = await getHubBySlug(id, locale);
  const rawHub = hubRes.success ? hubRes.data : null;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qareeb.cc';

  if (!rawHub) {
    return {
      title: "Hub Not Found | Qareeb",
    };
  }

  const name = typeof rawHub.name === 'string' ? rawHub.name : (rawHub.name?.[locale] || rawHub.name?.en || rawHub.name?.ar || id);
  const description = typeof rawHub.description === 'string' ? rawHub.description : (rawHub.description?.[locale] || rawHub.description?.en || rawHub.description?.ar || "");
  const descriptionTrimmed = description.substring(0, 160);

  const mainImageRaw: string | null = typeof rawHub.images?.main === 'string' ? rawHub.images.main : null;
  const imageUrl = mainImageRaw
    ? (mainImageRaw.startsWith('http') ? mainImageRaw : `https://karam.idreis.net${mainImageRaw.startsWith('/') ? '' : '/'}${mainImageRaw}`)
    : null;

  return {
    title: `${name} | Qareeb`,
    description: descriptionTrimmed,
    alternates: {
      canonical: `${baseUrl}/${locale}/hubs/${id}`,
      languages: {
        'ar': `${baseUrl}/ar/hubs/${id}`,
        'en': `${baseUrl}/en/hubs/${id}`,
        'x-default': `${baseUrl}/ar/hubs/${id}`,
      },
    },
    openGraph: {
      title: `${name} | Qareeb`,
      description: descriptionTrimmed,
      url: `${baseUrl}/${locale}/hubs/${id}`,
      siteName: 'Qareeb',
      type: 'website',
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      ...(imageUrl && { images: [{ url: imageUrl, alt: name }] }),
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title: `${name} | Qareeb`,
      description: descriptionTrimmed,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}



function mapApiHub(apiHub: any, locale: string = "ar", amLabel: string = "AM", pmLabel: string = "PM") {
  const mainImage = typeof apiHub.images?.main === 'string' ? apiHub.images.main : null;
  // const t = useTranslations("HubManagement.general");
  return {
    id: String(apiHub.id),
    slug: apiHub.slug,
    name: typeof apiHub.name === 'string' ? apiHub.name : (apiHub.name?.[locale] || apiHub.name?.en || apiHub.name?.ar || "Unknown Hub"),
    description:
      typeof apiHub.description === 'string'
        ? apiHub.description
        : (apiHub.description?.[locale] || apiHub.description?.en || apiHub.description?.ar || "No description"),
    location:
      typeof apiHub.address_details === 'string'
        ? apiHub.address_details
        : (apiHub.address_details?.[locale] || apiHub.address_details?.en || apiHub.address_details?.ar || "Unknown"),
    governorate: apiHub.location?.name || "Gaza",
    pricing: apiHub.hourly_price
      ? `${apiHub.hourly_price} / hour`
      : apiHub.pricing || "Contact for pricing",
    operatingHours: apiHub.working_hours
      ? `${format24to12(apiHub.working_hours.start, amLabel, pmLabel)} - ${format24to12(apiHub.working_hours.end, amLabel, pmLabel)}`
      : apiHub.operating_hours || "Contact for hours",
    services: Array.isArray((apiHub.all_services && apiHub.all_services.length > 0) ? apiHub.all_services : apiHub.services)
      ? ((apiHub.all_services && apiHub.all_services.length > 0) ? apiHub.all_services : apiHub.services).map((s: any) => {
          const name = typeof s.name === 'string' ? s.name : (s.name?.[locale] || s.name?.en || s.name || s);
          const description = s.description ? (typeof s.description === 'string' ? s.description : (s.description?.[locale] || s.description?.en || s.description)) : undefined;
          return { name, description };
        })
      : [],
    imageUrl: mainImage
      ? mainImage.startsWith("http")
        ? mainImage
        : `https://karam.idreis.net${mainImage.startsWith("/") ? "" : "/"}${mainImage}`
      : "https://placehold.co/600x400?text=No+Image",
    galleryUrls: Array.isArray(apiHub.images?.gallery)
      ? apiHub.images.gallery.map((g: any) => {
          const url = typeof g === 'string' ? g : g?.url;
          if (typeof url !== 'string') return null;
          return url.startsWith("http") ? url : `https://karam.idreis.net${url.startsWith("/") ? "" : "/"}${url}`;
        }).filter(Boolean)
      : [],
    verificationStatus: (apiHub.status === "approved" ? "Verified" : "Pending") as "Verified" | "Pending",
    contact: {
      contactNumber: apiHub.contact || "",
      email: apiHub.email || "",
    },
    socialAccounts: Array.isArray(apiHub.social_accounts)
      ? apiHub.social_accounts.map((s: any) => ({ platform: s.platform || "other", url: s.url || "" })).filter((s: any) => s.url)
      : [],
  }
}


export default async function HubDetails({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const locale = await getLocale()

  const [hubRes, t] = await Promise.all([
    getHubBySlug(id, locale),
    getTranslations("HubManagement.general"),
  ])

  const rawHub = hubRes.success ? hubRes.data : null
  if (!rawHub) notFound()

  const slug = rawHub.slug || id

  const [offersRes, reviewsRes, myReviewRes] = await Promise.all([
    getHubOffers(slug, locale),
    getHubReviews(slug),
    getMyHubReview(slug),
  ])

  const hub = mapApiHub(rawHub, locale, t("am"), t("pm"))
  const offers = offersRes.success ? offersRes.data : []


  // getHubReviews now extracts data.reviews correctly and parses average_rating as float
  const reviews: any[] = reviewsRes.data ?? []
  const isAuthenticated: boolean = myReviewRes.authenticated ?? false
  const myReview: any | null = myReviewRes.data ?? null
  const averageRating: number = reviewsRes.averageRating ?? 0

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow pt-24 pb-20">
        
        <HubHeroImage hub={hub} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">

          <Link
            href="/hubs"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            العودة للمراكز
            {/* {t("backToHubs")} */}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Sidebar: Top on mobile (order-1), Right on desktop (lg:order-2) */}
            <div className="order-1 lg:order-2">
              <HhubSideBar hub={hub} />
            </div>

            {/* Main Content: Bottom on mobile (order-2), Left on desktop (lg:order-1) */}
            <div className="lg:col-span-2 space-y-10 order-2 lg:order-1">
              <HubMainContent hub={hub} offers={offers} />

              <hr className="border-border" />

              <HubReviews
                hubSlug={slug}
                reviews={reviews}
                isAuthenticated={isAuthenticated}
                myReview={myReview}
                averageRating={averageRating}
              />
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}