"use client";

import React from "react";
import { LocationSelect } from "../../components/LocationSelect";
import { useTranslations } from "next-intl";

const BasicInfo = () => {
  const t = useTranslations("NewHub");

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold border-b border-border pb-2">{t("basicInfo")}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t("hubNameEn")}</label>
          <input
            name="name_en"
            type="text"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("hubNamePlaceholderEn")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 text-right">{t("hubNameAr")}</label>
          <input
            name="name_ar"
            type="text"
            required
            dir="rtl"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("hubNamePlaceholderAr")}
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-foreground mb-1">{t("locationSelection")}</label>
        <LocationSelect />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t("detailedAddressEn")}</label>
          <input
            name="address_en"
            type="text"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("addressPlaceholderEn")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 text-right">{t("detailedAddressAr")}</label>
          <input
            name="address_ar"
            type="text"
            required
            dir="rtl"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("addressPlaceholderAr")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t("descriptionEn")}</label>
          <textarea
            name="description_en"
            rows={3}
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder={t("descriptionPlaceholderEn")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 text-right">{t("descriptionAr")}</label>
          <textarea
            name="description_ar"
            rows={3}
            required
            dir="rtl"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder={t("descriptionPlaceholderAr")}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{t("workingHours")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-input rounded-xl bg-muted/5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2">{t("openingTime")}</label>
            <div className="flex gap-2">
              <select name="start_hour" required className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">{t("selectHour")}</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>{String(i+1).padStart(2, '0')}</option>
                ))}
              </select>
              <select name="start_period" required className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="AM">{t("am")}</option>
                <option value="PM">{t("pm")}</option>
              </select>
            </div>
          </div>
          <div className="p-4 border border-input rounded-xl bg-muted/5">
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2">{t("closingTime")}</label>
            <div className="flex gap-2">
              <select name="end_hour" required className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">{t("selectHour")}</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>{String(i+1).padStart(2, '0')}</option>
                ))}
              </select>
              <select name="end_period" required className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="AM">{t("am")}</option>
                <option value="PM">{t("pm")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BasicInfo;