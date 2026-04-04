"use client";
import { useTranslations } from 'next-intl';
import HeroQuickSearch from './HeroQuickSearch';
import FeaturedHubSection from './FeaturedHubSection';
import { useState } from 'react';

const HeroSection = ({ initialHubs = [] }: { initialHubs?: any[] }) => {
  const t = useTranslations("Hero");
  const [filter, setFilter] = useState<{governorate: string, service: string}>({governorate: "", service: ""});
  return (
    <section className="bg-muted/30 border-b border-border py-12 md:py-20 lg:py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6">
                {t.rich('title', {
                  br: () => <br className="hidden sm:block" />,
                  primary: (chunks: any) => <span className="text-primary">{chunks}</span>
                })}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                {t("description")}
              </p>
              <HeroQuickSearch setFilter={setFilter} />
            </div>
          </div>
          <FeaturedHubSection filter={filter} hubs={initialHubs} />
          
          {/* Decorative background elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
        </section>
  )
}

export default HeroSection