"use client";

import React from "react";
import { LocationSelect } from "../location/LocationSelect";
import { useTranslations } from "next-intl";
import { TimePicker } from "../ui/time-picker";
import { useInputValidation } from "@/src/hooks/useInputValidation";

const BasicInfo = () => {
  const t = useTranslations("NewHub");

  // Per-field validation hooks — each has its own independent error state
  const nameEn = useInputValidation("en");
  const nameAr = useInputValidation("ar");
  const addressEn = useInputValidation("en");
  const addressAr = useInputValidation("ar");
  const descEn = useInputValidation("en");
  const descAr = useInputValidation("ar");

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
            onBlur={nameEn.onBlur}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("hubNamePlaceholderEn")}
          />
          {nameEn.error && (
            <p className="mt-1 text-xs text-red-500">{nameEn.error}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 text-right">{t("hubNameAr")}</label>
          <input
            name="name_ar"
            type="text"
            required
            dir="rtl"
            onBlur={nameAr.onBlur}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("hubNamePlaceholderAr")}
          />
          {nameAr.error && (
            <p className="mt-1 text-xs text-red-500 text-right">{nameAr.error}</p>
          )}
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
            onBlur={addressEn.onBlur}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("addressPlaceholderEn")}
          />
          {addressEn.error && (
            <p className="mt-1 text-xs text-red-500">{addressEn.error}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 text-right">{t("detailedAddressAr")}</label>
          <input
            name="address_ar"
            type="text"
            required
            dir="rtl"
            onBlur={addressAr.onBlur}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("addressPlaceholderAr")}
          />
          {addressAr.error && (
            <p className="mt-1 text-xs text-red-500 text-right">{addressAr.error}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t("descriptionEn")}</label>
          <textarea
            name="description_en"
            rows={3}
            required
            onBlur={descEn.onBlur}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder={t("descriptionPlaceholderEn")}
          />
          {descEn.error && (
            <p className="mt-1 text-xs text-red-500">{descEn.error}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 text-right">{t("descriptionAr")}</label>
          <textarea
            name="description_ar"
            rows={3}
            required
            dir="rtl"
            onBlur={descAr.onBlur}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder={t("descriptionPlaceholderAr")}
          />
          {descAr.error && (
            <p className="mt-1 text-xs text-red-500 text-right">{descAr.error}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{t("workingHours")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-input rounded-xl bg-muted/5">
            <TimePicker
              name="start_time"
              label={t("openingTime")}
              defaultPeriod="AM"
              minuteStep={5}
              placeholder={t("selectHour")}
            />
          </div>
          <div className="p-4 border border-input rounded-xl bg-muted/5">
            <TimePicker
              name="end_time"
              label={t("closingTime")}
              defaultPeriod="PM"
              minuteStep={5}
              placeholder={t("selectHour")}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BasicInfo;