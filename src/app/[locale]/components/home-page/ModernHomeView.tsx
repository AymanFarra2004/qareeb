"use client";

import { useState } from "react";
import ModernHero from "./ModernHero";
import HeebatRibbon from "./HeebatRibbon";
import HubsBentoGrid from "./HubsBentoGrid";
import ModernCta from "./ModernCta";
import { motion } from "framer-motion";

export default function ModernHomeView({ initialHubs = [] }: { initialHubs?: any[] }) {
  const [filter, setFilter] = useState<{governorate: string, service: string}>({governorate: "", service: ""});

  return (
    <div className="bg-gray-50 dark:bg-[#050505] text-foreground min-h-screen">
      <ModernHero setFilter={setFilter} />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <HeebatRibbon />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <HubsBentoGrid filter={filter} hubs={initialHubs} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <ModernCta />
      </motion.div>
    </div>
  );
}
