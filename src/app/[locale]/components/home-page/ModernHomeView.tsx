"use client";

import ModernHero from "./ModernHero";
import HeebatRibbon from "./HeebatRibbon";
import HubsBentoGrid from "./HubsBentoGrid";
import ModernCta from "./ModernCta";
import { motion } from "framer-motion";

type ModernHomeViewProps = {
  initialHubs?: any[];
  bentoHubs?: any[];
};

export default function ModernHomeView({ initialHubs = [], bentoHubs = [] }: ModernHomeViewProps) {
  return (
    <div className="bg-gray-50 dark:bg-[#050505] text-foreground min-h-screen pt-12">
      <ModernHero hubs={initialHubs} />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
      >
        <HeebatRibbon hubs={initialHubs} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
      >
        <HubsBentoGrid hubs={bentoHubs} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
      >
        <ModernCta />
      </motion.div>
    </div>
  );
}
