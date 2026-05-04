"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { useInputValidation } from "@/src/hooks/useInputValidation";

interface OfferInfoProps {
  formData: any;
  updateField: (name: string, value: any) => void;
}

const OfferInfo = ({ formData, updateField }: OfferInfoProps) => {
  const t = useTranslations("NewHub.initialOffer");
  const locale = useLocale();

  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    updateField(e.target.name, e.target.value);
  }, [updateField]);

  // Validation
  const titleAr = useInputValidation("ar");
  const titleEn = useInputValidation("en");

  return (
    <section className="space-y-6">
      <div className="border-b border-border pb-2">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Arabic Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 text-right">{t("offerTitleAr")}</label>
          <input
            name="offer_title_ar"
            type="text"
            dir="rtl"
            value={formData.offer_title_ar || ""}
            onChange={handleInputChange}
            onBlur={titleAr.onBlur}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-right"
            placeholder={t("offerTitleAr")}
          />
          {titleAr.error && <p className="mt-1 text-xs text-red-500 text-right">{titleAr.error}</p>}
        </div>

        {/* English Title - Optional */}
        {/* <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t("offerTitleEn")}</label>
          <input
            name="offer_title_en"
            type="text"
            value={formData.offer_title_en || ""}
            onChange={handleInputChange}
            onBlur={titleEn.onBlur}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("offerTitleEn")}
          />
          {titleEn.error && <p className="mt-1 text-xs text-red-500">{titleEn.error}</p>}
        </div> */}

        {/* Arabic Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 text-right">{t("offerDescAr")}</label>
          <textarea
            name="offer_description_ar"
            dir="rtl"
            rows={2}
            value={formData.offer_description_ar || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-right"
            placeholder="..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t("offerType")}</label>
          <select
            name="offer_type"
            value={formData.offer_type || "monthly"}
            onChange={handleInputChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="daily">{locale === 'ar' ? "يومي" : "Daily"}</option>
            <option value="weekly">{locale === 'ar' ? "أسبوعي" : "Weekly"}</option>
            <option value="monthly">{locale === 'ar' ? "شهري" : "Monthly"}</option>
            <option value="once">{locale === 'ar' ? "لمرة واحدة" : "Once"}</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t("offerPrice")}</label>
          <input
            name="offer_price"
            type="number"
            min="0"
            value={formData.offer_price || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="0"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t("offerDuration")}</label>
          <input
            name="offer_duration"
            type="number"
            min="0"
            value={formData.offer_duration || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="0"
          />
        </div>
      </div>
    </section>
  );
};

export default OfferInfo;
