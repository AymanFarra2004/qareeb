"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { CONFIG } from "@/src/config";

import { Link } from "@/src/i18n/routing";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

export default function HeebatRibbon({ hubs = [] }: { hubs?: any[] }) {
  const locale = useLocale();
  const approvedHubs = hubs.filter(hub => hub.status === "approved");
  const [randomHubs, setRandomHubs] = useState<any[]>(approvedHubs.slice(0, 8));

  useEffect(() => {
    if (approvedHubs.length > 0) {
      const shuffled = [...approvedHubs].sort(() => 0.5 - Math.random());
      setRandomHubs(shuffled.slice(0, 8));
    }
  }, [hubs]);

  if (randomHubs.length === 0) return null;

  // Duplicate items for seamless infinite scroll
  const duplicatedHubs = [...randomHubs, ...randomHubs, ...randomHubs, ...randomHubs];

  return (
    <section className="py-10 bg-background border-y border-black/10 dark:border-white/10 overflow-hidden relative flex">
      {/* Gradient fades for the edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-6 items-center px-4"
        animate={{ x: [0, -1500] }} 
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 30,
        }}
        whileHover={{ animationPlayState: "paused" }}
      >
        {duplicatedHubs.map((hub, index) => {
          const hubName = typeof hub.name === 'string' ? hub.name : (hub.name?.[locale] || hub.name?.en || hub.name?.ar || "Unknown Hub");
          const imageUrl = hub.images?.main ? (hub.images.main.startsWith('http') ? hub.images.main : `${CONFIG.API_URL}${hub.images.main.startsWith('/') ? '' : '/'}${hub.images.main}`) : "https://placehold.co/100x100?text=Hub";
          return (
            <Link
              href={`/hubs/${hub.slug}`}
              key={`${hub.id}-${index}`}
              className="flex items-center gap-3 pr-6 pl-2 py-2 bg-card border border-border/50 rounded-full whitespace-nowrap shadow-sm hover:shadow-md hover:border-purple-500/30 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <img src={imageUrl} alt={hubName} className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-medium text-foreground">{hubName}</span>
            </Link>
          );
        })}
      </motion.div>
    </section>
  );
}
