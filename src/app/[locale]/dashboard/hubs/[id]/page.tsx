"use client";

import { useState, use, useEffect, useActionState, useRef } from "react";
import { Settings, Box, Tag, Link as LinkIcon, Camera, Save, ArrowLeft, Loader2, AlertTriangle, MapPin, Phone, Trash2 } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { useRouter } from "next/navigation";
import { getHubBySlug, updateHub, deleteHub, addHubSocial, getHubOffers, addHubOffer, getAllServices, createService, getHubServices, addCustomService, deleteCustomService } from "@/src/actions/hubs";
import { toast } from "react-hot-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/src/app/[locale]/components/ui/alert-dialog";
import HubGalleryManager from "@/src/app/[locale]/components/dashboard/HubGalleryManager";
import { useTranslations, useLocale } from "next-intl";

// General Tab - shows real hub data
function GeneralTab({ hub, onUpdate }: { hub: any; onUpdate: () => void }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isSavingHours, setIsSavingHours] = useState(false);

  const t = useTranslations("HubManagement.general");
  const locale = useLocale();

  // Parse existing hours
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hour: "8", period: "AM" };
    const [h] = timeStr.split(':');
    let hour = parseInt(h, 10);
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return { hour: String(hour), period };
  };

  const initialStart = parseTime(hub.working_hours?.start);
  const initialEnd = parseTime(hub.working_hours?.end);

  const [startHour, setStartHour] = useState(initialStart.hour);
  const [startPeriod, setStartPeriod] = useState(initialStart.period);
  const [endHour, setEndHour] = useState(initialEnd.hour);
  const [endPeriod, setEndPeriod] = useState(initialEnd.period);

  const handleSaveHours = async () => {
    setIsSavingHours(true);
    const formData = new FormData();
    formData.append("start_hour", startHour);
    formData.append("start_period", startPeriod);
    formData.append("end_hour", endHour);
    formData.append("end_period", endPeriod);

    const res = await updateHub(hub.slug, null, formData);
    if (res.success) {
      toast.success("Hours updated successfully");
      onUpdate();
    } else {
      toast.error(res.error || "Failed to update hours");
    }
    setIsSavingHours(false);
  };

  const mainImage = hub.images?.main || hub.main_image;
  const imageUrl = mainImage ? (mainImage.startsWith('http') ? mainImage : `https://karam.idreis.net${mainImage.startsWith('/') ? '' : '/'}${mainImage}`) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">{t("title")}</h3>
        
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium mb-1">{t("coverImage")}</label>
            <div className="flex items-center gap-4 border border-border p-3 rounded-xl bg-muted/10">
              <div className="h-16 w-16 rounded-xl border border-border flex items-center justify-center bg-muted/30 text-muted-foreground overflow-hidden relative shadow-sm">
                {imageUrl ? (
                  <img src={imageUrl} alt="Hub" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="h-6 w-6 opacity-50" />
                )}
              </div>
              <div className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">{t("manageGallery")}</span>
                <span className="text-xs text-muted-foreground">{t("manageGalleryDesc")}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setIsGalleryOpen(true);
                }}
                className="ms-auto px-4 py-2 bg-secondary text-secondary-foreground text-sm rounded-lg font-medium hover:bg-secondary/80 transition-colors shadow-sm"
              >
                {t("manageGallery")}
              </button>
            </div>
            <HubGalleryManager 
              hub={hub} 
              isOpen={isGalleryOpen} 
              onClose={() => setIsGalleryOpen(false)} 
              onUpdate={onUpdate} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t("hubName")}</label>
            <input type="text" className="w-full px-4 py-2 border border-input rounded-xl bg-background" defaultValue={hub.name?.[locale] || hub.name || ""} readOnly />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t("description")}</label>
            <textarea className="w-full px-4 py-2 border border-input rounded-xl bg-background resize-none" rows={3} defaultValue={hub.description?.[locale] || hub.description || ""} readOnly />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("status")}</label>
              <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${
                hub.status === "approved" || hub.status === "active" ? "bg-green-100 text-green-700" :
                hub.status === "rejected" ? "bg-red-100 text-red-700" :
                "bg-yellow-100 text-yellow-700"
              }`}>
                {hub.status || "Pending"}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("slug")}</label>
              <span className="text-sm text-muted-foreground font-mono">{hub.slug}</span>
            </div>
          </div>

          {hub.rejection_reason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <strong>{t("rejectionReason")}</strong> {hub.rejection_reason}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{hub.address_details?.[locale] || hub.address || t("noAddress")}</span>
            {hub.location && <span className="text-xs bg-muted px-2 py-0.5 rounded">({hub.location.name} - {hub.location.type})</span>}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span dir="ltr">{hub.contact || t("noContact")}</span>
          </div>

          <div className="pt-6 mt-6 border-t border-border">
            <h4 className="text-sm font-bold mb-3 uppercase tracking-wider">{t("workingHours")}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="p-3 border border-border rounded-xl bg-muted/5">
                <label className="block text-xs text-muted-foreground mb-2 uppercase">{t("openingTime")}</label>
                <div className="flex gap-2">
                  <select 
                    value={startHour} 
                    onChange={(e) => setStartHour(e.target.value)}
                    className="flex-1 bg-background border border-input rounded-lg px-2 py-1 text-sm focus:outline-none"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>{String(i+1).padStart(2, '0')}</option>
                    ))}
                  </select>
                  <select 
                    value={startPeriod} 
                    onChange={(e) => setStartPeriod(e.target.value)}
                    className="bg-background border border-input rounded-lg px-2 py-1 text-sm focus:outline-none"
                  >
                    <option value="AM">{t("am")}</option>
                    <option value="PM">{t("pm")}</option>
                  </select>
                </div>
              </div>
              <div className="p-3 border border-border rounded-xl bg-muted/5">
                <label className="block text-xs text-muted-foreground mb-2 uppercase">{t("closingTime")}</label>
                <div className="flex gap-2">
                  <select 
                    value={endHour} 
                    onChange={(e) => setEndHour(e.target.value)}
                    className="flex-1 bg-background border border-input rounded-lg px-2 py-1 text-sm focus:outline-none"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>{String(i+1).padStart(2, '0')}</option>
                    ))}
                  </select>
                  <select 
                    value={endPeriod} 
                    onChange={(e) => setEndPeriod(e.target.value)}
                    className="bg-background border border-input rounded-lg px-2 py-1 text-sm focus:outline-none"
                  >
                    <option value="AM">{t("am")}</option>
                    <option value="PM">{t("pm")}</option>
                  </select>
                </div>
              </div>
            </div>
            <button 
              onClick={handleSaveHours}
              disabled={isSavingHours}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSavingHours ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t("save")}
            </button>
          </div>

          <div className="pt-6 mt-6 border-t border-border">
            <button 
              onClick={() => setIsDeleteDialogOpen(true)}
              className="px-4 py-2 bg-red-100 text-red-700 text-sm rounded-lg font-medium hover:bg-red-200 transition-colors"
            >
              {t("deleteHub")}
            </button>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-background sm:rounded-3xl border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteHubConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteHubDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-border">{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={async (e) => {
                e.preventDefault();
                setIsDeleting(true);
                const res = await deleteHub(hub.slug);
                if (res.success) {
                  toast.success("Hub deleted successfully");
                  window.location.href = "/dashboard";
                } else {
                  toast.error(res.error || "Failed to delete hub");
                  setIsDeleting(false);
                  setIsDeleteDialogOpen(false);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              disabled={isDeleting}
            >
              {isDeleting ? t("deleting") : t("confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Services Tab - Updated for Current Services Table and Dedicated Custom Endpoints
function ServicesTab({ hub, onUpdate }: { hub: any; onUpdate: () => void }) {
  const [globalServices, setGlobalServices] = useState<any[]>([]);
  const [activeServices, setActiveServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingLink, setSavingLink] = useState<number | null>(null);
  const [addingCustom, setAddingCustom] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const [customNameEN, setCustomNameEN] = useState("");
  const [customNameAR, setCustomNameAR] = useState("");
  const [customDescEN, setCustomDescEN] = useState("");
  const [customDescAR, setCustomDescAR] = useState("");
  const t = useTranslations("HubManagement.services");
  const locale = useLocale();

  const loadData = async () => {
    setLoading(true);
    const [globalRes, activeRes] = await Promise.all([
      getAllServices(locale),
      getHubServices(hub.slug, locale)
    ]);
    
    if (globalRes.success) setGlobalServices(globalRes.data);
    if (activeRes.success) setActiveServices(activeRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [hub.slug]);

  const handleLinkGlobal = async (serviceId: number, isLinked: boolean) => {
    setSavingLink(serviceId);

    const formData = new FormData();
    if (isLinked) {
      formData.append("remove_service_ids[]", String(serviceId));
    } else {
      formData.append("add_service_ids[]", String(serviceId));
    }

    const res = await updateHub(hub.slug, null, formData);
    if (res.success) {
      toast.success(isLinked ? "Service unlinked" : "Service linked");
      await loadData();
    } else {
      toast.error(res.error || "Failed to update service");
    }
    setSavingLink(null);
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingCustom(true);

    const formData = new FormData();
    formData.append("name_en", customNameEN.trim());
    formData.append("name_ar", customNameAR.trim() || customNameEN.trim());
    formData.append("description_en", customDescEN.trim());
    formData.append("description_ar", customDescAR.trim());

    const res = await addCustomService(hub.slug, null, formData);
    if (res.success) {
      toast.success("Custom service added!");
      setCustomNameEN("");
      setCustomNameAR("");
      setCustomDescEN("");
      setCustomDescAR("");
      await loadData();
    } else {
      toast.error(res.error || "Failed to add service");
    }
    setAddingCustom(false);
  };

  const handleDeleteCustom = async (serviceId: number) => {
    setDeletingId(serviceId);
    const res = await deleteCustomService(hub.slug, serviceId);
    if (res.success) {
      toast.success("Service removed");
      await loadData();
    } else {
      toast.error(res.error || "Failed to remove service");
    }
    setDeletingId(null);
  };

  if (loading && activeServices.length === 0) {
     return <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Current Services Table */}
      <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold">{t("currentTitle")}</h3>
          <p className="text-sm text-muted-foreground">{t("currentDesc")}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 text-start">{t("name")}</th>
                <th className="px-6 py-4 text-start">{t("type")}</th>
                <th className="px-6 py-4 text-start">{t("descCol")}</th>
                <th className="px-6 py-4 text-end">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activeServices.map((s: any) => {
                const isGlobal = !!s.pivot;
                return (
                  <tr key={s.id || s.name?.en} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium block">{s.name?.[locale] || s.name?.en || s.name}</span>
                      {s.name?.ar && locale === 'en' && <span className="text-xs text-muted-foreground block">{s.name.ar}</span>}
                      {s.name?.en && locale === 'ar' && <span className="text-xs text-muted-foreground block" dir="ltr">{s.name.en}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${isGlobal ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                        {isGlobal ? t("global") : t("custom")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground italic">
                      {s.description?.[locale] || s.description?.en || s.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-end">
                       <button 
                         disabled={deletingId === s.id || savingLink === s.id}
                         onClick={() => s.pivot ? handleLinkGlobal(s.id, true) : handleDeleteCustom(s.id)}
                         className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                       >
                         {deletingId === s.id || savingLink === s.id ? (
                           <Loader2 className="h-4 w-4 animate-spin" />
                         ) : (
                           <Trash2 className="h-4 w-4" />
                         )}
                       </button>
                    </td>
                  </tr>
                );
              })}
              {activeServices.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">{t("noActive")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Link Global Services */}
        <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">{t("linkGlobal")}</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {globalServices.map((gs) => {
              const isLinked = activeServices.some(as => as.id === gs.id);
              return (
                <div key={gs.id} className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-muted/30 transition-colors">
                  <div>
                    <span className="font-medium block text-sm">{gs.name?.[locale] || gs.name?.en || gs.name}</span>
                    {gs.name?.ar && locale === 'en' && <span className="text-[10px] text-muted-foreground block">{gs.name.ar}</span>}
                  </div>
                  <button
                    disabled={savingLink === gs.id}
                    onClick={() => handleLinkGlobal(gs.id, isLinked)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      isLinked 
                        ? "bg-red-50 text-red-600 hover:bg-red-100" 
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    {savingLink === gs.id ? <Loader2 className="h-3 w-3 animate-spin" /> : (isLinked ? t("unlink") : t("link"))}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Custom Service */}
        <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">{t("addCustom")}</h3>
          <form onSubmit={handleAddCustom} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 uppercase tracking-wider text-muted-foreground">{t("serviceNameEn")}</label>
                <input 
                  required
                  value={customNameEN}
                  onChange={(e) => setCustomNameEN(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm" 
                  placeholder="e.g. Dedicated Desk"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 uppercase tracking-wider text-muted-foreground text-end">{t("serviceNameAr")}</label>
                <input 
                  value={customNameAR}
                  onChange={(e) => setCustomNameAR(e.target.value)}
                  dir="rtl" 
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm text-right" 
                  placeholder="مثال: مكتب خاص"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 uppercase tracking-wider text-muted-foreground">{t("descEn")}</label>
                <textarea
                  value={customDescEN}
                  onChange={(e) => setCustomDescEN(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm resize-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 uppercase tracking-wider text-muted-foreground text-end">{t("descAr")}</label>
                <textarea
                  value={customDescAR}
                  onChange={(e) => setCustomDescAR(e.target.value)}
                  dir="rtl"
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm resize-none text-right"
                  rows={2}
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={addingCustom || !customNameEN.trim()}
              className="w-full px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {addingCustom && <Loader2 className="h-4 w-4 animate-spin" />}
              {addingCustom ? t("adding") : t("addService")}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}


// Socials Tab - functional form
function SocialsTab({ hubSlug }: { hubSlug: string }) {
  const [state, formAction] = useActionState(addHubSocial.bind(null, hubSlug), null);
  const t = useTranslations("HubManagement.socials");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold">{t("title")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
          </div>
        </div>

        <form action={formAction} className="max-w-xl space-y-4">
          {state?.error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{state.error}</div>}
          {state?.success && <div className="text-green-600 text-sm bg-green-50 p-2 rounded">{t("socialAdded")}</div>}
          <div className="flex gap-3">
            <select name="platform" className="px-4 py-2 border border-input rounded-xl bg-background text-sm">
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter</option>
            </select>
            <input 
              name="url"
              type="url" 
              placeholder="https://..."
              required
              className="flex-1 px-4 py-2 border border-input rounded-xl bg-background text-sm" 
            />
            <button type="submit" className="px-4 py-2 bg-secondary text-secondary-foreground text-sm rounded-xl font-medium">{t("add")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}


// Offers Tab - functional form
function OffersTab({ hubSlug }: { hubSlug: string }) {
  const [showForm, setShowForm] = useState(false);
  const [state, formAction] = useActionState(addHubOffer.bind(null, hubSlug), null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("HubManagement.offers");
  const locale = useLocale();

  useEffect(() => {
    async function loadOffers() {
      const res = await getHubOffers(hubSlug, locale);
      if (res.success) setOffers(res.data);
      setLoading(false);
    }
    loadOffers();
  }, [hubSlug, state]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold">{t("title")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            {showForm ? t("cancel") : t("addOffer")}
          </button>
        </div>

        {showForm && (
          <form action={formAction} className="p-4 border border-border rounded-xl mb-6 space-y-4 bg-muted/20">
            {state?.error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{state.error}</div>}
            {state?.success && <div className="text-green-600 text-sm bg-green-50 p-2 rounded">{t("offerAdded")}</div>}
            <div>
              <label className="block text-sm font-medium mb-1">{t("titleEn")}</label>
              <input name="title_en" required className="w-full px-4 py-2 border rounded-lg bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-end">{t("titleAr")}</label>
              <input name="title_ar" required dir="rtl" className="w-full px-4 py-2 border rounded-lg bg-background text-right" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("descEn")}</label>
              <textarea name="description_en" required className="w-full px-4 py-2 border rounded-lg bg-background resize-none" rows={2}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-end">{t("descAr")}</label>
              <textarea name="description_ar" required dir="rtl" className="w-full px-4 py-2 border rounded-lg bg-background resize-none text-right" rows={2}></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("price")}</label>
                <input name="price" type="number" required className="w-full px-4 py-2 border rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("duration")}</label>
                <input name="duration" type="number" required className="w-full px-4 py-2 border rounded-lg bg-background" />
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-medium">{t("saveOffer")}</button>
          </form>
        )}

        <div className="space-y-3">
          {loading ? (
             <div className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
          ) : offers.length > 0 ? (
            offers.map((offer) => (
              <div key={offer.id} className="flex items-center justify-between p-4 border border-border rounded-xl">
                <div>
                  <h4 className="font-medium text-lg">{offer.title?.[locale] || offer.title?.en || offer.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{offer.description?.[locale] || offer.description?.en || ""}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-sm font-semibold text-green-600">₪{offer.price}</span>
                    <span className="text-sm text-muted-foreground">{offer.duration} {t("hours")}</span>
                    <span className="text-sm capitalize text-muted-foreground">{offer.type}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="py-12 flex flex-col items-center justify-center text-center bg-muted/10">
                <Tag className="h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                <p className="font-medium">{t("noOffers")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default function HubManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState("general");
  const [hub, setHub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("HubManagement");
  const locale = useLocale();

  useEffect(() => {
    async function fetchHub() {
      setLoading(true);
      const result = await getHubBySlug(resolvedParams.id, locale);
      if (result.success && result.data) {
        setHub(result.data);
      } else {
        setError(result.error || "Failed to load hub");
      }
      setLoading(false);
    }
    fetchHub();
  }, [resolvedParams.id]);
  
  const tabs = [
    { id: "general", label: t("tabs.general"), icon: Settings },
    { id: "services", label: t("tabs.services"), icon: Box },
    { id: "offers", label: t("tabs.offers"), icon: Tag },
    { id: "socials", label: t("tabs.socials"), icon: LinkIcon },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ms-3 text-muted-foreground">{t("loading")}</span>
      </div>
    );
  }

  if (error || !hub) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
          <p className="font-medium text-red-700">{error || t("hubNotFound")}</p>
          <Link href="/dashboard" className="inline-block mt-4 text-primary hover:underline text-sm">{t("backToDashboard")}</Link>
        </div>
      </div>
    );
  }

  const hubName = hub.name?.[locale] || hub.name || "Unnamed Hub";

  // Re-fetch hub helper for child tabs to refresh data
  const fetchHub = async () => {
    const result = await getHubBySlug(resolvedParams.id, locale);
    if (result.success && result.data) setHub(result.data);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Area */}
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("backToHubs")}
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">{hubName}</h2>
            <p className="text-muted-foreground mt-1 font-mono text-sm opacity-60">slug: {hub.slug}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            hub.status === "approved" || hub.status === "active" ? "bg-green-100 text-green-700" :
            hub.status === "rejected" ? "bg-red-100 text-red-700" :
            "bg-yellow-100 text-yellow-700"
          }`}>
            {hub.status || "Pending"}
          </span>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Nav Tabs */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium whitespace-nowrap ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === "general" && <GeneralTab hub={hub} onUpdate={fetchHub} />}
          {activeTab === "services" && <ServicesTab hub={hub} onUpdate={fetchHub} />}
          {activeTab === "offers" && <OffersTab hubSlug={hub.slug} />}
          {activeTab === "socials" && <SocialsTab hubSlug={hub.slug} />}
        </div>
      </div>
    </div>
  );
}
