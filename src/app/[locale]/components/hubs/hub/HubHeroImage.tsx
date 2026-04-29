"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, MapPin, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { IHub } from '@/data/hubs';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

function resolveImageSrc(imageUrl: any): string | undefined {
  if (!imageUrl) return undefined;
  if (typeof imageUrl === 'string') return imageUrl;
  if (typeof imageUrl === 'object' && imageUrl.src) return imageUrl.src;
  return undefined;
}

export default function HubHeroImage({ hub }: { hub: IHub }) {
  const mainImage = resolveImageSrc(hub.imageUrl);
  const galleryImages = hub.galleryUrls || [];
  const t = useTranslations("HubsGrid");
  
  // Combine all images
  const allImages = [mainImage, ...galleryImages].filter(Boolean) as string[];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    hiddenRight: { x: '100%', opacity: 0 },
    hiddenLeft: { x: '-100%', opacity: 0 },
    visible: { x: '0', opacity: 1, transition: { duration: 0.5 } },
    exitRight: { x: '-100%', opacity: 0, transition: { duration: 0.5 } },
    exitLeft: { x: '100%', opacity: 0, transition: { duration: 0.5 } },
  };

  const handleNext = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 === -1 ? allImages.length - 1 : prevIndex - 1));
  };

  const handlePrev = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1 === allImages.length ? 0 : prevIndex + 1));
  };

  if (allImages.length === 0) {
    return (
      <div className="w-full h-[60vh] md:h-[80vh] bg-muted flex items-center justify-center">
        <ImageOff className="h-12 w-12 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] bg-black overflow-hidden flex justify-center items-center">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial={direction > 0 ? "hiddenRight" : "hiddenLeft"}
          animate="visible"
          exit={direction > 0 ? "exitRight" : "exitLeft"}
          className="absolute inset-0 flex justify-center items-center"
        >
          <div className="relative w-full h-full max-w-[1920px] mx-auto">
             <Image
              src={allImages[currentIndex]}
              alt={`${hub.name} - image ${currentIndex + 1}`}
              fill
              className="object-cover"
              priority={currentIndex === 0}
              unoptimized={allImages[currentIndex].startsWith('http')}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      {allImages.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-1000 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white transition-colors backdrop-blur-sm"
          >
            <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-1000 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white transition-colors backdrop-blur-sm"
          >
            <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
          </button>
          
          <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-1000 flex gap-2">
             {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                     setDirection(idx > currentIndex ? 1 : -1);
                     setCurrentIndex(idx);
                  }}
                  className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
                />
             ))}
          </div>
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pb-6 md:pb-10 text-white z-10 flex flex-col justify-end pointer-events-none">
        <div className="flex flex-col gap-2 md:gap-4 max-w-3xl pointer-events-auto">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            {hub.verificationStatus === "Verified" && (
              <Badge className="bg-emerald-500/90 text-white border-0 shadow-sm flex items-center gap-1.5 py-1 px-3 text-sm">
                <ShieldCheck className="h-4 w-4" />
                {t("verifiedPartner")}
              </Badge>
            )}
            {hub.governorate && (
              <Badge variant="outline" className="text-white border-white/40 bg-black/40 backdrop-blur-md py-1 px-3 text-sm">
                {hub.governorate}
              </Badge>
            )}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
            {hub.name}
          </h1>

          {hub.location && (
            <div className="flex items-center text-white/90 text-base md:text-lg drop-shadow-md font-medium">
              <MapPin className="h-5 w-5 md:h-6 md:w-6 mr-2 shrink-0 text-primary" />
              {hub.location}
            </div>
          )}

          {hub.description && (
            <div className="text-white/80 text-sm md:text-base leading-relaxed max-w-2xl mt-2 mb-4 drop-shadow-md border-l-2 border-primary/50 pl-4">
              {hub.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}