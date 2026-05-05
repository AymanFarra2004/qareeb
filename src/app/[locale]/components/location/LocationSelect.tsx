'use client'

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Search, Check, ChevronDown, X } from "lucide-react";
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { CONFIG } from '@/src/config';


type Location = {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  type: string;
  children?: Location[];
}

interface SearchableSelectProps {
  label: string;
  options: { id: string | number; name: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
}

function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  required = false,
  disabled = false,
  error = false
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => String(opt.id) === String(value));
  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          flex items-center gap-3 w-full px-4 py-3 border rounded-xl bg-background text-sm transition-all cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed bg-muted/50' : 'hover:border-primary/50 focus:ring-2 focus:ring-primary/20'}
          ${isOpen ? 'border-primary ring-2 ring-primary/20 shadow-sm' : error ? 'border-destructive ring-1 ring-destructive/20' : 'border-input'}
        `}
      >
        <MapPin className={`h-5 w-5 shrink-0 ${isOpen ? 'text-primary' : 'text-muted-foreground'}`} />
        <span className={`flex-1 truncate ${!selectedOption ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full bg-background border border-border rounded-xl shadow-xl overflow-hidden mt-1"
          >
            <div className="p-2 border-b border-border bg-muted/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full pl-9 pr-8 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto p-1 scrollbar-thin">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => {
                      onChange(String(option.id));
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`
                      flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors
                      ${String(value) === String(option.id) 
                        ? 'bg-primary/10 text-primary font-semibold' 
                        : 'text-foreground hover:bg-muted'}
                    `}
                  >
                    <span className="truncate">{option.name}</span>
                    {String(value) === String(option.id) && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                  </div>
                ))
              ) : (
                <div className="py-6 px-4 text-center text-sm text-muted-foreground">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LocationSelect({ initialValue, onChange, error }: { initialValue?: string | number, onChange?: (val: string) => void, error?: boolean }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations("NewHub");
  const locale = useLocale();
  
  const [governorateId, setGovernorateId] = useState<string>("");
  const [cityId, setCityId] = useState<string>("");
  const [areaId, setAreaId] = useState<string>("");

  // Track changes and notify parent
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const finalId = areaId || cityId || governorateId || "";
    if (onChangeRef.current) {
      onChangeRef.current(finalId);
    }
  }, [areaId, cityId, governorateId]);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${CONFIG.API_URL}/api/v1/locations?lang=${locale}`)
      .then(res => res.json())
      .then(data => {
        if(data.status === 'success') {
          setLocations(data.data);
        }
      })
      .catch(err => console.error("Failed to fetch locations", err))
      .finally(() => setIsLoading(false));
  }, [locale]);

  // Handle initial value pre-population
  useEffect(() => {
    if (!isLoading && locations.length > 0 && initialValue) {
      const targetId = Number(initialValue);
      const target = locations.find(l => l.id === targetId);
      
      if (target) {
        if (target.type === 'area') {
          setAreaId(String(target.id));
          setCityId(String(target.parent_id));
          const city = locations.find(l => l.id === target.parent_id);
          if (city) setGovernorateId(String(city.parent_id));
        } else if (target.type === 'city') {
          setCityId(String(target.id));
          setGovernorateId(String(target.parent_id));
        } else if (target.type === 'governorate') {
          setGovernorateId(String(target.id));
        }
      }
    }
  }, [isLoading, locations, initialValue]);

  const governorates = locations.filter(l => l.parent_id === null && l.type === 'governorate');
  const cities = governorateId ? locations.filter(l => l.parent_id === Number(governorateId) && l.type === 'city') : [];
  const areas = cityId ? locations.filter(l => l.parent_id === Number(cityId) && l.type === 'area') : [];

  // Determine final location_id (prioritize most specific area, then city, then governorate)
  const finalLocationId = areaId || cityId || governorateId || "";

  if (isLoading) {
    return (
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">{t("locationSelection")}</label>
        <div className="flex items-center gap-2 text-muted-foreground p-3 border border-input rounded-xl bg-muted/50">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm">{t("loadingLocations")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl p-6 border border-border bg-muted/5 relative shadow-sm">
      <input type="hidden" name="location_id" value={finalLocationId} />
      
      <SearchableSelect
        label={t("governorate")}
        options={governorates}
        value={governorateId}
        onChange={(val) => {
          setGovernorateId(val);
          setCityId("");
          setAreaId("");
        }}
        placeholder={t("selectGovernorate")}
        searchPlaceholder={t("searchPlaceholder") || "Search governorate..."}
        required
        error={error}
      />

      {cities.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <SearchableSelect
            label={t("city")}
            options={cities}
            value={cityId}
            onChange={(val) => {
              setCityId(val);
              setAreaId("");
            }}
            placeholder={t("selectCity")}
            searchPlaceholder={t("searchPlaceholder") || "Search city..."}
            required
            error={error}
          />
        </motion.div>
      )}

      {areas.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <SearchableSelect
            label={t("area")}
            options={areas}
            value={areaId}
            onChange={(val) => setAreaId(val)}
            placeholder={t("selectArea")}
            searchPlaceholder={t("searchPlaceholder") || "Search area..."}
            required
            error={error}
          />
        </motion.div>
      )}
    </div>
  );
}

