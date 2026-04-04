'use client'

import { useState, useEffect } from 'react';
import { MapPin, Loader2 } from "lucide-react";

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
  
  const [governorateId, setGovernorateId] = useState<string>("");
  const [cityId, setCityId] = useState<string>("");
  const [areaId, setAreaId] = useState<string>("");

  useEffect(() => {
    setIsLoading(true);
    fetch('https://karam.idreis.net/api/v1/location')
      .then(res => res.json())
      .then(data => {
        if(data.status === 'success') {
          setLocations(data.data);
        }
      })
      .catch(err => console.error("Failed to fetch locations", err))
      .finally(() => setIsLoading(false));
  }, []);

  const governorates = locations.filter(l => l.parent_id === null && l.type === 'governorate');
  const cities = governorateId ? locations.filter(l => l.parent_id === Number(governorateId) && l.type === 'city') : [];
  const areas = cityId ? locations.filter(l => l.parent_id === Number(cityId) && l.type === 'area') : [];

  // Determine final location_id (prioritize most specific area, then city, then governorate)
  const finalLocationId = areaId || cityId || governorateId || "";

  if (isLoading) {
    return (
      <div>
        <label className="block text-sm font-medium text-foreground">Location</label>
        <div className="mt-1 flex items-center gap-2 text-muted-foreground p-3 border border-input rounded-xl bg-muted/50">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading locations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl p-4 border border-input bg-muted/10 relative">
      <input type="hidden" name="location_id" value={finalLocationId} />
      
      <div>
        <label htmlFor="governorate" className="block text-sm font-medium text-foreground">Governorate</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
            className="appearance-none block w-full pl-10 pr-8 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm transition-colors"
          >
            <option value="">Select Governorate</option>
            {governorates.map(gov => (
              <option key={gov.id} value={gov.id}>{gov.name}</option>
            ))}
          </select>
        </div>
      </div>

      {cities.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label htmlFor="city" className="block text-sm font-medium text-foreground">City</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
              className="appearance-none block w-full pl-10 pr-8 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm transition-colors"
            >
              <option value="">Select City</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {areas.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <label htmlFor="area" className="block text-sm font-medium text-foreground">Area</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-muted-foreground" />
            </div>
            <select
              id="area"
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              required
              className="appearance-none block w-full pl-10 pr-8 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm transition-colors"
            >
              <option value="">Select Area</option>
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
