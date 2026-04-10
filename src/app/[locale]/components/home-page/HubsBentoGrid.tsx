"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MapPin, Clock, Zap } from "lucide-react";

export default function HubsBentoGrid({ filter, hubs = [] }: { filter: { governorate: string, service: string }, hubs?: any[] }) {
  const mappedHubs = hubs.map(apiHub => ({
    id: String(apiHub.id),
    slug: apiHub.slug,
    name: apiHub.name?.en || apiHub.name?.ar || apiHub.name || "Unknown Hub",
    description: apiHub.description?.en || apiHub.description?.ar || apiHub.description || "No description",
    location: apiHub.address_details?.en || apiHub.address_details?.ar || apiHub.address_details || "Unknown",
    governorate: apiHub.location?.name || "Gaza",
    pricing: apiHub.pricing || "Free",
    operatingHours: "24/7",
    services: Array.isArray(apiHub.services) ? apiHub.services.map((s: any) => s.name?.en || s.name) : [],
    imageUrl: apiHub.images?.main ?
      (apiHub.images.main.startsWith('http') ? apiHub.images.main : `https://karam.idreis.net${apiHub.images.main.startsWith('/') ? '' : '/'}${apiHub.images.main}`)
      : "https://placehold.co/600x400?text=No+Image",
    verificationStatus: apiHub.status === "approved" ? "Verified" : "Pending",
    contact: { contactNumber: apiHub.contact || "" }
  }));

  // Only show approved hubs in the featured grid
  const displayHubs = mappedHubs.filter((apiHub: any) => apiHub.verificationStatus === "Verified");

  const filteredHubs = (filter.governorate === "" && filter.service === "")
    ? displayHubs
    : displayHubs.filter((hub) => {
      const govMatch =
        filter.governorate === "" ||
        (hub.governorate || "").toLowerCase().includes(filter.governorate.toLowerCase()) ||
        filter.governorate.toLowerCase().includes((hub.governorate || "").toLowerCase());

      const srvMatch =
        filter.service === "" ||
        (hub.services || []).some((s: string) =>
          s.toLowerCase().includes(filter.service.toLowerCase())
        );

      return govMatch && srvMatch;
    });

  // Limit to max 6 for a balanced bento grid
  const bentoHubs = filteredHubs.slice(0, 6);

  return (
    <section className="py-24 bg-gray-50 dark:bg-[#050505] relative z-10 transition-colors duration-300" id="hubs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-600 dark:from-purple-400 dark:to-blue-500">Hubs</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Discover top-rated, premium spaces across Gaza designed for productivity, connection, and comfort.
            </p>
          </div>
          <a href="/hubs" className="group relative inline-flex items-center justify-center px-6 py-3 font-medium text-gray-800 dark:text-white bg-black/5 dark:bg-white/10 rounded-full overflow-hidden transition-all hover:bg-black/10 dark:hover:bg-white/20 hover:scale-105">
            <span className="relative z-10 group-hover:text-white transition-colors">View all locations</span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 dark:group-hover:opacity-20 transition-opacity"></span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 auto-rows-[280px]">
          {bentoHubs.map((hub: any, i: number) => {
            // Create bento span patterns based on index
            const isLarge = i === 0 || i === 3;
            const colSpan = isLarge ? "col-span-1 md:col-span-2 lg:col-span-3" : "col-span-1 md:col-span-2 lg:col-span-3";
            const rowSpan = isLarge ? "row-span-2" : "row-span-1 lg:col-span-3"; // Adjust appropriately

            // Let's refine the bento pattern to look awesome
            const styleClass = 
              i === 0 ? "md:col-span-4 lg:col-span-4 row-span-2" : 
              i === 1 ? "md:col-span-2 lg:col-span-2 row-span-1" :
              i === 2 ? "md:col-span-2 lg:col-span-2 row-span-1" :
              i === 3 ? "md:col-span-2 lg:col-span-2 row-span-1" :
              i === 4 ? "md:col-span-2 lg:col-span-2 row-span-1" :
              "md:col-span-2 lg:col-span-2 row-span-1";

            return (
              <motion.div
                key={hub.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 0.99 }}
                className={`group relative rounded-3xl overflow-hidden bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-md transition-all hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] dark:hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] hover:border-black/10 dark:hover:border-white/20 ${styleClass}`}
              >
                <div className="absolute inset-0 z-0">
                  {/* Overlay gradient for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent dark:from-black/80 dark:via-black/40 dark:to-black/10 z-10 transition-opacity group-hover:opacity-100 dark:group-hover:opacity-90" />
                  <img
                    src={hub.imageUrl}
                    alt={hub.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                <div className="relative z-20 h-full flex flex-col justify-end p-6 md:p-8">
                  {hub.verificationStatus === "Verified" && (
                    <div className="absolute top-6 right-6 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full backdrop-blur-md">
                      <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Verified
                      </span>
                    </div>
                  )}
                  
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 line-clamp-1">{hub.name}</h3>
                    
                    <div className="flex flex-wrap items-center gap-4 text-gray-200 dark:text-gray-300 text-sm mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <span>{hub.governorate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span>{hub.operatingHours}</span>
                      </div>
                    </div>

                    <p className="text-gray-200 dark:text-gray-400 text-sm md:text-base line-clamp-2 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      {hub.description}
                    </p>

                    <a href={`/hubs/${hub.slug}`} className="inline-flex items-center text-sm font-semibold text-white group/btn">
                      Explore Space 
                      <span className="ml-2 transform group-hover/btn:translate-x-1 transition-transform">&rarr;</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
