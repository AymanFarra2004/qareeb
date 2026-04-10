"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Upload, Star, Crown, Image as ImageIcon, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { updateHub, downloadImageServer } from "@/src/actions/hubs";
import { toast } from "react-hot-toast";

interface FileWithPreview extends File {
  preview: string;
}

interface OldPhoto {
  url: string;
  isMain: boolean;
}

export default function HubGalleryManager({ hub, isOpen, onClose, onUpdate }: { hub: any, isOpen: boolean, onClose: () => void, onUpdate: () => void }) {
  // Existing API photos
  const [oldPhotos, setOldPhotos] = useState<OldPhoto[]>([]);
  // Newly dropped files
  const [newFiles, setNewFiles] = useState<FileWithPreview[]>([]);
  
  // Track which is main. For old photos, it stores the URL. For new photos, it stores the File's preview string.
  const [mainPhotoId, setMainPhotoId] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize from hub data
  useEffect(() => {
    if (isOpen) {
      const mainImg = hub.images?.main || hub.main_image;
      const gallery = hub.images?.gallery || [];
      
      const parsedOld: OldPhoto[] = [];
      const resolveUrl = (url: string) => url.startsWith('http') ? url : `https://karam.idreis.net${url.startsWith('/') ? '' : '/'}${url}`;

      let mainResolvedStr = null;

      if (mainImg) {
        mainResolvedStr = resolveUrl(mainImg);
        parsedOld.push({ url: mainResolvedStr, isMain: true });
        setMainPhotoId(mainResolvedStr);
      }
      
      if (Array.isArray(gallery)) {
        gallery.forEach((g: string) => {
          const resolved = resolveUrl(g);
          // prevent duplicate if main is miraculously inside gallery
          if (resolved !== mainResolvedStr) {
            parsedOld.push({ url: resolved, isMain: false });
          }
        });
      }

      setOldPhotos(parsedOld);
      setNewFiles([]);
    }
  }, [hub, isOpen]);

  // Clean up previews
  useEffect(() => {
    return () => newFiles.forEach(f => URL.revokeObjectURL(f.preview));
  }, [newFiles]);

  const processFiles = useCallback((acceptedFiles: File[]) => {
    const maxSize = 5 * 1024 * 1024;
    const batch: FileWithPreview[] = [];
    
    acceptedFiles.forEach(file => {
      if (file.size <= maxSize) {
        Object.assign(file, { preview: URL.createObjectURL(file) });
        batch.push(file as FileWithPreview);
      } else {
        toast.error(`${file.name} is larger than 5MB`);
      }
    });

    if (batch.length > 0) {
      setNewFiles(prev => {
        const next = [...prev, ...batch];
        // If we don't have a main photo at all (empty), set the first new one as main
        if (!mainPhotoId && next.length > 0) {
          setMainPhotoId(next[0].preview);
        }
        return next;
      });
    }
  }, [mainPhotoId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: processFiles,
    accept: { 'image/*': [] },
    multiple: true
  });

  const handleRemoveNew = (index: number) => {
    setNewFiles(prev => {
      const newFilesArr = [...prev];
      const removed = newFilesArr.splice(index, 1)[0];
      URL.revokeObjectURL(removed.preview);
      
      // If we removed the main photo, reset main tracking safely
      if (mainPhotoId === removed.preview) {
        setMainPhotoId(oldPhotos.length > 0 ? oldPhotos[0].url : (newFilesArr.length > 0 ? newFilesArr[0].preview : null));
      }
      return newFilesArr;
    });
  };

  const handleSetMain = (id: string) => {
    setMainPhotoId(id);
  };

  // Safe fetch utility to download an old image securely to submit it backward to the server as a File, 
  // ensuring the API accepts it exactly like a newly dropped File
  const fetchUrlAsFile = async (url: string): Promise<File> => {
    try {
      // First try standard fetch (works if same origin or if backend enables CORS)
      const res = await fetch(url);
      if (!res.ok) throw new Error("CORS or Network issue");
      const blob = await res.blob();
      
      let ext = "jpg";
      if (blob.type === "image/png") ext = "png";
      if (blob.type === "image/webp") ext = "webp";
      
      return new File([blob], `main_image.${ext}`, { type: blob.type });
    } catch (e) {
      // Fallback: Use Server Proxy to bypass strict browser CORS issues!
      const proxied = await downloadImageServer(url);
      
      if (proxied.success && proxied.base64) {
        // Convert Base64 back to Blob securely
        const byteCharacters = atob(proxied.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: proxied.type });
        
        let ext = "jpg";
        if (proxied.type === "image/png") ext = "png";
        if (proxied.type === "image/webp") ext = "webp";
        
        return new File([blob], `main_image.${ext}`, { type: proxied.type });
      }
      
      throw new Error("Failed to download image from the server");
    }
  };

  const handleSubmit = async () => {
    if (!mainPhotoId) {
      toast.error("Please select a main image!");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // 1. Resolve true main_image File
      let finalMainFile: File | null = null;
      
      // Check if mainPhotoId belongs to new Files
      const matchedNew = newFiles.find(f => f.preview === mainPhotoId);
      if (matchedNew) {
         finalMainFile = matchedNew;
      } else {
         // It belongs to old photos, so we have to dynamically grab it
         finalMainFile = await fetchUrlAsFile(mainPhotoId);
      }

      if (finalMainFile) {
         formData.append("main_image", finalMainFile);
      }

      // 2. Resolve gallery additions 
      // Note: We only append NEW files that are NOT the main image. Old gallery items are preserved inherently.
      newFiles.forEach((file) => {
         if (file.preview !== mainPhotoId) {
            formData.append("gallery[]", file);
         }
      });

      // Submit
      const res = await updateHub(hub.slug, null, formData);
      if (res.success) {
        toast.success("Gallery updated successfully!");
        onUpdate();
        onClose();
      } else {
        toast.error(res.error || "Failed to update gallery");
      }

    } catch(err) {
      console.error(err);
      toast.error("An error occurred during upload.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-background rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-white/10 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <ImageIcon className="h-5 w-5 text-primary" />
              Manage Hub Gallery
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Upload new images and set your primary cover photo.</p>
          </div>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="p-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-full transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <Upload className="h-8 w-8" />
              </div>
              <div>
                <p className="text-base font-medium text-foreground">
                  {isDragActive ? 'Drop images to add to gallery...' : 'Click or drag images to upload'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Max 5MB per file (PNG, JPG, WEBP)</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Hub Photos</h3>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                   {oldPhotos.length + newFiles.length} Total
                </span>
             </div>

             {/* Grid */}
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
               {/* ─── OLD PHOTOS ─── */}
               {oldPhotos.map((photo, idx) => {
                 const isMain = mainPhotoId === photo.url;
                 return (
                   <div 
                     key={`old-${idx}`} 
                     className={`relative group aspect-square rounded-2xl overflow-hidden transition-all duration-300 border-2 ${
                       isMain ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'border-black/5 dark:border-white/5 hover:border-primary/30'
                     }`}
                   >
                     <img src={photo.url} alt="Old gallery" className="w-full h-full object-cover bg-muted/20" />
                     
                     {/* Overlay Indicators */}
                     {isMain && (
                       <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-400 text-amber-950 text-xs font-bold px-2 py-1 rounded-full shadow-md z-10 animate-in slide-in-from-top-2">
                         <Crown className="h-3 w-3" /> MAIN
                       </div>
                     )}
                     <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur text-white text-[10px] font-medium px-2 py-1 rounded shadow-md z-10 pointer-events-none">
                       Uploaded
                     </div>

                     {/* Hover Actions */}
                     <div className={`absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center gap-2 ${isMain ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                       {!isMain && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); handleSetMain(photo.url); }}
                           className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-xl transition-transform hover:scale-105"
                         >
                           <Star className="h-3.5 w-3.5" /> Set Main
                         </button>
                       )}
                     </div>
                   </div>
                 );
               })}

               {/* ─── NEW PHOTOS ─── */}
               {newFiles.map((file, idx) => {
                 const isMain = mainPhotoId === file.preview;
                 return (
                   <div 
                     key={`new-${idx}`} 
                     className={`relative group aspect-square rounded-2xl overflow-hidden transition-all duration-300 border-2 ${
                       isMain ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'border-primary/50'
                     }`}
                   >
                     <Image src={file.preview} alt="New upload" fill className="object-cover bg-muted/20" />
                     
                     {/* Overlay Indicators */}
                     {isMain && (
                       <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-400 text-amber-950 text-xs font-bold px-2 py-1 rounded-full shadow-md z-10 animate-in slide-in-from-top-2">
                         <Crown className="h-3 w-3" /> MAIN
                       </div>
                     )}
                     <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-blue-500/80 backdrop-blur text-white text-[10px] font-medium px-2 py-1 rounded shadow-md z-10 pointer-events-none">
                       New
                     </div>

                     {/* Hover Actions */}
                     <div className={`absolute inset-0 bg-black/50 transition-opacity flex flex-col items-center justify-center gap-2 ${isMain ? 'opacity-0 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                       {!isMain && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); handleSetMain(file.preview); }}
                           className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-xl transition-transform hover:scale-105"
                         >
                           <Star className="h-3.5 w-3.5" /> Set Main
                         </button>
                       )}
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleRemoveNew(idx); }}
                         className="flex items-center justify-center w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-xl transition-transform hover:scale-105"
                         title="Remove new file"
                       >
                         <X className="h-4 w-4" />
                       </button>
                     </div>
                   </div>
                 );
               })}
             </div>
             
             {(oldPhotos.length === 0 && newFiles.length === 0) && (
               <div className="py-12 flex flex-col items-center justify-center text-center bg-muted/10 border border-dashed border-border rounded-xl">
                 <ImageIcon className="h-12 w-12 text-muted-foreground opacity-30 mb-3" />
                 <p className="font-medium text-muted-foreground">No images found. Drop some above!</p>
               </div>
             )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/10 flex items-center justify-end gap-3 rounded-b-3xl">
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 font-medium text-muted-foreground hover:bg-muted rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || (!newFiles.length && mainPhotoId === (oldPhotos.find(p=>p.isMain)?.url))}
            className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving Gallery..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
