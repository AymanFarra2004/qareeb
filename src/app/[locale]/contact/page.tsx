import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import ContactView from "@/components/contact/ContactView";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CONFIG } from "@/src/config";


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("ContactUs");
  const baseUrl = CONFIG.APP_URL;

  return {
    title: `${t("meta.title")} | Qareeb`,
    description: t("meta.description"),
    alternates: {
      canonical: `${baseUrl}/${locale}/contact`,
      languages: {
        'ar': `${baseUrl}/ar/contact`,
        'en': `${baseUrl}/en/contact`,
        'x-default': `${baseUrl}/ar/contact`,
      },
    },
    openGraph: {
      title: `${t("meta.title")} | Qareeb`,
      description: t("meta.description"),
      url: `${baseUrl}/${locale}/contact`,
      siteName: 'Qareeb',
      type: 'website',
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
    },
    twitter: {
      card: 'summary',
      title: `${t("meta.title")} | Qareeb`,
      description: t("meta.description"),
    },
  };
}

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="relative z-50">
        <Header />
      </div>
      <main className="flex-1">
        <ContactView />
      </main>
      <div className="relative z-50 bg-background border-t border-border">
        <Footer />
      </div>
    </div>
  );
}
