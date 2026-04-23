"use client";

import { motion } from "framer-motion";
import { 
  Target, 
  Eye, 
  ShieldCheck, 
  Users, 
  Search, 
  MapPin,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/routing";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function AboutView() {
  const t = useTranslations("AboutUs");

  const features = [
    {
      icon: ShieldCheck,
      titleKey: "whyQareeb.reason1.title",
      descKey: "whyQareeb.reason1.desc",
      color: "blue",
    },
    {
      icon: Users,
      titleKey: "whyQareeb.reason2.title",
      descKey: "whyQareeb.reason2.desc",
      color: "purple",
    },
    {
      icon: Search,
      titleKey: "whyQareeb.reason3.title",
      descKey: "whyQareeb.reason3.desc",
      color: "indigo",
    },
  ];

  return (
    <div className="relative overflow-hidden pt-28 pb-20">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-24"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div 
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-6 border border-primary/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("badge")}
          </motion.div>
          
          <motion.h1 
            variants={fadeUp}
            custom={1}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
          >
            {t.rich('heading', {
              br: () => <br />,
              primary: (chunks: any) => (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                  {chunks}
                </span>
              )
            })}
          </motion.h1>

          <motion.p 
            variants={fadeUp}
            custom={2}
            className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed"
          >
            {t("subheading")}
          </motion.p>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative p-8 rounded-3xl bg-card border border-border hover:border-blue-500/30 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-300">
              <Target className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold mb-4">{t("mission.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("mission.description")}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative p-8 rounded-3xl bg-card border border-border hover:border-purple-500/30 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-300">
              <Eye className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/10 flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold mb-4">{t("vision.title")}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("vision.description")}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Why Qareeb Grid */}
        <div className="mb-32 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-16"
          >
            {t("whyQareeb.title")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center p-6"
              >
                <div className={`w-16 h-16 rounded-2xl bg-${feature.color}-600/10 flex items-center justify-center text-${feature.color}-600 mb-6`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t(feature.titleKey)}</h3>
                <p className="text-muted-foreground">
                  {t(feature.descKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative p-12 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-purple-700 text-white overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20">
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[120%] bg-white rounded-full blur-[100px] rotate-45" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold mb-4">
                {t("cta.title")}
              </h2>
              <p className="text-white/80 text-lg">
                {t("cta.subtitle")}
              </p>
            </div>
            <Link 
              href="/hubs"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-blue-600 font-bold hover:bg-white/90 transition-all duration-300 group"
            >
              {t("cta.button")}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
