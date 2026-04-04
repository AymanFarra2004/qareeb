import Image from "next/image";
import { Header } from "@/components/header/Header";
import HeroSection from "@/components/home-page/HeroSection";
import { Footer } from "@/components/footer/Footer";
import ApiTest from "@/components/testapi";
import { getMyHubs } from "@/src/actions/hubs";

export default async function Home() {
  const { data: apiHubs } = await getMyHubs();
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <HeroSection initialHubs={apiHubs || []} />
      <Footer />
      {/* <ApiTest /> */}
    </div>
  );
}