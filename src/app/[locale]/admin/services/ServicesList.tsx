"use client";

import { useState } from "react";
import { deleteService } from "@/src/actions/admin";
import { createService } from "@/src/actions/hubs";
import { Loader2, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ServicesList({ initialServices }: { initialServices: any[] }) {
  const [services, setServices] = useState(initialServices);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    
    setLoadingId(String(id));
    const res = await deleteService(id);
    
    if (res.success) {
      setServices(prev => prev.filter(s => s.id !== id));
      router.refresh();
    } else {
      alert(res.error || "Failed to delete service");
    }
    setLoadingId(null);
  };

  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    description_en: "",
    description_ar: ""
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    
    const form = new FormData();
    form.append("name_en", formData.name_en);
    form.append("name_ar", formData.name_ar || formData.name_en);
    form.append("description_en", formData.description_en);
    form.append("description_ar", formData.description_ar);

    const res = await createService(null, form);
    if (res.success && res.data) {
      setServices(prev => [...prev, res.data]);
      setFormData({ name_en: "", name_ar: "", description_en: "", description_ar: "" });
      router.refresh();
    } else {
      alert(res.error || "Failed to add service");
    }
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Add New Service Form */}
      <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" /> Add New Service
        </h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name (English) <span className="text-red-500">*</span></label>
              <input required value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} className="w-full px-3 py-2 border rounded-xl bg-background" placeholder="e.g. 5G Setup" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name (Arabic)</label>
              <input value={formData.name_ar} onChange={(e) => setFormData({...formData, name_ar: e.target.value})} className="w-full px-3 py-2 border rounded-xl bg-background" placeholder="e.g. إعداد الجيل الخامس" dir="rtl" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description (English)</label>
              <textarea value={formData.description_en} onChange={(e) => setFormData({...formData, description_en: e.target.value})} className="w-full px-3 py-2 border rounded-xl bg-background" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description (Arabic)</label>
              <textarea value={formData.description_ar} onChange={(e) => setFormData({...formData, description_ar: e.target.value})} className="w-full px-3 py-2 border rounded-xl bg-background" rows={2} dir="rtl" />
            </div>
          </div>
          <button disabled={isAdding || !formData.name_en} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 flex items-center gap-2">
            {isAdding && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Service
          </button>
        </form>
      </div>

      <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Service Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground">#{service.id}</td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    <span className="block">{service.name?.en || service.name}</span>
                    {service.name?.ar && <span className="block text-xs text-muted-foreground">{service.name.ar}</span>}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground w-1/3">
                    <span className="block text-xs line-clamp-1">{service.description?.en || service.description}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {loadingId === String(service.id) ? (
                      <div className="flex justify-end pr-3"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                    ) : (
                      <div className="flex justify-end">
                         <button 
                           onClick={() => handleDelete(service.id)}
                           className="flex items-center gap-1 p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-transparent hover:border-red-200"
                           title="Delete Service"
                         >
                           <Trash2 className="h-4 w-4" />
                         </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    No services configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
