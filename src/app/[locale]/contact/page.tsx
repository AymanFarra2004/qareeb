import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import ContactView from "@/components/contact/ContactView";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ContactUs");
  return {
    title: `${t("meta.title")} | Qareeb`,
    description: t("meta.description"),
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
