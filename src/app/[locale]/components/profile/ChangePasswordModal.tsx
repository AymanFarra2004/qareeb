"use client";

import { useState } from "react";
import { X, Loader2, Lock, ShieldCheck } from "lucide-react";
import { changePassword } from "@/src/actions/auth";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations("Profile");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.current_password) newErrors.current_password = t("currentPasswordPlaceholder");
    if (!formData.password) newErrors.password = t("newPasswordPlaceholder");
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = t("passwordsDoNotMatch");
    }
    if (formData.password && formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    const res = await changePassword(formData);
    setLoading(false);

    if (res.success) {
      toast.success(t("changePasswordSuccess"));
      onClose();
    } else {
      toast.error(res.error || t("changePasswordError"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-background w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border/50">
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            {t("changePassword")}
          </h2>
          <button onClick={onClose} className="cursor-pointer p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold flex items-center gap-2 px-1">
              <Lock className="h-4 w-4 text-muted-foreground" />
              {t("currentPassword")}
            </label>
            <input 
              type="password" 
              value={formData.current_password} 
              onChange={e => setFormData({...formData, current_password: e.target.value})}
              placeholder={t("currentPasswordPlaceholder")}
              className={`w-full px-4 py-3 border rounded-2xl bg-background text-sm outline-none focus:ring-2 transition-all ${
                errors.current_password ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/20 focus:border-primary'
              }`}
            />
            {errors.current_password && <p className="text-red-500 text-xs mt-1 px-1">{errors.current_password}</p>}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold flex items-center gap-2 px-1">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              {t("newPassword")}
            </label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})}
              placeholder={t("newPasswordPlaceholder")}
              className={`w-full px-4 py-3 border rounded-2xl bg-background text-sm outline-none focus:ring-2 transition-all ${
                errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/20 focus:border-primary'
              }`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1 px-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold flex items-center gap-2 px-1">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              {t("confirmNewPassword")}
            </label>
            <input 
              type="password" 
              value={formData.password_confirmation} 
              onChange={e => setFormData({...formData, password_confirmation: e.target.value})}
              placeholder={t("confirmPasswordPlaceholder")}
              className={`w-full px-4 py-3 border rounded-2xl bg-background text-sm outline-none focus:ring-2 transition-all ${
                errors.password_confirmation ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-primary/20 focus:border-primary'
              }`}
            />
            {errors.password_confirmation && <p className="text-red-500 text-xs mt-1 px-1">{errors.password_confirmation}</p>}
          </div>

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
