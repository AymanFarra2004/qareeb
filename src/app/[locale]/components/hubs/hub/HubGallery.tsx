"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import Image from "next/image";

export default function HubGallery({ hubName, galleryUrls }: { hubName: string, galleryUrls: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [scale, setScale] = useState(1);

  // Reset scale on image change
  useEffect(() => {
    setScale(1);
  }, [selectedIndex]);

  // Lock scrolling when lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setScale(1);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  const handleWheel = (e: React.WheelEvent) => {
    if (selectedIndex === null) return;
    // zoom logic relying on deltaY
    setScale((prev) => Math.min(Math.max(0.5, prev + e.deltaY * -0.002), 5));
  };

  // Keyboard navigation for the lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedIndex === null) return;
    
    if (e.key === "Escape") {
      setSelectedIndex(null);
    } else if (e.key === "ArrowRight") {
      setSelectedIndex((prev) => (prev! < galleryUrls.length - 1 ? prev! + 1 : 0));
    } else if (e.key === "ArrowLeft") {
      setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : galleryUrls.length - 1));
    }
  }, [selectedIndex, galleryUrls.length]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!galleryUrls || galleryUrls.length === 0) return null;

  return (
    <>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Gallery</h2>
        {/* Premium Bento Grid for Image Previews */}
        <div className={`grid gap-5 ${galleryUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {galleryUrls.map((url, idx) => {
             const isFeatured = idx === 0 && galleryUrls.length >= 3;
             return (
              <div 
                key={idx} 
                onClick={() => setSelectedIndex(idx)}
                className={`relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 ease-out border border-border group cursor-pointer ${
                  isFeatured ? 'md:col-span-2 aspect-video' : 'aspect-[4/3] bg-muted'
                }`}
              >
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center backdrop-blur-[2px] duration-500">
                  <div className="bg-background/80 p-3 rounded-full text-foreground shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                     <Maximize2 className="h-5 w-5" />
                  </div>
                </div>
                <img 
                  src={url} 
                  alt={`${hubName} gallery ${idx + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Lightbox / Fullscreen Modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
          
          {/* Top Controls */}
          <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
             <span className="text-white/80 font-medium text-sm drop-shadow-md">
               {selectedIndex + 1} / {galleryUrls.length}
             </span>
             <button 
                onClick={() => setSelectedIndex(null)}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                title="Close (Esc)"
             >
                <X className="h-6 w-6" />
             </button>
          </div>

          {/* Left Arrow */}
          <button 
             onClick={(e) => {
               e.stopPropagation();
               setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : galleryUrls.length - 1));
             }}
             className="absolute left-4 md:left-10 z-50 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 p-3 md:p-4 rounded-full transition-all hover:scale-110 hidden sm:block"
             title="Previous (Arrow Left)"
          >
             <ChevronLeft className="h-8 w-8" />
          </button>

          {/* Main Image Canvas */}
          <div 
            className="w-full h-full p-2 md:p-8 flex items-center justify-center overflow-hidden"
            onClick={() => setSelectedIndex(null)} // Click outside to close
            onWheel={handleWheel}
          >
            <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
               <img 
                 src={galleryUrls[selectedIndex]}
                 alt={`${hubName} fullscreen image ${selectedIndex + 1}`}
                 style={{ transform: `scale(${scale})` }}
                 className="max-w-full max-h-full object-contain rounded-lg shadow-2xl drop-shadow-2xl transition-transform ease-out"
               />
               
               {/* Controls Hint */}
               {scale === 1 && (
                 <div className="absolute bottom-4 bg-black/50 text-white/70 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur pointer-events-none animate-pulse">
                   Scroll to Zoom
                 </div>
               )}
            </div>
          </div>

          {/* Right Arrow */}
          <button 
             onClick={(e) => {
               e.stopPropagation();
               setSelectedIndex((prev) => (prev! < galleryUrls.length - 1 ? prev! + 1 : 0));
             }}
             className="absolute right-4 md:right-10 z-50 text-white/50 hover:text-white bg-black/50 hover:bg-black/80 p-3 md:p-4 rounded-full transition-all hover:scale-110 hidden sm:block"
             title="Next (Arrow Right)"
          >
             <ChevronRight className="h-8 w-8" />
          </button>
          
          {/* Mobile Overlay Navigation (Tap edges) */}
          <div className="absolute inset-y-0 left-0 w-1/3 z-40 sm:hidden" onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : galleryUrls.length - 1)); }} />
          <div className="absolute inset-y-0 right-0 w-1/3 z-40 sm:hidden" onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev! < galleryUrls.length - 1 ? prev! + 1 : 0)); }} />

        </div>
      )}
    </>
  );
}
