"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getAllServices } from "@/src/actions/hubs";
import { useTranslations, useLocale } from "next-intl";
import { useInputValidation } from "@/src/hooks/useInputValidation";

interface ServicesPricingProps {
  formData: any;
  updateField: (name: string, value: any) => void;
}

const ServicesPricing = ({ formData, updateField }: ServicesPricingProps) => {
  const [globalServices, setGlobalServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("NewHub");
  const locale = useLocale();

  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateField(e.target.name, e.target.value);
  }, [updateField]);

  const handleCheckboxChange = React.useCallback((id: string) => {
    const currentIds = formData.service_ids || [];
    const newIds = currentIds.includes(id)
      ? currentIds.filter((i: string) => i !== id)
      : [...currentIds, id];
    updateField("service_ids", newIds);
  }, [formData.service_ids, updateField]);

  // Per-field validation for custom service inputs
  const customNameEn = useInputValidation("en");
  const customNameAr = useInputValidation("ar");
  const customDescEn = useInputValidation("en");
  const customDescAr = useInputValidation("ar");

  useEffect(() => {
    async function fetchServices() {
      const res = await getAllServices(locale);
      if (res.success) {
        setGlobalServices(res.data);
      }
      setLoading(false);
    }
    fetchServices();
  }, [locale]);

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold border-b border-border pb-2">{t("servicesPricing")}</h2>
    
    {/* contactNumber and pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/** contactNumber */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t("contactNumber")}</label>
          <input
            name="contact"
            type="tel"
            dir="ltr"
            required
            value={formData.contact}
            onChange={handleInputChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-left"
            placeholder={t("contactPlaceholder")}
          />
        </div>

        {/* pricing */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            {t("hourlyPrice")} <span className="text-muted-foreground font-normal">{t("hourlyPriceNote")}</span>
          </label>
          <input
            name="hourly_price"
            type="number"
            min="0"
            step="0.5"
            required
            value={formData.hourly_price}
            onChange={handleInputChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("hourlyPricePlaceholder")}
          />
        </div>
      </div>

      {/** social media accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t("facebookUrl")}</label>
          <input
            name="facebook_url"
            type="url"
            value={formData.facebook_url}
            onChange={handleInputChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-left"
            placeholder={t("urlPlaceholder")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t("instagramUrl")}</label>
          <input
            name="instagram_url"
            type="url"
            value={formData.instagram_url}
            onChange={handleInputChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-left"
            placeholder={t("urlPlaceholder")}
          />
        </div>
      </div>

      {/** Services */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">{t("availableServices")}</label>
        
        {loading ? (
          <div className="py-8 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {globalServices.map((service) => (
              <label
                key={service.id}
                className="flex items-center space-x-2 rtl:space-x-reverse border border-border p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <input 
                  name="service_ids" 
                  value={service.id} 
                  type="checkbox" 
                  checked={formData.service_ids?.includes(String(service.id))}
                  onChange={() => handleCheckboxChange(String(service.id))}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                />
                <span className="text-sm font-medium">{typeof service.name === 'string' ? service.name : (service.name?.[locale] || service.name?.en || service.name)}</span>
              </label>
            ))}
            
            <label className="flex items-center space-x-2 rtl:space-x-reverse border border-border p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input 
                type="checkbox" 
                checked={formData.showOther}
                onChange={(e) => updateField("showOther", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
              />
              <span className="text-sm font-medium">{t("other")}</span>
            </label>
          </div>
        )}

        {formData.showOther && (
          <div className="mt-4 p-4 border border-input rounded-xl bg-muted/20 space-y-4 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-sm font-semibold mb-2">{t("createCustomService")}</h4>
            
            {/* <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-3 text-xs text-blue-700 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              <p>{t("englishOptionalNotice")}</p>
            </div> */}

            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-right">{t("customServiceNameAr")}</label>
                <input 
                  name="custom_service_ar"
                  required={formData.showOther}
                  dir="rtl"
                  value={formData.custom_service_ar}
                  onChange={handleInputChange}
                  onBlur={customNameAr.onBlur}
                  className="w-full px-4 py-2 border rounded-lg bg-background" 
                  placeholder={t("customNamePlaceholderAr")}
                />
                {customNameAr.error && (
                  <p className="mt-1 text-xs text-red-500 text-right">{customNameAr.error}</p>
                )}
              </div>
              {/* <div>
                <label className="block text-sm font-medium mb-1">{t("customServiceNameEn")}</label>
                <input 
                  name="custom_service_en"
                  onBlur={customNameEn.onBlur}
                  className="w-full px-4 py-2 border rounded-lg bg-background" 
                  placeholder={t("customNamePlaceholderEn")}
                />
                {customNameEn.error ? (
                  <p className="mt-1 text-xs text-red-500">{customNameEn.error}</p>
                ) : (
                  <p className="mt-1 text-[10px] text-muted-foreground opacity-70 italic">{t("englishOptionalWarning")}</p>
                )}
              </div> */}
              <div>
                <label className="block text-sm font-medium mb-1 text-right">{t("customServiceDescAr")}</label>
                <textarea 
                  name="custom_service_description_ar"
                  dir="rtl"
                  value={formData.custom_service_description_ar}
                  onChange={handleInputChange}
                  onBlur={customDescAr.onBlur}
                  className="w-full px-4 py-2 border rounded-lg bg-background resize-none" 
                  placeholder="..." 
                  rows={2}
                />
                {customDescAr.error && (
                  <p className="mt-1 text-xs text-red-500 text-right">{customDescAr.error}</p>
                )}
              </div>
              {/* <div>
                <label className="block text-sm font-medium mb-1">{t("customServiceDescEn")}</label>
                <textarea 
                  name="custom_service_description_en"
                  onBlur={customDescEn.onBlur}
                  className="w-full px-4 py-2 border rounded-lg bg-background resize-none" 
                  rows={2}
                  placeholder={t("descriptionPlaceholderEn")}
                />
                {customDescEn.error ? (
                  <p className="mt-1 text-xs text-red-500">{customDescEn.error}</p>
                ) : (
                  <p className="mt-1 text-[10px] text-muted-foreground opacity-70 italic">{t("englishOptionalWarning")}</p>
                )}
              </div> */}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesPricing;