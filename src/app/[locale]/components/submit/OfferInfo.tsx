"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface OfferInfoProps {
  formData: any;
  updateField: (name: string, value: any) => void;
  wasSubmitted?: boolean;
}

const OfferInfo = ({ formData, updateField, wasSubmitted }: OfferInfoProps) => {
  const t = useTranslations("NewHub.initialOffer");
  const locale = useLocale();
  const errT = useTranslations("Errors");

  const offers = formData.offers || [
    { title_ar: "", description_ar: "", type: "monthly", price: "", duration: "" }
  ];

  const addOffer = () => {
    updateField("offers", [
      ...offers,
      { title_ar: "", description_ar: "", type: "monthly", price: "", duration: "" }
    ]);
  };

  const removeOffer = (index: number) => {
    const newOffers = offers.filter((_: any, i: number) => i !== index);
    updateField("offers", newOffers.length > 0 ? newOffers : [
      { title_ar: "", description_ar: "", type: "monthly", price: "", duration: "" }
    ]);
  };

  const handleOfferChange = (index: number, field: string, value: any) => {
    const newOffers = offers.map((offer: any, i: number) => 
      i === index ? { ...offer, [field]: value } : offer
    );
    updateField("offers", newOffers);
  };

  if (offers.length === 0) {
    return (
      <div className="border border-dashed border-border bg-card rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Plus className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t("title")}</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{t("description")}</p>
        </div>
        <button
          type="button"
          onClick={addOffer}
          className="cursor-pointer px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all text-sm font-bold shadow-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("addOffer")}
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="border-b border-border pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-semibold">{t("title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateField("offers", [])}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all text-sm font-bold"
          >
            {locale === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={addOffer}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-all text-sm font-bold"
          >
            <Plus className="h-4 w-4" />
            {t("addOffer")}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {offers.map((offer: any, index: number) => (
          <div key={index} className="relative p-6 border border-border rounded-2xl bg-muted/5 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {offers.length > 1 && (
              <button
                type="button"
                onClick={() => removeOffer(index)}
                className="cursor-pointer absolute -top-3 -right-3 h-8 w-8 bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 rounded-full flex items-center justify-center transition-all shadow-sm z-10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            <div className="grid grid-cols-1 gap-4">
              {/* Arabic Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1 text-right">{t("offerTitleAr")}</label>
                <input
                  name="offer_title_ar[]"
                  type="text"
                  dir="rtl"
                  value={offer.title_ar}
                  onChange={(e) => handleOfferChange(index, "title_ar", e.target.value)}
                  required={index === 0}
                  className={cn(
                    "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-right transition-all",
                    (wasSubmitted && index === 0 && !offer.title_ar) ? "border-destructive ring-1 ring-destructive/20" : "border-input"
                  )}
                  placeholder={t("offerTitleAr")}
                />
                {wasSubmitted && index === 0 && !offer.title_ar && (
                  <p className="mt-1 text-xs text-red-500 text-right">{errT("fieldRequired")}</p>
                )}
              </div>

              {/* Arabic Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1 text-right">{t("offerDescAr")}</label>
                <textarea
                  name="offer_description_ar[]"
                  dir="rtl"
                  rows={2}
                  value={offer.description_ar}
                  onChange={(e) => handleOfferChange(index, "description_ar", e.target.value)}
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
                  name="offer_type[]"
                  value={offer.type}
                  onChange={(e) => handleOfferChange(index, "type", e.target.value)}
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
                  name="offer_price[]"
                  type="number"
                  min="0"
                  value={offer.price}
                  onChange={(e) => handleOfferChange(index, "price", e.target.value)}
                  required={index === 0}
                  className={cn(
                    "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all",
                    (wasSubmitted && index === 0 && !offer.price) ? "border-destructive ring-1 ring-destructive/20" : "border-input"
                  )}
                  placeholder="0"
                />
                {wasSubmitted && index === 0 && !offer.price && (
                  <p className="mt-1 text-xs text-red-500">{errT("fieldRequired")}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t("offerDuration")}</label>
                <input
                  name="offer_duration[]"
                  type="number"
                  min="0"
                  value={offer.duration}
                  onChange={(e) => handleOfferChange(index, "duration", e.target.value)}
                  required={index === 0}
                  className={cn(
                    "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all",
                    (wasSubmitted && index === 0 && !offer.duration) ? "border-destructive ring-1 ring-destructive/20" : "border-input"
                  )}
                  placeholder="0"
                />
                {wasSubmitted && index === 0 && !offer.duration && (
                  <p className="mt-1 text-xs text-red-500">{errT("fieldRequired")}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OfferInfo;
