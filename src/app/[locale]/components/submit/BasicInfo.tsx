"use client";

import React from "react";
import { LocationSelect } from "../location/LocationSelect";
import { useTranslations } from "next-intl";
import { TimePicker } from "../ui/time-picker";
import { useInputValidation } from "@/src/hooks/useInputValidation";
import { cn } from "@/src/lib/utils";

interface BasicInfoProps {
  formData: any;
  updateField: (name: string, value: any) => void;
  wasSubmitted?: boolean;
}

const BasicInfo = ({ formData, updateField, wasSubmitted }: BasicInfoProps) => {
  const t = useTranslations("NewHub");

  // Per-field validation hooks — each has its own independent error state
  const nameEn = useInputValidation("en");
  const nameAr = useInputValidation("ar");
  const addressEn = useInputValidation("en");
  const addressAr = useInputValidation("ar");
  const descEn = useInputValidation("en");
  const descAr = useInputValidation("ar");
  const errT = useTranslations("Errors");

  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateField(e.target.name, e.target.value);
  }, [updateField]);

  const handleLocationChange = React.useCallback((val: string) => {
    updateField("location_id", val);
  }, [updateField]);

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold border-b border-border pb-2">{t("basicInfo")}</h2>

      {/* <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-sm text-blue-700">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        <p>{t("englishOptionalNotice")}</p>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 text-right">{t("hubNameAr")}</label>
          <input
            name="name_ar"
            type="text"
            required
            dir="rtl"
            value={formData.name_ar}
            onChange={handleInputChange}
            onBlur={nameAr.onBlur}
            className={cn(
              "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all",
              (nameAr.error || (wasSubmitted && !formData.name_ar)) ? "border-destructive ring-1 ring-destructive/20" : "border-input"
            )}
            placeholder={t("hubNamePlaceholderAr")}
          />
          {nameAr.error && (
            <p className="mt-1 text-xs text-red-500 text-right">{nameAr.error}</p>
          )}
          {!nameAr.error && wasSubmitted && !formData.name_ar && (
            <p className="mt-1 text-xs text-red-500 text-right">{errT("fieldRequired")}</p>
          )}
        </div>
        {/* <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t("hubNameEn")}</label>
          <input
            name="name_en"
            type="text"
            onBlur={nameEn.onBlur}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("hubNamePlaceholderEn")}
          />
          {nameEn.error ? (
            <p className="mt-1 text-xs text-red-500">{nameEn.error}</p>
          ) : (
            <p className="mt-1 text-[10px] text-muted-foreground opacity-70 italic">{t("englishOptionalWarning")}</p>
          )}
        </div> */}
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-foreground mb-1">{t("locationSelection")}</label>
        <LocationSelect 
          initialValue={formData.location_id} 
          onChange={handleLocationChange} 
          error={wasSubmitted && !formData.location_id}
        />
        {wasSubmitted && !formData.location_id && (
          <p className="mt-1 text-xs text-red-500">{errT("fieldRequired")}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 text-right">{t("detailedAddressAr")}</label>
          <input
            name="address_ar"
            type="text"
            required
            dir="rtl"
            value={formData.address_ar}
            onChange={handleInputChange}
            onBlur={addressAr.onBlur}
            className={cn(
              "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all",
              (addressAr.error || (wasSubmitted && !formData.address_ar)) ? "border-destructive ring-1 ring-destructive/20" : "border-input"
            )}
            placeholder={t("addressPlaceholderAr")}
          />
          {addressAr.error && (
            <p className="mt-1 text-xs text-red-500 text-right">{addressAr.error}</p>
          )}
          {!addressAr.error && wasSubmitted && !formData.address_ar && (
            <p className="mt-1 text-xs text-red-500 text-right">{errT("fieldRequired")}</p>
          )}
        </div>
        {/* <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t("detailedAddressEn")}</label>
          <input
            name="address_en"
            type="text"
            onBlur={addressEn.onBlur}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={t("addressPlaceholderEn")}
          />
          {addressEn.error ? (
            <p className="mt-1 text-xs text-red-500">{addressEn.error}</p>
          ) : (
            <p className="mt-1 text-[10px] text-muted-foreground opacity-70 italic">{t("englishOptionalWarning")}</p>
          )}
        </div> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 text-right">{t("descriptionAr")}</label>
          <textarea
            name="description_ar"
            rows={3}
            dir="rtl"
            value={formData.description_ar}
            onChange={handleInputChange}
            onBlur={descAr.onBlur}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder={t("descriptionPlaceholderAr")}
          />
          {descAr.error && (
            <p className="mt-1 text-xs text-red-500 text-right">{descAr.error}</p>
          )}
        </div>
        {/* <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t("descriptionEn")}</label>
          <textarea
            name="description_en"
            rows={3}
            onBlur={descEn.onBlur}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder={t("descriptionPlaceholderEn")}
          />
          {descEn.error ? (
            <p className="mt-1 text-xs text-red-500">{descEn.error}</p>
          ) : (
            <p className="mt-1 text-[10px] text-muted-foreground opacity-70 italic">{t("englishOptionalWarning")}</p>
          )}
        </div> */}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{t("workingHours")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-input rounded-xl bg-muted/5">
            <TimePicker
              name="start_time"
              label={t("openingTime")}
              value={formData.start_time}
              onChange={(val) => updateField("start_time", val)}
              defaultPeriod="AM"
              minuteStep={5}
              placeholder={t("selectHour")}
              error={wasSubmitted && !formData.start_time}
            />
            {wasSubmitted && !formData.start_time && (
              <p className="mt-2 text-xs text-red-500 font-medium">{errT("fieldRequired")}</p>
            )}
          </div>
          <div className="p-4 border border-input rounded-xl bg-muted/5">
            <TimePicker
              name="end_time"
              label={t("closingTime")}
              value={formData.end_time}
              onChange={(val) => updateField("end_time", val)}
              defaultPeriod="PM"
              minuteStep={5}
              placeholder={t("selectHour")}
              error={wasSubmitted && !formData.end_time}
            />
            {wasSubmitted && !formData.end_time && (
              <p className="mt-2 text-xs text-red-500 font-medium">{errT("fieldRequired")}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BasicInfo;