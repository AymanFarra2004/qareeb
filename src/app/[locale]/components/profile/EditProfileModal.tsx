"use client";

import { useState, useEffect } from "react";
import { X, Loader2, User, Mail, Phone, MapPin, Shield, Lock } from "lucide-react";
import { updateUserProfile } from "@/src/actions/auth";
import toast from "react-hot-toast";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/src/i18n/routing";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "@/src/store/authSlice";

interface Location {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  type: string;
}

export function EditProfileModal({ 
  profile, 
  onClose,
  onOpenPasswordModal 
}: { 
  profile: any, 
  onClose: () => void,
  onOpenPasswordModal?: () => void
}) {
  const t = useTranslations("Profile");
  const tNewHub = useTranslations("NewHub");
  const locale = useLocale();
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: any) => state.auth?.user);
  
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    role: profile?.role || "user",
    location_id: profile?.location?.id || profile?.location_id || "",
  });
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Location hierarchical state
  const [governorateId, setGovernorateId] = useState<string>("");
  const [cityId, setCityId] = useState<string>("");
  const [areaId, setAreaId] = useState<string>("");

  useEffect(() => {
    setIsLoadingLocations(true);
    fetch(`https://karam.idreis.net/api/v1/locations?lang=${locale}`)
      .then(res => res.json())
      .then(data => {
        if(data.status === 'success') {
          setLocations(data.data);
          
          // Try to pre-select locations based on profile.location_id
          const currentId = profile?.location?.id || profile?.location_id;
          if (currentId) {
            const locs = data.data as Location[];
            const currentLoc = locs.find(l => l.id === currentId);
            if (currentLoc) {
              if (currentLoc.type === 'area') {
                setAreaId(String(currentLoc.id));
                const city = locs.find(l => l.id === currentLoc.parent_id);
                if (city) {
                  setCityId(String(city.id));
                  const gov = locs.find(l => l.id === city.parent_id);
                  if (gov) setGovernorateId(String(gov.id));
                }
              } else if (currentLoc.type === 'city') {
                setCityId(String(currentLoc.id));
                const gov = locs.find(l => l.id === currentLoc.parent_id);
                if (gov) setGovernorateId(String(gov.id));
              } else if (currentLoc.type === 'governorate') {
                setGovernorateId(String(currentLoc.id));
              }
            }
          }
        }
      })
      .catch(err => console.error("Failed to fetch locations", err))
      .finally(() => setIsLoadingLocations(false));
  }, [locale, profile]);

  const governorates = locations.filter(l => l.parent_id === null && l.type === 'governorate');
  const cities = governorateId ? locations.filter(l => l.parent_id === Number(governorateId) && l.type === 'city') : [];
  const areas = cityId ? locations.filter(l => l.parent_id === Number(cityId) && l.type === 'area') : [];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (formData.phone && !/^\+?\d{8,15}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = "Invalid phone format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    
    const finalLocationId = areaId || cityId || governorateId;
    
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      location_id: finalLocationId ? Number(finalLocationId) : null,
    };

    const res = await updateUserProfile(payload);
    
    setLoading(false);
    if (res.success) {
      // Update Redux store immediately so the Dashboard nav link
      // and any role-gated UI reflects the new role without logout/login.
      dispatch(loginSuccess({
        ...currentUser,
        name: formData.name,
        email: formData.email,
        role: formData.role,
      }));
      toast.success(t("updatedSuccess"));
      router.refresh();
      onClose();
    } else {
      toast.error(res.error || t("updatedError"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-background w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border/50">
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {t("editProfile")}
          </h2>
          <button onClick={onClose} className="cursor-pointer p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold flex items-center gap-2 px-1">
              <User className="h-4 w-4 text-muted-foreground" />
              {t("name")}
            </label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              className={`w-full px-4 py-3 border rounded-2xl bg-background text-sm outline-none focus:ring-2 transition-all ${
                errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/20 focus:border-primary'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 px-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold flex items-center gap-2 px-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {t("email")}
            </label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})}
              className={`w-full px-4 py-3 border rounded-2xl bg-background text-sm outline-none focus:ring-2 transition-all ${
                errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/20 focus:border-primary'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 px-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold flex items-center gap-2 px-1">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {t("phone")}
            </label>
            <input 
              type="tel" 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})}
              placeholder="e.g. +970591234567"
              className={`w-full px-4 py-3 border rounded-2xl bg-background text-sm outline-none focus:ring-2 transition-all ${
                errors.phone ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/20 focus:border-primary'
              }`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1 px-1">{errors.phone}</p>}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold flex items-center gap-2 px-1">
              <Shield className="h-4 w-4 text-muted-foreground" />
              {t("role")}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-center gap-2 p-3 border rounded-2xl cursor-pointer transition-all ${formData.role === 'user' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted/30'}`}>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  className="hidden"
                  checked={formData.role === 'user'}
                  onChange={() => setFormData({...formData, role: 'user'})}
                />
                <span className="text-sm font-medium">{t("roles.user")}</span>
              </label>
              <label className={`flex items-center justify-center gap-2 p-3 border rounded-2xl cursor-pointer transition-all ${formData.role === 'hub_owner' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted/30'}`}>
                <input
                  type="radio"
                  name="role"
                  value="hub_owner"
                  className="hidden"
                  checked={formData.role === 'hub_owner'}
                  onChange={() => setFormData({...formData, role: 'hub_owner'})}
                />
                <span className="text-sm font-medium">{t("roles.hub_owner")}</span>
              </label>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3 p-4 rounded-2xl border border-border/60 bg-muted/10">
            <label className="text-sm font-bold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {t("location")}
            </label>
            
            {isLoadingLocations ? (
              <div className="flex items-center gap-2 text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{tNewHub("loadingLocations")}</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Governorate */}
                <select
                  value={governorateId}
                  onChange={(e) => {
                    setGovernorateId(e.target.value);
                    setCityId("");
                    setAreaId("");
                  }}
                  className="cursor-pointer w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">{tNewHub("selectGovernorate")}</option>
                  {governorates.map(gov => (
                    <option key={gov.id} value={gov.id}>{gov.name}</option>
                  ))}
                </select>

                {/* City */}
                {cities.length > 0 && (
                  <select
                    value={cityId}
                    onChange={(e) => {
                      setCityId(e.target.value);
                      setAreaId("");
                    }}
                    className="cursor-pointer w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm animate-in fade-in slide-in-from-top-1 duration-200"
                  >
                    <option value="">{tNewHub("selectCity")}</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                )}

                {/* Area */}
                {areas.length > 0 && (
                  <select
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    className="cursor-pointer w-full px-4 py-2.5 border border-border rounded-xl bg-background text-sm animate-in fade-in slide-in-from-top-1 duration-200"
                  >
                    <option value="">{tNewHub("selectArea")}</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>
          
          {/* Change Password Link */}
          {!profile?.google_id && onOpenPasswordModal && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={onOpenPasswordModal}
                className="cursor-pointer text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-2 py-2 px-4 rounded-xl hover:bg-primary/5 transition-all"
              >
                <Lock className="h-4 w-4" />
                {t("changePassword")}
              </button>
            </div>
          )}
          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer flex-1 px-4 py-3 border border-border rounded-2xl text-sm font-semibold hover:bg-muted transition-all active:scale-95 disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="cursor-pointer flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-semibold hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
