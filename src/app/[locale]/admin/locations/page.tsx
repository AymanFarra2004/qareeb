"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, MapPin, Loader2, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import { 
  getAdminLocations, 
  createLocation, 
  updateLocation, 
  deleteLocation 
} from "@/src/actions/admin";

import LocationTreeView from "./LocationTreeView";
import LocationForm from "./LocationForm";
import DeleteLocationModal from "./DeleteLocationModal";
import { getLocationDataBySlugForManagement } from "@/src/actions/locations";

export default function AdminLocationsPage() {
  const t = useTranslations("AdminLocations");
  const locale = useLocale();
  
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [locationAR, setLocationAR] = useState<any>("")
  const [locationEN, setLocationEN] = useState<any>("");

  const originalDataRef = useRef<any>(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [prefilledParent, setPrefilledParent] = useState<any>(null);

  const fetchLocations = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    
    try {
      const res = await getAdminLocations(locale);
      if (res.success) {
        setLocations(res.data);
      } else {
        toast.error(res.error || "Failed to load locations");
      }
    } catch (err) {
      toast.error("Network Error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [locale]);
  useEffect(() => {
      async function fetchData() {
        if (!selectedLocation?.slug) return;
        setIsLoading(true);
        const res = await getLocationDataBySlugForManagement(selectedLocation.slug);
        if (res.success && res.data) {
          originalDataRef.current = res.data;
          setLocationAR(res.data.nameAR || "");
          setLocationEN(res.data.nameEN || "");
        }
        setIsLoading(false);
      }
      fetchData();
    }, [selectedLocation?.slug]);

  const handleAddLocation = () => {
    setSelectedLocation(null);
    setPrefilledParent(null);
    setIsFormOpen(true);
  };

  const handleAddChild = (parent: any) => {
    setSelectedLocation(null);
    setPrefilledParent(parent);
    setIsFormOpen(true);
  };

  const handleEditLocation = (location: any) => {
    setSelectedLocation(location);
    setPrefilledParent(null);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (location: any) => {
    setSelectedLocation(location);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData: FormData) => {
    let res;
    if (selectedLocation) {
      res = await updateLocation(selectedLocation.slug, formData);
    } else {
      res = await createLocation(formData);
    }

    if (res.success) {
      toast.success(selectedLocation ? t("successUpdate") : t("successCreate"));
      fetchLocations(true);
      setIsFormOpen(false);
    } else {
      throw new Error(res.error || "Action failed");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedLocation) return { error: "No location selected" };
    
    const res = await deleteLocation(selectedLocation.slug);
    if (res.success) {
      toast.success(t("successDelete"));
      fetchLocations(true);
      return { success: true };
    } else {
      return { error: res.error };
    }
  };

  // Check if a location has children for deletion logic
  const checkHasChildren = (locationId: number) => {
    return locations.some(loc => loc.parent_id === locationId);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-2xl text-primary-foreground shadow-lg shadow-primary/20">
              <MapPin className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("title")}</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            {t("description")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchLocations(true)}
            disabled={isRefreshing}
            className="p-3 bg-muted hover:bg-muted/80 text-muted-foreground rounded-2xl transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <button 
            onClick={handleAddLocation}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-2xl hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <Plus className="h-5 w-5" />
            <span>{t("addLocation")}</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-8">
        <LocationTreeView 
          locations={locations}
          onEdit={handleEditLocation}
          onDelete={handleDeleteClick}
          onAddChild={handleAddChild}
          locale={locale}
        />
      </div>

      {/* Modals */}
      <LocationForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedLocation}
        initialParentId={prefilledParent?.id}
        locations={locations}
        locale={locale}
        locationAR={locationAR}
        locationEN={locationEN}
      />

      <DeleteLocationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        locationName={selectedLocation ? (locale === 'en' ? (selectedLocation.name.en || selectedLocation.name) : (selectedLocation.name.ar || selectedLocation.name)) : ""}
        hasChildren={selectedLocation ? checkHasChildren(selectedLocation.id) : false}
      />
    </div>
  );
}
