import React from "react";
import { LocationSelect } from "../../components/LocationSelect";

const BasicInfo = () => {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold border-b border-border pb-2">1. Basic Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Hub Name (English)</label>
          <input
            name="name_en"
            type="text"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. Al-Bahr Connection"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 text-right">اسم المركز (بالعربية)</label>
          <input
            name="name_ar"
            type="text"
            required
            dir="rtl"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="مثال: مركز البحر"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-foreground mb-1">Location Selection</label>
        <LocationSelect />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Detailed Address (English)</label>
          <input
            name="address_en"
            type="text"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. Al-Rashid St, Near the Port"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 text-right">العنوان بالتفصيل (بالعربية)</label>
          <input
            name="address_ar"
            type="text"
            required
            dir="rtl"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="شارع الرشيد، بالقرب من الميناء"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Description (English)</label>
          <textarea
            name="description_en"
            rows={3}
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Describe the atmosphere or specific directions..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1 text-right">الوصف (بالعربية)</label>
          <textarea
            name="description_ar"
            rows={3}
            required
            dir="rtl"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="وصف إمكانيات المركز..."
          />
        </div>
      </div>
    </section>
  );
};

export default BasicInfo;