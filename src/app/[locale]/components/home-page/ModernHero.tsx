"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import HeroQuickSearch from "./HeroQuickSearch";

export default function ModernHero({ setFilter }: { setFilter: any }) {
  const t = useTranslations("Hero");

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white dark:bg-[#0A0A0B] text-foreground transition-colors duration-300">
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            transform: [
              "translate(0%, 0%) scale(1)",
              "translate(5%, 10%) scale(1.05)",
              "translate(-5%, -5%) scale(0.95)",
              "translate(0%, 0%) scale(1)",
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[120px] opacity-60"
        />
        <motion.div
          animate={{
            transform: [
              "translate(0%, 0%) scale(1)",
              "translate(-5%, -10%) scale(1.1)",
              "translate(5%, 5%) scale(0.9)",
              "translate(0%, 0%) scale(1)",
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[120px] opacity-60"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center mt-20 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-gray-900 dark:text-white mb-6 leading-[1.1] transition-colors duration-300">
             {t.rich('title', {
                  br: () => <br className="hidden sm:block" />,
                  primary: (chunks: any) => <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">{chunks}</span>
                })}
          </h1>
          <p className="text-lg md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto font-light transition-colors duration-300">
            {t("description")}
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <a href="#hubs" className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              Explore Hubs
            </a>
            <a href="/dashboard/hubs/new" className="px-8 py-4 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white font-semibold text-lg backdrop-blur-md transition-transform hover:scale-105 active:scale-95 shadow-sm">
              Create a Hub
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="w-full max-w-3xl mx-auto"
          >
            <HeroQuickSearch setFilter={setFilter} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
