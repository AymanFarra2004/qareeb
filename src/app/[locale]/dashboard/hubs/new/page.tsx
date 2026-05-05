"use client";

import { MapPin, Info, Loader2 } from "lucide-react";
import BasicInfo from "@/components/submit/BasicInfo";
import ServicesPricing from "@/components/submit/ServicesPricing";
import OfferInfo from "@/components/submit/OfferInfo";
import UploadPhoto from "@/components/submit/UploadPhoto";
import { useState } from "react";
import { useRouter } from "@/src/i18n/routing";
import { createHub } from "@/src/actions/hubs";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";
import { uploadWithProgress } from "@/src/lib/uploadHelper";
import { motion } from "framer-motion";
import { useFormPersistence } from "@/src/hooks/useFormPersistence";
import LoadingScreen from "@/components/LoadingScreen";

const STORAGE_KEY = "qareeb_new_hub_form";

const INITIAL_DATA = {
  name_ar: "",
  location_id: "",
  address_ar: "",
  description_ar: "",
  start_time: "",
  end_time: "",
  contact: "",
  hourly_price: "",
  facebook_url: "",
  instagram_url: "",
  service_ids: [] as string[],
  showOther: false,
  custom_service_ar: "",
  custom_service_description_ar: "",
  // Initial Offers
  offers: [
    {
      title_ar: "",
      description_ar: "",
      type: "monthly",
      price: "",
      duration: "",
    }
  ],
};

export default function SubmitHub() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();
  const t = useTranslations("NewHub");

  const { formData, updateField, clearPersistence, isLoaded } = useFormPersistence(
    STORAGE_KEY,
    INITIAL_DATA
  );

  if (!isLoaded) return <LoadingScreen />;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Extract image files to bypass Next.js Server Action payload limit & tracking
    const mainImage = formData.get("main_image");
    const galleryFiles = formData.getAll("gallery[]");
    
    const hasMainImage = mainImage instanceof File && mainImage.size > 0;
    const hasGallery = galleryFiles.some(f => f instanceof File && (f as File).size > 0);
    
    if (hasMainImage || hasGallery) {
       // Disable default upload stream over action
       formData.delete("main_image");
       formData.delete("gallery[]");
    }

    try {
      // 1. Create Hub with JSON
      const result = await createHub(null, formData);
      
      if (!result?.success || !result.hub?.slug) {
        console.error("Hub Creation failed:", result);
        toast.error(result?.error ?? t("creationError"));
        setError(result?.error ?? t("creationError"));
        setIsLoading(false);
        return;
      }

      const hubSlug = result.hub.slug;

      // 2. Upload Images to API route with progress
      if (hasMainImage || hasGallery) {
        setIsUploading(true);
        setUploadProgress(0);

        const imageForm = new FormData();
        if (hasMainImage) imageForm.append("main_image", mainImage);
        galleryFiles.forEach(f => {
          if (f instanceof File && f.size > 0) imageForm.append("gallery[]", f);
        });

        try {
          await uploadWithProgress(`/api/hubs/${hubSlug}/images`, imageForm, (progress) => {
            setUploadProgress(progress);
          });
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          toast.error(t("uploadError"));
        } finally {
          setIsUploading(false);
        }
      }

      toast.success(t("successMessage"));
      clearPersistence();
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (e) {
      console.error("Network error during submission:", e);
      toast.error(t("networkError"));
      setError(t("networkError"));
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const isButtonDisabled = isLoading || isUploading;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-10 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
          <MapPin className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">{t("title")}</h1>
        <p className="text-muted-foreground text-lg">
          {t("description")}
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-8 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-8">

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <BasicInfo formData={formData} updateField={updateField} />

          {/* Services & Pricing & Contact */}
          <ServicesPricing formData={formData} updateField={updateField} />

          {/* Initial Offer */}
          <OfferInfo formData={formData} updateField={updateField} />

          {/* Photos */}
          <UploadPhoto />

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3 text-sm text-muted-foreground">
            <Info className="h-5 w-5 text-primary flex-shrink-0" />
            <p>
              {t("disclaimer")}
            </p>
          </div>

          {/* Progress Bar (Framer Motion) */}
          {isUploading && (
            <div className="space-y-2 mt-6">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">{t("uploading") || "Uploading images..."}</span>
                <span className="text-primary">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ ease: "linear", duration: 0.1 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border flex justify-end gap-3 mt-8">
            <a
              href="/dashboard"
              className="cursor-pointer px-6 py-2 rounded-md border border-input text-foreground font-medium hover:bg-muted transition-colors text-center"
            >
              {t("cancel")}
            </a>
            <button
              type="submit"
              disabled={isButtonDisabled}
              className={`cursor-pointer px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm flex gap-2 items-center ${isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isButtonDisabled && <Loader2 className="h-4 w-4 animate-spin" />}
              {isUploading ? (t("pleaseWait") || "Uploading...") : t("submit")}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

