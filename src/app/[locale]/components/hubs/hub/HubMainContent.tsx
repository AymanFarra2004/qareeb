import React from 'react'
import { IHub } from '@/data/hubs'
import { ShieldCheck } from 'lucide-react'
import HubGallery from './HubGallery'
import HubOffers from './HubOffers'
import HubSocialAccounts from './HubSocialAccounts'

import { getServiceIcon } from '@/src/data/hubs'
import { useTranslations } from 'next-intl'

export default function HubMainContent({hub, offers = []}: {hub: IHub, offers?: any[]}) {
  const t = useTranslations("HubManagement.general");
  return (
    <div className="lg:col-span-2 space-y-10">
              
              {/* Services */}
              <section>
                <h2 className="text-2xl font-bold mb-6">{t("services")}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {hub.services.map((service, index) => {
                    const serviceName = typeof service === 'string' ? service : service.name;
                    const serviceDesc = typeof service === 'string' ? undefined : service.description;
                    const key = `${serviceName}-${index}`;
                    return (
                    <div key={key} className="flex flex-col items-center p-4 rounded-2xl bg-muted/30 border border-border/50 text-center transition-all duration-300 hover:bg-muted hover:shadow-md hover:-translate-y-1 relative overflow-hidden group h-full">
                      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="h-14 w-14 rounded-2xl bg-background shadow-sm border border-border/50 text-primary flex items-center justify-center mb-3 transition-transform group-hover:scale-110 shrink-0">
                        {getServiceIcon(serviceName, "h-6 w-6")}
                      </div>
                      <span className="font-medium text-sm sm:text-base">{serviceName}</span>
                      {serviceDesc && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{serviceDesc}</p>
                      )}
                    </div>
                    );
                  })}
                </div>
              </section>

              {offers.length > 0 && (
                <>
                  <hr className="border-border" />
                  <HubOffers offers={offers} />
                </>
              )}

              {(() => {
                const allGalleryUrls = [
                  hub.imageUrl && !hub.imageUrl.includes('placehold.co') ? hub.imageUrl : null,
                  ...(hub.galleryUrls || [])
                ].filter((url, index, self) => url && self.indexOf(url) === index) as string[];

                if (allGalleryUrls.length === 0) return null;

                return (
                  <>
                    <hr className="border-border" />
                    <HubGallery hubName={hub.name} galleryUrls={allGalleryUrls} />
                  </>
                );
              })()}

              {/* Social Accounts */}
              {hub.socialAccounts && hub.socialAccounts.length > 0 && (
                <>
                  <hr className="border-border" />
                  <HubSocialAccounts socials={hub.socialAccounts} />
                </>
              )}

            </div>
  )
}