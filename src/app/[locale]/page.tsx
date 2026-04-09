import { Header } from "@/components/header/Header";
import ModernHomeView from "./components/home-page/ModernHomeView";
import { Footer } from "@/components/footer/Footer";
import { getAllHubs } from "@/src/actions/hubs";

export default async function Home() {
  const res = await getAllHubs();
  let hubs = res.data || [];
  if (!Array.isArray(hubs)) hubs = [];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#050505]">
      {/* 
        Note: The Header and Footer components themselves aren't being redesigned here,
        but we wrap the content in a dark background for continuity. 
        If Header/Footer need dark variants, that can be done at their component level.
      */}
      <div className="relative z-50">
        <Header />
      </div>
      
      <main className="flex-1">
        <ModernHomeView initialHubs={hubs} />
      </main>

      <div className="relative z-50 bg-white dark:bg-[#0A0A0B] border-t border-border">
        <Footer />
      </div>
    </div>
  );
}