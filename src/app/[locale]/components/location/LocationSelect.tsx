'use client'

import { useState, useEffect } from 'react';
import { MapPin, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from 'next-intl';

type Location = {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  type: string;
  children?: Location[];
}

export function LocationSelect() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations("NewHub");
  const locale = useLocale();
  
  const [governorateId, setGovernorateId] = useState<string>("");
  const [cityId, setCityId] = useState<string>("");
  const [areaId, setAreaId] = useState<string>("");

  const langParams: Record<string, string> = {
    ar: 'lang=ar',
    en: 'lang=en',
  };

  useEffect(() => {
    setIsLoading(true);
    fetch(`https://karam.idreis.net/api/v1/locations?lang=${locale}`)
      .then(res => res.json())
      .then(data => {
        if(data.status === 'success') {
          setLocations(data.data);
        }
      })
      .catch(err => console.error("Failed to fetch locations", err))
      .finally(() => setIsLoading(false));
  }, [locale]);

  const governorates = locations.filter(l => l.parent_id === null && l.type === 'governorate');
  const cities = governorateId ? locations.filter(l => l.parent_id === Number(governorateId) && l.type === 'city') : [];
  const areas = cityId ? locations.filter(l => l.parent_id === Number(cityId) && l.type === 'area') : [];

  // Determine final location_id (prioritize most specific area, then city, then governorate)
  const finalLocationId = areaId || cityId || governorateId || "";

  if (isLoading) {
    return (
      <div>
        <label className="block text-sm font-medium text-foreground">{t("locationSelection")}</label>
        <div className="mt-1 flex items-center gap-2 text-muted-foreground p-3 border border-input rounded-xl bg-muted/50">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">{t("loadingLocations")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl p-4 border border-input bg-muted/10 relative">
      <input type="hidden" name="location_id" value={finalLocationId} />
      
      <div>
        <label htmlFor="governorate" className="block text-sm font-medium text-foreground">{t("governorate")}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 ps-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </div>
          <select
            id="governorate"
            value={governorateId}
            onChange={(e) => {
              setGovernorateId(e.target.value);
              setCityId(""); // reset city
              setAreaId(""); // reset area
            }}
            required
            className="appearance-none block w-full ps-10 pe-8 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm transition-colors"
          >
            <option value="">{t("selectGovernorate")}</option>
            {governorates.map(gov => (
              <option key={gov.id} value={gov.id}>{gov.name}</option>
            ))}
          </select>
        </div>
      </div>

      {cities.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label htmlFor="city" className="block text-sm font-medium text-foreground">{t("city")}</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 ps-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-muted-foreground" />
            </div>
            <select
              id="city"
              value={cityId}
              onChange={(e) => {
                setCityId(e.target.value);
                setAreaId(""); // reset area
              }}
              required
              className="appearance-none block w-full ps-10 pe-8 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm transition-colors"
            >
              <option value="">{t("selectCity")}</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {areas.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label htmlFor="area" className="block text-sm font-medium text-foreground">{t("area")}</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 ps-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-muted-foreground" />
            </div>
            <select
              id="area"
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              required
              className="appearance-none block w-full ps-10 pe-8 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm transition-colors"
            >
              <option value="">{t("selectArea")}</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
