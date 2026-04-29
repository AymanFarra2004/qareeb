'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Upload, X, Star, Crown, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useDropzone } from 'react-dropzone'
import { useTranslations } from 'next-intl'
import imageCompression from 'browser-image-compression'

interface FileWithPreview extends File {
  preview: string;
}

const UploadPhoto = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [mainIndex, setMainIndex] = useState<number>(0);
  const [rejectedNames, setRejectedNames] = useState<string[]>([]);
  const [isTooMany, setIsTooMany] = useState(false);
  const MAX_IMAGES = 10;
  const t = useTranslations("NewHub");

  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Revoke object URLs on cleanup
  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  // Sync hidden file inputs whenever files or mainIndex changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Main image input
    if (mainInputRef.current && files.length > 0) {
      const dt = new DataTransfer();
      dt.items.add(files[mainIndex]);
      mainInputRef.current.files = dt.files;
    } else if (mainInputRef.current) {
      mainInputRef.current.files = new DataTransfer().files;
    }

    // Gallery images input (all except main)
    if (galleryInputRef.current) {
      const dt = new DataTransfer();
      files.forEach((file, idx) => {
        if (idx !== mainIndex) dt.items.add(file);
      });
      galleryInputRef.current.files = dt.files;
    }
  }, [files, mainIndex]);

  const processFiles = useCallback(async (newFiles: File[]) => {
    const acceptedBatch: FileWithPreview[] = [];
    const rejectedBatch: string[] = [];

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    const compressedResults = await Promise.all(
      newFiles.map(async (file) => {
        try {
          const compressedBlob = await imageCompression(file, options);
          const compressedFile = new File([compressedBlob], file.name, {
            type: compressedBlob.type,
            lastModified: Date.now(),
          });
          Object.assign(compressedFile, { preview: URL.createObjectURL(compressedFile) });
          return { success: true, file: compressedFile as FileWithPreview };
        } catch (error) {
          console.error("Error compressing file:", error);
          return { success: false, name: file.name };
        }
      })
    );

    compressedResults.forEach((result) => {
      if (result.success && result.file) {
        acceptedBatch.push(result.file);
      } else if (!result.success && result.name) {
        rejectedBatch.push(result.name);
      }
    });

    setRejectedNames(rejectedBatch);
    setIsTooMany(false);

    setFiles((prev) => {
      const totalPotential = prev.length + acceptedBatch.length;
      if (totalPotential > MAX_IMAGES) {
        setIsTooMany(true);
        const allowCount = MAX_IMAGES - prev.length;
        return [...prev, ...acceptedBatch.slice(0, Math.max(0, allowCount))];
      }
      return [...prev, ...acceptedBatch];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: processFiles,
    accept: { 'image/*': [] },
    multiple: true
  });

  const handleRemovePhoto = useCallback((index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
    setMainIndex((prev) => {
      if (index === prev) return 0;
      if (index < prev) return prev - 1;
      return prev;
    });
  }, []);

  const handleSetMain = useCallback((index: number) => {
    setMainIndex(index);
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h2 className="text-xl font-semibold">{t("photos")}</h2>
        {files.length > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="text-amber-500 font-medium">★ {t("mainLegend")}</span> {t("mainImageNote")}
          </p>
        )}
      </div>

      {/* Hidden file inputs for form submission */}
      <input
        ref={mainInputRef}
        type="file"
        name="main_image"
        accept="image/*"
        className="hidden"
        readOnly
      />
      <input
        ref={galleryInputRef}
        type="file"
        name="gallery[]"
        accept="image/*"
        multiple
        className="hidden"
        readOnly
      />

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:bg-muted/50 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className={`p-3 rounded-full ${isDragActive ? 'bg-primary/10' : 'bg-muted'}`}>
            <Upload className={`h-6 w-6 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <p className="text-sm font-medium text-foreground">
            {isDragActive ? t("dropzoneActive") : t("dropzoneInactive")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("dropzoneNote")} • <span className="text-primary font-semibold">{t("maxImagesNote", { count: MAX_IMAGES })}</span>
          </p>
        </div>
      </div>

      {/* Preview Gallery */}
      {files.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t("imagesSelected", { count: files.length })}
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {files.map((file, index) => {
              const isMain = index === mainIndex;
              return (
                <div
                  key={index}
                  className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    isMain
                      ? 'border-amber-400 shadow-md shadow-amber-100'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  {/* Image Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
                    <Image
                      src={file.preview}
                      fill
                      alt={file.name}
                      className="object-cover"
                    />

                    {/* Main badge overlay */}
                    {isMain && (
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                        <Crown className="h-2.5 w-2.5" />
                        {t("mainLegend").toUpperCase()}
                      </div>
                    )}

                    {/* Hover overlay with actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!isMain && (
                        <button
                          type="button"
                          onClick={() => handleSetMain(index)}
                          title="Set as main image"
                          className="flex items-center gap-1 bg-amber-400 hover:bg-amber-500 text-amber-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm transition-colors"
                        >
                          <Star className="h-3 w-3" />
                          {t("setMain")}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        title="Remove"
                        className="flex items-center justify-center w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-sm transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* File info */}
                  <div className={`px-2 py-1.5 ${isMain ? 'bg-amber-50 dark:bg-amber-950/20' : 'bg-background'}`}>
                    <p className="text-[10px] font-medium truncate text-foreground">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                      {isMain && <span className="mx-1 text-amber-600 font-semibold">· {t("mainLegend")}</span>}
                      {!isMain && <span className="mx-1 text-muted-foreground">· {t("galleryLegend")}</span>}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Add more button */}
            <div
              {...getRootProps()}
              className="relative aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
            >
              <input {...getInputProps()} />
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground font-medium">{t("addMore")}</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <Crown className="h-3 w-3 text-amber-500" />
              <strong className="text-amber-600">{t("mainLegend")}</strong> — {t("mainLegendDesc")}
            </span>
            <span className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              <strong>{t("galleryLegend")}</strong> — {t("galleryLegendDesc")}
            </span>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {rejectedNames.length > 0 && (
        <p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
          {t("skippedOverSize", { names: rejectedNames.join(', ') })}
        </p>
      )}

      {isTooMany && (
        <p className="text-xs text-amber-600 font-medium animate-in fade-in slide-in-from-top-1">
          {t("tooManyImages", { count: MAX_IMAGES })}
        </p>
      )}
    </section>
  );
};

export default UploadPhoto;