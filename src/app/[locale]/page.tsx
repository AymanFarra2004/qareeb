import Image from "next/image";
import { Header } from "@/components/header/Header";
import HeroSection from "@/components/home-page/HeroSection";
import { Footer } from "@/components/footer/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <HeroSection initialHubs={[]} />
      <Footer />
    </div>
  );
}