"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function LoadingScreen() {
  const t = useTranslations("Loading");
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSlowMessage(true);
    }, 3000); // Show slow message after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-[#050505] transition-colors duration-500">
      <div className="relative flex flex-col items-center max-w-md w-full px-6">
        {/* Animated Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1.1, 1],
            opacity: 1 
          }}
          transition={{ 
            duration: 0.8,
            ease: "easeOut"
          }}
          className="relative mb-8"
        >
          {/* Outer glow/pulse */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"
          />
          
          <div className="relative w-24 h-24 md:w-32 md:h-32">
            <Image
              src="/qareeb-logo-location.png"
              alt="Qareeb Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </motion.div>

        {/* Text content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-2"
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            {t("description")}
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="mt-10 w-full max-w-xs bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ 
              width: ["0%", "30%", "60%", "90%"],
            }}
            transition={{ 
              duration: 5,
              times: [0, 0.2, 0.5, 1],
              ease: "easeInOut"
            }}
            className="h-full bg-gradient-to-r from-primary to-purple-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          />
        </div>

        {/* Slow Connection Message */}
        <div className="h-12 mt-6">
          <AnimatePresence>
            {showSlowMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 px-4 py-2 rounded-xl"
              >
                <p className="text-amber-700 dark:text-amber-400 text-xs md:text-sm font-medium flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  {t("slowConnection")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 opacity-30 dark:opacity-20">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
