import React from 'react'
import { IHub } from '@/data/hubs'
import { Clock, Phone, MapPin, Share2 } from 'lucide-react'

export default function HhubSideBar({hub}: {hub: IHub}) {
  const priceParts = (hub.pricing || '').split('/');
  const priceMain = priceParts[0]?.trim() || 'Contact';
  const priceUnit = priceParts.length > 1 ? priceParts.slice(1).join('/').trim() : null;

  return (
    <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-xl">        
            <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-center text-primary font-bold text-2xl mb-1">
                    {priceMain}
                </div>
                {priceUnit && (
                  <div className="text-muted-foreground">
                      per {priceUnit}
                  </div>
                )}
            </div>

            <div className="space-y-4 mb-8">
                {hub.operatingHours && (
                  <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                          <div className="font-medium">Operating Hours</div>
                          <div className="text-muted-foreground text-sm">{hub.operatingHours}</div>
                      </div>
                  </div>
                )}
                {hub.contact?.contactNumber && (
                  <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                          <div className="font-medium">Contact</div>
                          <div className="text-muted-foreground text-sm" dir="ltr">{hub.contact.contactNumber}</div>
                      </div>
                  </div>
                )}
            </div>

            <div className="space-y-3">
                <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-xl transition-all shadow-md flex justify-center items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Get Directions
                </button>
                <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-3 rounded-xl transition-all flex justify-center items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share Hub
                </button>
            </div>
        </div>
    </div>
  )
}