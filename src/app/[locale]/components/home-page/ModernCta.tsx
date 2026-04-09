"use client";

import { motion } from "framer-motion";

export default function ModernCta() {
  return (
    <section className="relative py-32 overflow-hidden bg-white dark:bg-[#0A0A0B] transition-colors duration-300">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-gradient-to-r from-blue-600/30 to-purple-600/30 blur-[100px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2.5rem] bg-gray-50/80 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-xl p-10 md:p-20 overflow-hidden text-center shadow-2xl">
          {/* subtle noise texture for the box */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-10 mix-blend-overlay border-radius-[inherit]"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 transition-colors">
              Ready to find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500">perfect space?</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto transition-colors">
              Join thousands of users discovering the best workspaces, cafes, and creative hubs in Gaza. Add your own hub to reach more people.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/sign-up" className="px-8 py-4 w-full sm:w-auto rounded-full bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-lg transition-transform hover:scale-105 active:scale-95 shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-gray-800 dark:hover:bg-gray-100">
                Get Started for Free
              </a>
              <a href="/dashboard/hubs/new" className="px-8 py-4 w-full sm:w-auto rounded-full bg-transparent border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white font-semibold text-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                List Your Hub
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
