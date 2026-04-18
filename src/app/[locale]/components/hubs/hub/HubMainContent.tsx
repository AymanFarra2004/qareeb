import React from 'react'
import { IHub } from '@/data/hubs'
import { ShieldCheck } from 'lucide-react'
import HubGallery from './HubGallery'
import HubOffers from './HubOffers'
import HubSocialAccounts from './HubSocialAccounts'

export default function HubMainContent({hub, serviceIcons, offers = []}: {hub: IHub, serviceIcons: Record<string, React.ReactNode>, offers?: any[]}) {
  return (
    <div className="lg:col-span-2 space-y-10">
              
              {/* About */}
              <section>
                <h2 className="text-2xl font-bold mb-4">About this Hub</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {hub.description}
                </p>
              </section>

              {offers.length > 0 && (
                <>
                  <hr className="border-border" />
                  <HubOffers offers={offers} />
                </>
              )}

              <hr className="border-border" />

              {/* Services */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Available Services</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hub.services.map((service) => (
                    <div key={service} className="flex flex-col items-center justify-center p-6 rounded-xl bg-muted/50 border border-border text-center transition-colors hover:bg-muted">
                      <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                        {serviceIcons[service] || <ShieldCheck className="h-5 w-5" />}
                      </div>
                      <span className="font-medium">{service}</span>
                    </div>
                  ))}
                </div>
              </section>

              {hub.galleryUrls && hub.galleryUrls.length > 0 && (
                <>
                  <hr className="border-border" />
                  <HubGallery hubName={hub.name} galleryUrls={hub.galleryUrls} />
                </>
              )}

              {/* Social Accounts */}
              {hub.socialAccounts && hub.socialAccounts.length > 0 && (
                <>
                  <hr className="border-border" />
                  <HubSocialAccounts socials={hub.socialAccounts} />
                </>
              )}

              <hr className="border-border" />

              {/* Location/Map placeholder */}

            </div>

  )
}