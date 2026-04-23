"use client";

import { useState, use, useEffect, useActionState, useRef } from "react";
import { Settings, Box, Tag, Link as LinkIcon, Camera, Save, ArrowLeft, Loader2, AlertTriangle, MapPin, Phone, Trash2, Clock, Calendar, Edit, X, User, Plus, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/src/i18n/routing";
import { useRouter } from "next/navigation";
import { getPrivateHubBySlug, updateHub, deleteHub, addHubSocial, updateHubSocials, getHubOffers, addHubOffer, updateHubOffer, deleteHubOffer, getAllServices, createService, getHubServices, addCustomService, deleteCustomService, getHubDataBySlugForManagement, getHubSocials } from "@/src/actions/hubs";
import type { SocialAccount } from "@/src/actions/hubs";
import { toast } from "react-hot-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/src/app/[locale]/components/ui/alert-dialog";
import HubGalleryManager from "@/src/app/[locale]/components/dashboard/HubGalleryManager";
import { useTranslations, useLocale } from "next-intl";
import { TimePicker } from "@/src/app/[locale]/components/ui/time-picker";
// import { cookies } from "next/headers";

// General Tab - shows real hub data
function GeneralTab({ hub, onUpdate }: { hub: any; onUpdate: () => void }) {
  const t = useTranslations("HubManagement.general");
  const locale = useLocale();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const originalDataRef = useRef<any>(null);

  const [hubNameAr, setHubNameAr] = useState("");
  const [hubNameEn, setHubNameEn] = useState("");
  const [hubDescAr, setHubDescAr] = useState("");
  const [hubDescEn, setHubDescEn] = useState("");
  const [hubAddrAr, setHubAddrAr] = useState("");
  const [hubAddrEn, setHubAddrEn] = useState("");

  

  useEffect(() => {
    async function fetchData() {
     
      setIsLoadingData(true);
      const res = await getHubDataBySlugForManagement(hub.slug);
      if (res.success && res.data) {
        originalDataRef.current = res.data;
        setHubNameAr(res.data.name.ar || "");
        setHubNameEn(res.data.name.en || "");
        setHubDescAr(res.data.description.ar || "");
        setHubDescEn(res.data.description.en || "");
        setHubAddrAr(res.data.address_details.ar || "");
        setHubAddrEn(res.data.address_details.en || "");
      }
      setIsLoadingData(false);
    }
    fetchData();
  }, [hub.slug]);

  const [startTime, setStartTime] = useState(hub.working_hours?.start || "08:00");
  const [endTime, setEndTime] = useState(hub.working_hours?.end || "17:00");

  const handleSaveHours = async () => {
    setIsSavingHours(true);
    const formData = new FormData();
    formData.append("start_time", startTime);
    formData.append("end_time", endTime);

    const res = await updateHub(hub.slug, null, formData);
    if (res.success) {
      toast.success("Hours updated successfully");
      onUpdate();
    } else {
      toast.error(res.error || "Failed to update hours");
    }
    setIsSavingHours(false);
  };

  const handleSaveGeneralSettings = async () => {
    if (!hubNameAr.trim() || !hubNameEn.trim()) {
      toast.error("Both Arabic and English names are required");
      return;
    }
    setIsSavingName(true);
    const formData = new FormData();
    formData.append("name[ar]", hubNameAr.trim());
    formData.append("name[en]", hubNameEn.trim());
    formData.append("description[ar]", hubDescAr.trim());
    formData.append("description[en]", hubDescEn.trim());
    formData.append("address_details[ar]", hubAddrAr.trim());
    formData.append("address_details[en]", hubAddrEn.trim());

    const res = await updateHub(hub.slug, null, formData);
    if (res.success) {
      toast.success(t("hub_name_updated") || "Settings updated successfully");
      setIsEditing(false);
      onUpdate();
    } else {
      toast.error(res.error || "Failed to update hub settings");
    }
    setIsSavingName(false);
  };

  const handleCancel = () => {
    if (originalDataRef.current) {
      setHubNameAr(originalDataRef.current.name.ar || "");
      setHubNameEn(originalDataRef.current.name.en || "");
      setHubDescAr(originalDataRef.current.description.ar || "");
      setHubDescEn(originalDataRef.current.description.en || "");
      setHubAddrAr(originalDataRef.current.address_details.ar || "");
      setHubAddrEn(originalDataRef.current.address_details.en || "");
    }
    setIsEditing(false);
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

<AnimatePresence mode="wait">
  {!isEditing ? (
    <motion.div 
      key="view-mode"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
         <h4 className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-tight">
          <User className="h-4 w-4" /> Hub Profile
        </h4>
        <button 
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground text-xs rounded-lg font-medium hover:bg-secondary/80 transition-colors shadow-sm"
        >
          <Edit className="h-3.5 w-3.5" />
          {t("edit")}
        </button>
      </div>

      {/* View Mode Content */}
      <div className="space-y-6">
         {/* Name Card */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="p-4 border border-border rounded-2xl bg-muted/5">
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest text-muted-foreground">{t("hub_name_en")}</label>
              <p className="text-sm font-semibold">{hubNameEn || "---"}</p>
           </div>
           <div className="p-4 border border-border rounded-2xl bg-muted/5 text-right">
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-widest text-muted-foreground">{t("hub_name_ar")}</label>
              <p className="text-sm font-semibold font-arabic" dir="rtl">{hubNameAr || "---"}</p>
           </div>
         </div>

         {/* Description Card */}
         <div className="p-5 border border-border rounded-2xl bg-muted/5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold mb-2 uppercase tracking-widest text-muted-foreground">{t("description_en")}</label>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{hubDescEn || "No English description provided."}</p>
              </div>
              <div className="text-right">
                <label className="block text-[10px] font-bold mb-2 uppercase tracking-widest text-muted-foreground">{t("description_ar")}</label>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-arabic" dir="rtl">{hubDescAr || "لا يوجد وصف عربي."}</p>
              </div>
            </div>
         </div>

         {/* Address Card */}
         <div className="p-5 border border-border rounded-2xl bg-muted/5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold mb-2 uppercase tracking-widest text-muted-foreground">{t("address_en")}</label>
                <p className="text-sm text-muted-foreground font-medium">{hubAddrEn || "No address details."}</p>
              </div>
              <div className="text-right">
                <label className="block text-[10px] font-bold mb-2 uppercase tracking-widest text-muted-foreground">{t("address_ar")}</label>
                <p className="text-sm text-muted-foreground font-medium font-arabic" dir="rtl">{hubAddrAr || "لا توجد بيانات عنوان."}</p>
              </div>
            </div>
         </div>

         {/* Status & Slug Row */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="flex items-center justify-between p-4 border border-border rounded-2xl bg-muted/5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("status")}</span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                hub.status === "approved" || hub.status === "active" ? "bg-green-100 text-green-700" :
                hub.status === "rejected" ? "bg-red-100 text-red-700" :
                "bg-yellow-100 text-yellow-700"
              }`}>
                {hub.status || "Pending"}
              </span>
           </div>
           <div className="flex items-center justify-between p-4 border border-border rounded-2xl bg-muted/5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("slug")}</span>
              <span className="text-xs font-mono opacity-60">{hub.slug}</span>
           </div>
         </div>
      </div>
    </motion.div>
  ) : (
    <motion.div 
      key="edit-mode"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
         <h4 className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-tight">
          <Edit className="h-4 w-4" /> Editing Settings
        </h4>
        <button 
          onClick={handleCancel}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 text-xs rounded-lg font-medium hover:bg-red-100 transition-colors shadow-sm"
        >
          <X className="h-3.5 w-3.5" />
          {t("cancel")}
        </button>
      </div>

      {isLoadingData ? (
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-muted/50 rounded-xl animate-pulse" />
            <div className="h-10 bg-muted/50 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-muted/50 rounded-xl animate-pulse" />
            <div className="h-24 bg-muted/50 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-muted/50 rounded-xl animate-pulse" />
            <div className="h-24 bg-muted/50 rounded-xl animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Name Section */}
          <div className="p-5 border border-border rounded-xl bg-card space-y-4 shadow-sm">
            <h4 className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-tight">
              <Edit className="h-4 w-4" /> {t("hubName")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-[10px] font-bold mb-1 uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                  {t("lang_en")} <span className="text-[14px]">🇺🇸</span>
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background text-sm focus:ring-2 focus:ring-primary/20 transition-all" 
                  value={hubNameEn}
                  onChange={(e) => setHubNameEn(e.target.value)}
                  placeholder="e.g. Al-Bahr Connection"
                />
              </div>
              <div className="relative">
                <label className="block text-[10px] font-bold mb-1 uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                  <span className="text-[14px]">🇸🇦</span> {t("lang_ar")}
                </label>
                <input 
                  type="text" 
                  dir="rtl"
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background text-sm text-right focus:ring-2 focus:ring-primary/20 transition-all font-arabic" 
                  value={hubNameAr}
                  onChange={(e) => setHubNameAr(e.target.value)}
                  placeholder="مثال: مركز البحر"
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="p-5 border border-border rounded-xl bg-card space-y-4 shadow-sm">
            <h4 className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-tight">
              <Settings className="h-4 w-4" /> {t("description")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold mb-1 uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                  {t("description_en")} <span>🇺🇸</span>
                </label>
                <textarea 
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background text-sm min-h-[100px] resize-none focus:ring-2 focus:ring-primary/20 transition-all" 
                  value={hubDescEn}
                  onChange={(e) => setHubDescEn(e.target.value)}
                  placeholder="Describe your hub in English..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1 uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                  <span>🇸🇦</span> {t("description_ar")}
                </label>
                <textarea 
                  dir="rtl"
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background text-sm text-right min-h-[100px] resize-none focus:ring-2 focus:ring-primary/20 transition-all font-arabic" 
                  value={hubDescAr}
                  onChange={(e) => setHubDescAr(e.target.value)}
                  placeholder="صف المركز باللغة العربية..."
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="p-5 border border-border rounded-xl bg-card space-y-4 shadow-sm">
            <h4 className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-tight">
              <MapPin className="h-4 w-4" /> {t("address_en")?.split(' ')[0]}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold mb-1 uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                  {t("address_en")} <span>🇺🇸</span>
                </label>
                <textarea 
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background text-sm min-h-[80px] resize-none focus:ring-2 focus:ring-primary/20 transition-all" 
                  value={hubAddrEn}
                  onChange={(e) => setHubAddrEn(e.target.value)}
                  placeholder="Full English address details..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1 uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                  <span>🇸🇦</span> {t("address_ar")}
                </label>
                <textarea 
                  dir="rtl"
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background text-sm text-right min-h-[80px] resize-none focus:ring-2 focus:ring-primary/20 transition-all font-arabic" 
                  value={hubAddrAr}
                  onChange={(e) => setHubAddrAr(e.target.value)}
                  placeholder="تفاصيل العنوان بالعربية..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSaveGeneralSettings}
                disabled={isSavingName}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-sm rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"
              >
                {isSavingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t("save_btn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )}
</AnimatePresence>


          {hub.rejection_reason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <strong>{t("rejectionReason")}</strong> {hub.rejection_reason}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{hub.location? hub.location.breadcrumb[1].name + " - " + hub.location.breadcrumb[2].name : t("noAddress")}</span>
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
                <TimePicker 
                   value={startTime}
                   onChange={setStartTime}
                   label={t("openingTime")}
                   minuteStep={5}
                />
              </div>
              <div className="p-3 border border-border rounded-xl bg-muted/5">
                <TimePicker 
                   value={endTime}
                   onChange={setEndTime}
                   label={t("closingTime")}
                   minuteStep={5}
                   defaultPeriod="PM"
                />
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
                const isGlobal = s.is_global || !!s.pivot;
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
                         onClick={() => isGlobal ? handleLinkGlobal(s.id, true) : handleDeleteCustom(s.id)}
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


// Socials Tab - full CRUD
const PLATFORM_OPTIONS = [
  { value: "facebook",  label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter",   label: "Twitter (X)" },
  { value: "linkedin",  label: "LinkedIn" },
  { value: "other",     label: "Other" },
];

function SocialsTab({ hubSlug }: { hubSlug: string }) {
  const t = useTranslations("HubManagement.socials");

  const [socials, setSocials]             = useState<SocialAccount[]>([]);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [editingIndex, setEditingIndex]   = useState<number | null>(null);

  // New-entry form state
  const [newPlatform, setNewPlatform] = useState("facebook");
  const [newUrl, setNewUrl]           = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Load existing accounts
  const loadSocials = async () => {
    setLoading(true);
    const res = await getHubSocials(hubSlug);

    if (res.success && Array.isArray(res.data)) {
      setSocials(res.data.map((s: any) => ({ platform: s.platform || "other", url: s.url || "" })));
    }
    setLoading(false);
  };

  useEffect(() => { loadSocials(); }, [hubSlug]);

  // Save the whole array
  const handleSave = async () => {
    let dataToSave = socials;
    const trimmedUrl = newUrl.trim();
    
    if (showAddForm && trimmedUrl) {
      dataToSave = [...socials, { platform: newPlatform, url: trimmedUrl }];
    }

    setSaving(true);
    const res = await updateHubSocials(hubSlug, dataToSave);
    if (res.success) {
      toast.success(t("saved") || "Social accounts saved!");
      if (showAddForm && trimmedUrl) {
        setSocials(dataToSave);
        setNewUrl("");
        setShowAddForm(false);
      }
    } else {
      toast.error(res.error || "Failed to save social accounts");
    }
    setSaving(false);
  };

  const handleAdd = () => {
    if (!newUrl.trim()) return;
    setSocials(prev => [...prev, { platform: newPlatform, url: newUrl.trim() }]);
    setNewUrl("");
    setNewPlatform("facebook");
    setShowAddForm(false);
  };

  const handleDelete = (idx: number) => {
    setSocials(prev => prev.filter((_, i) => i !== idx));
    if (editingIndex === idx) setEditingIndex(null);
  };

  const handleEditPlatform = (idx: number, val: string) => {
    setSocials(prev => prev.map((s, i) => i === idx ? { ...s, platform: val } : s));
  };

  const handleEditUrl = (idx: number, val: string) => {
    setSocials(prev => prev.map((s, i) => i === idx ? { ...s, url: val } : s));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold">{t("title")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
          </div>
          <button
            onClick={() => setShowAddForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {t("add")}
          </button>
        </div>

        {/* Add-new-entry form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              key="add-form"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="mb-6 p-4 border border-dashed border-primary/40 rounded-xl bg-primary/5 space-y-3"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("newAccount") || "New Social Account"}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={newPlatform}
                  onChange={e => setNewPlatform(e.target.value)}
                  className="px-3 py-2 border border-input rounded-xl bg-background text-sm w-40 shrink-0"
                >
                  {PLATFORM_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <input
                  type="url"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 border border-input rounded-xl bg-background text-sm"
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
                />
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Accounts list */}
        {loading ? (
          <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
        ) : socials.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-2xl text-center bg-muted/5">
            <Globe className="h-10 w-10 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground text-sm font-medium">{t("noAccounts") || "No social accounts added yet"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {socials.map((s, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 border border-border rounded-xl group hover:bg-muted/10 transition-colors">
                {editingIndex === idx ? (
                  // ── Edit mode row ──────────────────────────────────────
                  <>
                    <select
                      value={s.platform}
                      onChange={e => handleEditPlatform(idx, e.target.value)}
                      className="px-3 py-1.5 border border-input rounded-lg bg-background text-sm w-36 shrink-0"
                    >
                      {PLATFORM_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <input
                      type="url"
                      value={s.url}
                      onChange={e => handleEditUrl(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-input rounded-lg bg-background text-sm"
                    />
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  // ── View mode row ──────────────────────────────────────
                  <>
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                      s.platform === "facebook"  ? "bg-blue-100 text-blue-700" :
                      s.platform === "instagram" ? "bg-pink-100 text-pink-700" :
                      s.platform === "twitter"   ? "bg-muted text-foreground" :
                      s.platform === "linkedin"  ? "bg-sky-100 text-sky-700" :
                      "bg-primary/10 text-primary"
                    }`}>
                      {PLATFORM_OPTIONS.find(o => o.value === s.platform)?.label || s.platform}
                    </span>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm text-primary hover:underline truncate"
                      dir="ltr"
                    >
                      {s.url}
                    </a>
                    <button
                      onClick={() => setEditingIndex(idx)}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(idx)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Save button */}
        {!loading && (
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50 active:scale-95"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {t("save") || "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Offers Tab - functional form
function OffersTab({ hubSlug }: { hubSlug: string }) {
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const locale = useLocale();
  const t = useTranslations("HubManagement.offers");

  const [state, formAction] = useActionState(async (prevState: any, formData: FormData) => {
    if (editingOffer) {
      setIsUpdating(true);
      const res = await updateHubOffer(hubSlug, editingOffer.id, prevState, formData);
      setIsUpdating(false);
      if (res.success) {
        setEditingOffer(null);
        setShowForm(false);
        loadOffers();
      }
      return res;
    } else {
      const res = await addHubOffer(hubSlug, prevState, formData);
      if (res.success) {
        setShowForm(false);
        loadOffers();
      }
      return res;
    }
  }, null);

  const loadOffers = async () => {
    setLoading(true);
    const res = await getHubOffers(hubSlug, locale);
    if (res.success) setOffers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadOffers();
  }, [hubSlug, state]);

  const handleDelete = async (offerId: number) => {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    setDeletingId(offerId);
    const res = await deleteHubOffer(hubSlug, offerId);
    if (res.success) {
      toast.success("Offer deleted");
      loadOffers();
    } else {
      toast.error(res.error || "Failed to delete");
    }
    setDeletingId(null);
  };

  const handleEdit = (offer: any) => {
    setEditingOffer(offer);
    setShowForm(true);
    // Smooth scroll to form
    setTimeout(() => {
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }, 100);
  };

  const cancelEdit = () => {
    setEditingOffer(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold">{t("title")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("description")}</p>
          </div>
           <button onClick={() => {
            if (editingOffer) cancelEdit();
            else setShowForm(!showForm);
          }} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            {showForm ? t("cancel") : t("addOffer")}
          </button>
        </div>

        {showForm && (
          <form action={formAction} className="p-4 border border-border rounded-xl mb-6 space-y-4 bg-muted/20">
            {state?.error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{state.error}</div>}
            {state?.success && <div className="text-green-600 text-sm bg-green-50 p-2 rounded">{t("offerAdded")}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("titleEn")}</label>
                <input name="title_en" defaultValue={editingOffer?.title?.en || (typeof editingOffer?.title === 'string' ? '' : '')} required className="w-full px-4 py-2 border rounded-lg bg-background text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-end">{t("titleAr")}</label>
                <input name="title_ar" defaultValue={editingOffer?.title?.ar || (typeof editingOffer?.title === 'string' ? editingOffer.title : '')} required dir="rtl" className="w-full px-4 py-2 border rounded-lg bg-background text-right text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("descEn")}</label>
                <textarea name="description_en" defaultValue={editingOffer?.description?.en || ''} required className="w-full px-4 py-2 border rounded-lg bg-background resize-none text-sm" rows={2}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-end">{t("descAr")}</label>
                <textarea name="description_ar" defaultValue={editingOffer?.description?.ar || (typeof editingOffer?.description === 'string' ? editingOffer.description : '')} required dir="rtl" className="w-full px-4 py-2 border rounded-lg bg-background resize-none text-right text-sm" rows={2}></textarea>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("type")}</label>
                <select name="type" defaultValue={editingOffer?.type || "daily"} className="w-full px-4 py-2 border rounded-lg bg-background text-sm">
                  <option value="daily">{t("types.daily")}</option>
                  <option value="weekly">{t("types.weekly")}</option>
                  <option value="monthly">{t("types.monthly")}</option>
                  <option value="once">{t("types.once")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("price")}</label>
                <input name="price" type="number" defaultValue={editingOffer?.price} required className="w-full px-4 py-2 border rounded-lg bg-background text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("duration")}</label>
                <input name="duration" type="number" defaultValue={editingOffer?.duration} required className="w-full px-4 py-2 border rounded-lg bg-background text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("status") || "Status"}</label>
                <select name="status" defaultValue={editingOffer?.status || "active"} className="w-full px-4 py-2 border rounded-lg bg-background text-sm">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("startsAt") || "Starts At"}</label>
                <input name="starts_at" type="date" defaultValue={editingOffer?.starts_at ? editingOffer.starts_at.split(' ')[0] : ''} required className="w-full px-4 py-2 border rounded-lg bg-background text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-end">{t("endsAt") || "Ends At"}</label>
                <input name="ends_at" type="date" defaultValue={editingOffer?.ends_at ? editingOffer.ends_at.split(' ')[0] : ''} required className="w-full px-4 py-2 border rounded-lg bg-background text-sm" />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              {editingOffer && (
                <button type="button" onClick={cancelEdit} className="px-6 py-2.5 border border-border text-sm rounded-xl font-medium hover:bg-muted transition-colors">
                  {t("cancel")}
                </button>
              )}
              <button type="submit" disabled={isUpdating} className="px-8 py-2.5 bg-primary text-primary-foreground text-sm rounded-xl font-medium shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingOffer ? "Update Offer" : t("saveOffer")}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {loading ? (
             <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
          ) : offers.length > 0 ? (
            offers.map((offer) => (
              <div key={offer.id} className="flex items-center justify-between p-5 border border-border rounded-2xl hover:bg-muted/10 transition-colors group">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-lg">{typeof offer.title === 'string' ? offer.title : (offer.title?.[locale] || offer.title?.en || offer.title?.ar || "Offer")}</h4>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full">
                      {t(`types.${offer.type}`)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2 max-w-2xl">
                    {typeof offer.description === 'string' ? offer.description : (offer.description?.[locale] || offer.description?.en || offer.description?.ar || "")}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-3">
                    <div className="flex items-center text-green-600 font-bold">
                       <span className="text-xl">₪{offer.price}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                      <Clock className="h-3 w-3" />
                      <span>{offer.duration} {t("hours")}</span>
                    </div>
                    {offer.starts_at && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(offer.starts_at).toLocaleDateString('en-GB')}</span>
                      </div>
                    )}
                    {offer.ends_at && (
                      <div className="flex items-center gap-1.5 text-xs text-red-600/80 font-medium bg-red-50 px-2 py-1 rounded-md">
                        <Calendar className="h-3 w-3" />
                        <span>{t("expiresAt") || "Expires"}: {new Date(offer.ends_at).toLocaleDateString('en-GB')}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(offer)}
                    className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(offer.id)}
                    disabled={deletingId === offer.id}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 disabled:opacity-50"
                  >
                    {deletingId === offer.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="border border-dashed border-border rounded-2xl overflow-hidden py-16 flex flex-col items-center justify-center text-center bg-muted/5">
              <Tag className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
              <p className="font-medium text-muted-foreground">{t("noOffers")}</p>
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
      const result = await getPrivateHubBySlug(resolvedParams.id, locale);
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
    const result = await getPrivateHubBySlug(resolvedParams.id, locale);
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
