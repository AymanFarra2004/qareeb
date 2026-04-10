import React from 'react'
import { IHub } from '@/data/hubs'
import { ShieldCheck, MapPin } from 'lucide-react'
import HubGallery from './HubGallery'

export default function HubMainContent({hub, serviceIcons}: {hub: IHub, serviceIcons: Record<string, React.ReactNode>}) {
  return (
    <div className="lg:col-span-2 space-y-10">
              
              {/* About */}
              <section>
                <h2 className="text-2xl font-bold mb-4">About this Hub</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {hub.description}
                </p>
              </section>

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

              <hr className="border-border" />

              {/* Location/Map placeholder */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Location</h2>
                <div className="aspect-video w-full rounded-xl bg-muted border border-border overflow-hidden relative group cursor-pointer flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors z-10" />
                    <div className="text-center relative z-20">
                      <MapPin className="h-10 w-10 text-primary mx-auto mb-2 opacity-80" />
                      <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        Click to view on interactive map
                      </span>
                    </div>
                </div>
              </section>

            </div>

  )
}