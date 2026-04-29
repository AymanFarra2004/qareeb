"use client";

import { useState, useMemo, useEffect } from "react";
import { Filter, Search, MapPin, X, ChevronRight, Loader2 } from "lucide-react";
import { HubCard } from "../general/HubCard";
import { useTranslations, useLocale } from "next-intl";
import { CONFIG } from "@/src/config";


type HubsClientProps = {
  hubs: any[];
};

type Location = {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  type: string;
};

export default function HubsClient({ hubs }: HubsClientProps) {
  const t = useTranslations("HubsPage");
  const locale = useLocale();

  // ── State ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Location hierarchy state
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);

  const [selectedGovernorateId, setSelectedGovernorateId] = useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);

  // ── Fetch locations from API ─────────────────────────────────────────────
  useEffect(() => {
    setLocationsLoading(true);
    fetch(`${CONFIG.API_URL}/api/v1/locations?lang=${locale}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setLocations(data.data);
        }
      })
      .catch((err) => console.error("Failed to fetch locations", err))
      .finally(() => setLocationsLoading(false));
  }, [locale]);

  // ── Derived location lists ───────────────────────────────────────────────
  const governorates = useMemo(
    () => locations.filter((l) => l.parent_id === null && l.type === "governorate"),
    [locations]
  );

  const cities = useMemo(
    () =>
      selectedGovernorateId
        ? locations.filter(
            (l) => l.parent_id === selectedGovernorateId && l.type === "city"
          )
        : [],
    [locations, selectedGovernorateId]
  );

  const areas = useMemo(
    () =>
      selectedCityId
        ? locations.filter(
            (l) => l.parent_id === selectedCityId && l.type === "area"
          )
        : [],
    [locations, selectedCityId]
  );

  // ── All IDs that fall under the selected location ────────────────────────
  /**
   * Build a set of all location IDs that match the current selection.
   * - If an area is selected → only that area.
   * - If a city is selected (no area) → that city + all its children areas.
   * - If a governorate is selected (no city) → that gov + all cities under it + all areas under those cities.
   * - If nothing selected → empty set (show all).
   */
  const selectedLocationIds = useMemo<Set<number>>(() => {
    const ids = new Set<number>();

    if (selectedAreaId) {
      ids.add(selectedAreaId);
      return ids;
    }

    if (selectedCityId) {
      ids.add(selectedCityId);
      // add child areas of this city
      locations
        .filter((l) => l.parent_id === selectedCityId && l.type === "area")
        .forEach((a) => ids.add(a.id));
      return ids;
    }

    if (selectedGovernorateId) {
      ids.add(selectedGovernorateId);
      const childCities = locations.filter(
        (l) => l.parent_id === selectedGovernorateId && l.type === "city"
      );
      childCities.forEach((c) => {
        ids.add(c.id);
        locations
          .filter((l) => l.parent_id === c.id && l.type === "area")
          .forEach((a) => ids.add(a.id));
      });
    }

    return ids;
  }, [locations, selectedGovernorateId, selectedCityId, selectedAreaId]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const selectGovernorate = (id: number) => {
    setSelectedGovernorateId((prev) => (prev === id ? null : id));
    setSelectedCityId(null);
    setSelectedAreaId(null);
  };

  const selectCity = (id: number) => {
    setSelectedCityId((prev) => (prev === id ? null : id));
    setSelectedAreaId(null);
  };

  const selectArea = (id: number) => {
    setSelectedAreaId((prev) => (prev === id ? null : id));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGovernorateId(null);
    setSelectedCityId(null);
    setSelectedAreaId(null);
  };

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (selectedGovernorateId ? 1 : 0) +
    (selectedCityId ? 1 : 0) +
    (selectedAreaId ? 1 : 0);

  // ── Filtering ─────────────────────────────────────────────────────────────
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

      // Location filter
      if (selectedLocationIds.size > 0) {
        const hubLocationId = hub.locationId ? Number(hub.locationId) : null;
        if (!hubLocationId || !selectedLocationIds.has(hubLocationId)) {
          return false;
        }
      }

      return true;
    });
  }, [hubs, searchQuery, selectedLocationIds]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLocationIds]);

  const totalPages = Math.ceil(filteredHubs.length / itemsPerPage);
  const paginatedHubs = filteredHubs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ── Selected location label ───────────────────────────────────────────────
  const selectedGovName = governorates.find((g) => g.id === selectedGovernorateId)?.name;
  const selectedCityName = cities.find((c) => c.id === selectedCityId)?.name;
  const selectedAreaName = areas.find((a) => a.id === selectedAreaId)?.name;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* ── Filters Sidebar ────────────────────────────────────────────── */}
      <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm sticky top-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <Filter className="h-5 w-5" />
              {t("filters")}
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="cursor-pointer flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
              >
                <X className="h-3 w-3" />
                {t("clearAll")} ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Search */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-medium text-foreground">
              {t("searchName")}
            </label>
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

          {/* ── Hierarchical Location Filter ─────────────────────────── */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {t("governorate")}
            </label>

            {locationsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Loading locations…</span>
              </div>
            ) : (
              <>
                {/* Location Tree */}
                <div className="space-y-1">
                  {governorates.map((gov) => (
                    <div key={gov.id} className="space-y-1">
                      <button
                        onClick={() => selectGovernorate(gov.id)}
                        className={`cursor-pointer w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                          selectedGovernorateId === gov.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        <span>{gov.name}</span>
                        {selectedGovernorateId === gov.id && cities.length > 0 && (
                          <ChevronRight className="h-3.5 w-3.5 opacity-70 rotate-90 transition-transform" />
                        )}
                      </button>

                      {/* Cities (shown when this governorate is selected) */}
                      {selectedGovernorateId === gov.id && cities.length > 0 && (
                        <div className="ms-2 ps-2 border-s-2 border-primary/30 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                          {cities.map((city) => (
                            <div key={city.id} className="space-y-1">
                              <button
                                onClick={() => selectCity(city.id)}
                                className={`cursor-pointer w-full flex items-center justify-between px-3 py-1.5 mt-1 rounded-lg text-sm transition-all duration-150 ${
                                  selectedCityId === city.id
                                    ? "bg-primary/15 text-primary font-semibold"
                                    : "hover:bg-muted text-foreground"
                                }`}
                              >
                                <span>{city.name}</span>
                                {selectedCityId === city.id && areas.length > 0 && (
                                  <ChevronRight className="h-3.5 w-3.5 opacity-70 rotate-90 transition-transform" />
                                )}
                              </button>

                              {/* Areas (shown when this city is selected) */}
                              {selectedCityId === city.id && areas.length > 0 && (
                                <div className="ms-2 ps-2 border-s-2 border-primary/20 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                  {areas.map((area) => (
                                    <button
                                      key={area.id}
                                      onClick={() => selectArea(area.id)}
                                      className={`cursor-pointer w-full flex items-center px-3 py-1.5 mt-1 rounded-lg text-sm transition-all duration-150 ${
                                        selectedAreaId === area.id
                                          ? "bg-primary/10 text-primary font-semibold"
                                          : "hover:bg-muted text-foreground"
                                      }`}
                                    >
                                      {area.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Breadcrumb / active selection badge */}
                {selectedGovernorateId && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                      <MapPin className="h-3 w-3" />
                      {[selectedGovName, selectedCityName, selectedAreaName]
                        .filter(Boolean)
                        .join(" › ")}
                      <button
                        onClick={clearFilters}
                        className="cursor-pointer ms-1 hover:text-red-500 transition-colors"
                        aria-label="Clear location filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-muted-foreground">
            {t("showing", { count: filteredHubs.length, total: hubs.length })}
          </p>
          <select className="cursor-pointer h-9 w-44 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="cursor-pointer px-4 py-2 border border-input bg-background rounded-md text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t("previous", { fallback: "Previous" })}
                </button>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`cursor-pointer w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                        currentPage === i + 1
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted bg-background border border-input"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="cursor-pointer px-4 py-2 border border-input bg-background rounded-md text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t("next", { fallback: "Next" })}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-border rounded-2xl bg-muted/10">
            <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t("noHubsFound")}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">{t("noHubsTry")}</p>
            <button
              onClick={clearFilters}
              className="cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {t("clearFilters")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
