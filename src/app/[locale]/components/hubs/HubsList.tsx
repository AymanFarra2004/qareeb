import React from 'react'
import { HubCard } from '../general/HubCard'

export default function HubsList({hubsData}: {hubsData: any[]}) {
  return (
    <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-muted-foreground">Showing {hubsData.length} results</p>
                <select className="h-9 w-40 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option>Most Relevant</option>
                  <option>Price: Low to High</option>
                  <option>Recently Added</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                 {hubsData.map((hub: any) => (
                  <HubCard key={hub.id} hub={hub} />
                ))}
              </div>
            </div>
  )
}