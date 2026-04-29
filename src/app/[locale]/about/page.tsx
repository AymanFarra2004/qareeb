import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import AboutView from "@/components/about/AboutView";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CONFIG } from "@/src/config";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("AboutUs");
  const baseUrl = CONFIG.APP_URL;

  return {
    title: `${t("meta.title")} | Qareeb`,
    description: t("meta.description"),
    alternates: {
      canonical: `${baseUrl}/${locale}/about`,
      languages: {
        'ar': `${baseUrl}/ar/about`,
        'en': `${baseUrl}/en/about`,
        'x-default': `${baseUrl}/ar/about`,
      },
    },
    openGraph: {
      title: `${t("meta.title")} | Qareeb`,
      description: t("meta.description"),
      url: `${baseUrl}/${locale}/about`,
      siteName: 'Qareeb',
      type: 'website',
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t("meta.title")} | Qareeb`,
      description: t("meta.description"),
    },
  };
}

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="relative z-50">
        <Header />
      </div>
      <main className="flex-1">
        <AboutView />
      </main>
      <div className="relative z-50 bg-background border-t border-border">
        <Footer />
      </div>
    </div>
  );
}
