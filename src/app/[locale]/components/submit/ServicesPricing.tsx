"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getAllServices } from "@/src/actions/hubs";
import { useTranslations, useLocale } from "next-intl";

const ServicesPricing = () => {
  const [globalServices, setGlobalServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOther, setShowOther] = useState(false);
  const t = useTranslations("NewHub");
  const locale = useLocale();

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t("contactNumber")}</label>
          <input
            name="contact"
            type="tel"
            dir="ltr"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-left"
            placeholder={t("contactPlaceholder")}
          />
        </div>
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
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("hourlyPricePlaceholder")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t("facebookUrl")}</label>
          <input
            name="facebook_url"
            type="url"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-left"
            placeholder={t("urlPlaceholder")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t("twitterUrl")}</label>
          <input
            name="twitter_url"
            type="url"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-left"
            placeholder={t("urlPlaceholder")}
          />
        </div>
      </div>

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
                <input name="service_ids" value={service.id} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm font-medium">{typeof service.name === 'string' ? service.name : (service.name?.[locale] || service.name?.en || service.name)}</span>
              </label>
            ))}
            
            <label className="flex items-center space-x-2 rtl:space-x-reverse border border-border p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input 
                type="checkbox" 
                checked={showOther}
                onChange={(e) => setShowOther(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
              />
              <span className="text-sm font-medium">{t("other")}</span>
            </label>
          </div>
        )}

        {showOther && (
          <div className="mt-4 p-4 border border-input rounded-xl bg-muted/20 space-y-4 animate-in fade-in slide-in-from-top-2">
            <h4 className="text-sm font-semibold mb-2">{t("createCustomService")}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("customServiceNameEn")}</label>
                <input 
                  name="custom_service_en"
                  required={showOther}
                  className="w-full px-4 py-2 border rounded-lg bg-background" 
                  placeholder={t("customNamePlaceholderEn")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-right">{t("customServiceNameAr")}</label>
                <input 
                  name="custom_service_ar"
                  dir="rtl" 
                  className="w-full px-4 py-2 border rounded-lg bg-background" 
                  placeholder={t("customNamePlaceholderAr")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("customServiceDescEn")}</label>
                <textarea 
                  name="custom_service_description_en"
                  className="w-full px-4 py-2 border rounded-lg bg-background resize-none" 
                  placeholder="..." 
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-right">{t("customServiceDescAr")}</label>
                <textarea 
                  name="custom_service_description_ar"
                  dir="rtl" 
                  className="w-full px-4 py-2 border rounded-lg bg-background resize-none" 
                  placeholder="..." 
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesPricing;