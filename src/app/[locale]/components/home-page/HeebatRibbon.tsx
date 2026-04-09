"use client";

import { motion } from "framer-motion";
import { Heart, Star, Sparkles, Coffee, Zap } from "lucide-react";

const heebatData = [
  { id: 1, text: "Ali sent a Workspace Pass to Omar", icon: <Zap className="w-4 h-4 text-yellow-400" /> },
  { id: 2, text: "Sarah gifted Coffee to Ahmed", icon: <Coffee className="w-4 h-4 text-amber-600" /> },
  { id: 3, text: "Trending: 50% off at TechHub", icon: <Star className="w-4 h-4 text-blue-400" /> },
  { id: 4, text: "Mona sent a Hug to Laila", icon: <Heart className="w-4 h-4 text-red-500" /> },
  { id: 5, text: "New Hub added in Deir al-Balah", icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
  { id: 6, text: "Yousef sponsored Internet for 2 hours", icon: <Zap className="w-4 h-4 text-yellow-400" /> },
];

// Duplicate items for seamless infinite scroll
const duplicatedHeebat = [...heebatData, ...heebatData, ...heebatData];

export default function HeebatRibbon() {
  return (
    <section className="py-10 border-y border-black/5 dark:border-white/5 bg-gray-100/50 dark:bg-[#0A0A0B]/50 backdrop-blur-sm overflow-hidden relative flex">
      {/* Gradient fades for the edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-50 dark:from-[#050505] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-50 dark:from-[#050505] to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-6 items-center px-4"
        animate={{ x: [0, -1035] }} // Adjust duration based on width. Roughly moving 1 set width.
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 20,
        }}
        whileHover={{ animationPlayState: "paused" }}
      >
        {duplicatedHeebat.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full whitespace-nowrap backdrop-blur-md shadow-sm dark:shadow-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
              {item.icon}
            </div>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.text}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
