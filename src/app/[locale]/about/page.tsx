import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import AboutView from "@/components/about/AboutView";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AboutUs");
  return {
    title: `${t("meta.title")} | Qareeb`,
    description: t("meta.description"),
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
