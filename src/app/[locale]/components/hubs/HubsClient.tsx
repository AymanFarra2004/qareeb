"use client";

import { useState, useMemo } from "react";
import { Filter, Search, MapPin, Zap, Wifi, X } from "lucide-react";
import { HubCard } from "../general/HubCard";

type HubsClientProps = {
  hubs: any[];
};

export default function HubsClient({ hubs }: HubsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGovernorates, setSelectedGovernorates] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Derive unique governorates from actual hub data
  const governorates = useMemo(() => {
    const set = new Set<string>();
    hubs.forEach((h) => { if (h.governorate) set.add(h.governorate); });
    return Array.from(set).sort();
  }, [hubs]);

  // Derive unique services from actual hub data
  const services = useMemo(() => {
    const set = new Set<string>();
    hubs.forEach((h) => (h.services || []).forEach((s: string) => set.add(s)));
    return Array.from(set).sort().map((name) => ({
      name,
      icon: name.toLowerCase().includes("internet") || name.toLowerCase().includes("wifi") || name.toLowerCase().includes("web")
        ? <Wifi className="h-3 w-3 inline mr-1" />
        : name.toLowerCase().includes("electric") || name.toLowerCase().includes("power") || name.toLowerCase().includes("solar")
        ? <Zap className="h-3 w-3 inline mr-1" />
        : null,
    }));
  }, [hubs]);

  const toggleGovernorate = (gov: string) => {
    setSelectedGovernorates((prev) =>
      prev.includes(gov) ? prev.filter((g) => g !== gov) : [...prev, gov]
    );
  };

  const toggleService = (srv: string) => {
    setSelectedServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGovernorates([]);
    setSelectedServices([]);
  };

  const activeFilterCount = selectedGovernorates.length + selectedServices.length + (searchQuery ? 1 : 0);

  const filteredHubs = useMemo(() => {
    return hubs.filter((hub) => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameMatch = (hub.name || "").toLowerCase().includes(q);
        const descMatch = (hub.description || "").toLowerCase().includes(q);
        const locMatch = (hub.location || "").toLowerCase().includes(q);
        if (!nameMatch && !descMatch && !locMatch) return false;
      }

      // Governorate filter (partial, case-insensitive)
      if (selectedGovernorates.length > 0) {
        const govNorm = (hub.governorate || "").toLowerCase();
        const hasGovMatch = selectedGovernorates.some(
          (g) => govNorm.includes(g.toLowerCase()) || g.toLowerCase().includes(govNorm)
        );
        if (!hasGovMatch) return false;
      }

      // Services filter (partial, case-insensitive)
      if (selectedServices.length > 0) {
        const hubServices: string[] = hub.services || [];
        const hasMatch = selectedServices.some((sel) =>
          hubServices.some((s) => s.toLowerCase().includes(sel.toLowerCase()))
        );
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [hubs, searchQuery, selectedGovernorates, selectedServices]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filters Sidebar */}
      <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm sticky top-24">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <Filter className="h-5 w-5" />
              Filters
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
              >
                <X className="h-3 w-3" />
                Clear all ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Search */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-medium text-foreground">Search Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="e.g. Al-Bahr Connection"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          {/* Governorate Filter */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Governorate
            </label>
            <div className="space-y-2">
              {governorates.map((gov) => (
                <div key={gov} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`gov-${gov}`}
                    checked={selectedGovernorates.includes(gov)}
                    onChange={() => toggleGovernorate(gov)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <label
                    htmlFor={`gov-${gov}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {gov}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Services Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" /> Essential Services
            </label>
            <div className="space-y-2">
              {services.map((service) => (
                <div key={service.name} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`srv-${service.name}`}
                    checked={selectedServices.includes(service.name)}
                    onChange={() => toggleService(service.name)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <label
                    htmlFor={`srv-${service.name}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {service.icon} {service.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Results */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredHubs.length} of {hubs.length} results
          </p>
          <select className="h-9 w-40 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <option>Most Relevant</option>
            <option>Price: Low to High</option>
            <option>Recently Added</option>
          </select>
        </div>

        {filteredHubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredHubs.map((hub: any) => (
              <HubCard key={hub.id} hub={hub} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-border rounded-2xl bg-muted/10">
            <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No hubs found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
