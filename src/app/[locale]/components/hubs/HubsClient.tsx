"use client";

import { useState, useMemo, useEffect } from "react";
import { Filter, Search, MapPin, Zap, Wifi, X } from "lucide-react";
import { HubCard } from "../general/HubCard";
import { useTranslations } from "next-intl";

type HubsClientProps = {
  hubs: any[];
};

export default function HubsClient({ hubs }: HubsClientProps) {
  const t = useTranslations("HubsPage");
  const tGov = useTranslations("Hero.filters.governorates");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGovernorates, setSelectedGovernorates] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Fixed standard Gaza governorates with translations
  const governorateOptions = [
    { id: "northGaza", name: tGov("northGaza"), canonical: "North Gaza" },
    { id: "gazaCity", name: tGov("gazaCity"), canonical: "Gaza" },
    { id: "deirAlBalah", name: tGov("deirAlBalah"), canonical: "Deir al-Balah" },
    { id: "khanYunis", name: tGov("khanYunis"), canonical: "Khan Yunis" },
    { id: "rafah", name: tGov("rafah"), canonical: "Rafah" },
  ];

  // Derive unique services from actual hub data
  const services = useMemo(() => {
    const set = new Set<string>();
    hubs.forEach((h) => (h.services || []).forEach((s: string) => set.add(s)));
    return Array.from(set).sort().map((name) => ({
      name,
      icon: name.toLowerCase().includes("internet") || name.toLowerCase().includes("wifi") || name.toLowerCase().includes("web")
        ? <Wifi className="h-3 w-3 inline me-1" />
        : name.toLowerCase().includes("electric") || name.toLowerCase().includes("power") || name.toLowerCase().includes("solar")
        ? <Zap className="h-3 w-3 inline me-1" />
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
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameMatch = (hub.name || "").toLowerCase().includes(q);
        const descMatch = (hub.description || "").toLowerCase().includes(q);
        const locMatch = (hub.location || "").toLowerCase().includes(q);
        if (!nameMatch && !descMatch && !locMatch) return false;
      }

      if (selectedGovernorates.length > 0) {
        const govNorm = (hub.governorate || "").toLowerCase();
        const hasGovMatch = selectedGovernorates.some(
          (g) => govNorm.includes(g.toLowerCase()) || g.toLowerCase().includes(govNorm)
        );
        if (!hasGovMatch) return false;
      }

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGovernorates, selectedServices]);

  const totalPages = Math.ceil(filteredHubs.length / itemsPerPage);
  const paginatedHubs = filteredHubs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filters Sidebar */}
      <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm sticky top-24">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <Filter className="h-5 w-5" />
              {t("filters")}
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
              >
                <X className="h-3 w-3" />
                {t("clearAll")} ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Search */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-medium text-foreground">{t("searchName")}</label>
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 ps-9 pe-4 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          {/* Governorate Filter */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {t("governorate")}
            </label>
            <div className="space-y-2">
              {governorateOptions.map((gov) => (
                <div key={gov.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <input
                    type="checkbox"
                    id={`gov-${gov.id}`}
                    checked={selectedGovernorates.includes(gov.canonical)}
                    onChange={() => toggleGovernorate(gov.canonical)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <label
                    htmlFor={`gov-${gov.id}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {gov.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Services Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" /> {t("essentialServices")}
            </label>
            <div className="space-y-2">
              {services.map((service) => (
                <div key={service.name} className="flex items-center space-x-2 rtl:space-x-reverse">
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
            {t("showing", { count: filteredHubs.length, total: hubs.length })}
          </p>
          <select className="h-9 w-44 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <option>{t("mostRelevant")}</option>
            <option>{t("priceLow")}</option>
            <option>{t("recentlyAdded")}</option>
          </select>
        </div>

        {paginatedHubs.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedHubs.map((hub: any) => (
                <HubCard key={hub.id} hub={hub} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-input bg-background rounded-md text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t("previous", { fallback: "Previous" })}
                </button>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted bg-background border border-input'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-input bg-background rounded-md text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t("next", { fallback: "Next" })}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-border rounded-2xl bg-muted/10">
            <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">{t("noHubsFound")}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t("noHubsTry")}
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {t("clearFilters")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
