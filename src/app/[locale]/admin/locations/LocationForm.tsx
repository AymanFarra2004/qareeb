"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, Check, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

interface Location {
  id: number;
  name: string | { ar: string; en: string };
  slug: string;
  type: "governorate" | "city" | "area";
  parent_id: number | null;
}

interface LocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: Location | null;
  initialParentId?: number | null;
  locations: Location[]; // All locations for parent selection
  locale: string;
  locationAR: string;
  locationEN: string;
}

export default function LocationForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  initialParentId,
  locations,
  locale,
  locationAR,
  locationEN
}: LocationFormProps) {
  const t = useTranslations("AdminLocations");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nameAr, setNameAr] = useState(locationAR);
  const [nameEn, setNameEn] = useState(locationEN);
  const [type, setType] = useState<"governorate" | "city" | "area">("governorate");
  const [parentId, setParentId] = useState<number | null>(null);
  
  const [parentSearch, setParentSearch] = useState("");
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      if (typeof initialData.name === "object") {
        setNameAr(initialData.name.ar);
        setNameEn(initialData.name.en);
      } else {
        // Fallback if it's a string, though API usually returns objects for translatable fields
        setNameAr("");
        setNameEn(initialData.name);
      }
      setType(initialData.type);
      setParentId(initialData.parent_id);
    } else if (initialParentId) {
      setParentId(initialParentId);
      // Auto-set type based on parent logic
      const parent = locations.find(l => l.id === initialParentId);
      if (parent?.type === 'governorate') setType('city');
      else if (parent?.type === 'city') setType('area');
    } else {
      resetForm();
    }
  }, [initialData, initialParentId, isOpen, locations]);

  // Body Scroll Lock
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Click Outside to Close Dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsParentDropdownOpen(false);
      }
    }
    if (isParentDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isParentDropdownOpen]);

  const resetForm = () => {
    setNameAr("");
    setNameEn("");
    setType("governorate");
    setParentId(null);
    setError(null);
  };

  const handleTypeChange = (newType: any) => {
    setType(newType);
    setParentId(null); // Reset parent when type changes as validation changes
    setParentSearch("");
  };

  const getName = (loc: Location) => {
    if (typeof loc.name === "string") return loc.name;
    return locale === "en" ? loc.name.en : loc.name.ar;
  };

  // Hierarchical Validation Logic
  const filteredParents = locations.filter(loc => {
    // A location cannot be its own parent
    if (initialData && loc.id === initialData.id) return false;

    if (type === "city") {
      return loc.type === "governorate";
    }
    if (type === "area") {
      return loc.type === "city";
    }
    return false; // Governorates have no parents
  }).filter(loc => 
    getName(loc).toLowerCase().includes(parentSearch.toLowerCase())
  );

  const selectedParent = locations.find(l => l.id === parentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("name[ar]", nameAr);
    formData.append("name[en]", nameEn);
    formData.append("type", type);
    if (parentId) formData.append("parent_id", parentId.toString());

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-background w-full max-w-lg rounded-3xl shadow-2xl border border-border max-h-[90vh] overflow-y-auto scrollbar-thin overflow-x-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <h2 className="text-xl font-bold text-foreground">
            {initialData ? t("editLocation") : t("addLocation")}
          </h2>
          <button 
            onClick={onClose}
            className="cursor-pointer p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3 text-destructive text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground px-1">{t("nameAr")}</label>
              <input
                type="text"
                required
                dir="rtl"
                defaultValue={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: الشمال"
                className="w-full px-4 py-3 bg-muted/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            {/* <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground px-1">{t("nameEn")}</label>
              <input
                type="text"
                dir="ltr"
                defaultValue={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. North Gaza"
                className="w-full px-4 py-3 bg-muted/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div> */}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground px-1">{t("type")}</label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-4 py-3 bg-muted/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
            >
              <option value="governorate">{t("governorate")}</option>
              <option value="city">{t("city")}</option>
              <option value="area">{t("area")}</option>
            </select>
          </div>

          {type !== "governorate" && (
            <div className="space-y-2 relative">
              <label className="text-sm font-semibold text-foreground px-1">{t("parent")}</label>
              
              <div 
                onClick={() => setIsParentDropdownOpen(!isParentDropdownOpen)}
                className="w-full px-4 py-3 bg-muted/50 border border-border rounded-2xl cursor-pointer flex items-center justify-between"
              >
                <span className={parentId ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {selectedParent ? getName(selectedParent) : t("selectParent")}
                </span>
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>

              <AnimatePresence>
                {isParentDropdownOpen && (
                  <div className="relative">
                    <motion.div
                      ref={dropdownRef}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 top-full left-0 right-0 mt-2 bg-background border border-border rounded-2xl shadow-xl max-h-[200px] overflow-hidden flex flex-col"
                    >
                      <div className="p-3 border-b border-border">
                        <input
                          type="text"
                          autoFocus
                          placeholder={t("searchPlaceholder")}
                          value={parentSearch}
                          onChange={(e) => setParentSearch(e.target.value)}
                          className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="overflow-y-auto">
                        {filteredParents.length > 0 ? (
                          filteredParents.map(loc => (
                            <div
                              key={loc.id}
                              onClick={() => {
                                setParentId(loc.id);
                                setIsParentDropdownOpen(false);
                                setParentSearch("");
                              }}
                              className="px-4 py-3 hover:bg-muted transition-colors cursor-pointer flex items-center justify-between text-sm"
                            >
                              <span>{getName(loc)}</span>
                              {parentId === loc.id && <Check className="h-4 w-4 text-primary" />}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            {t("noLocations")}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
              
              {/* Fallback hidden input for standard form submission if needed, 
                  though we use the state object in our manual handler */}
              
                <p className="text-[10px] text-destructive px-1 italic">
                  * {t("parent")} is required for {t(type)}
                </p>
              
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 px-6 py-3 border border-border text-foreground font-semibold rounded-2xl hover:bg-muted transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (type !== 'governorate' && !parentId)}
              className="cursor-pointer flex-1 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-2xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {isSubmitting ? "..." : initialData ? t("save") : t("addLocation")}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
