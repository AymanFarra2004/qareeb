"use client";

import { useState, use, useEffect, useActionState, useRef } from "react";
import { Settings, Box, Tag, Link as LinkIcon, Camera, Save, ArrowLeft, Loader2, AlertTriangle, MapPin, Phone, Trash2 } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { useRouter } from "next/navigation";
import { getHubBySlug, updateHub, deleteHub, addHubSocial, getHubOffers, addHubOffer, getAllServices, createService, getHubServices, addCustomService, deleteCustomService } from "@/src/actions/hubs";
import { toast } from "react-hot-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/src/app/[locale]/components/ui/alert-dialog";

// General Tab - shows real hub data
function GeneralTab({ hub, onUpdate }: { hub: any; onUpdate: () => void }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("main_image", file);
    
    const res = await updateHub(hub.slug, null, formData);
    if (res.success) {
      toast.success("Image updated successfully!");
      onUpdate();
    } else {
      toast.error(res.error || "Failed to update image");
    }
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const mainImage = hub.images?.main || hub.main_image;
  const imageUrl = mainImage ? (mainImage.startsWith('http') ? mainImage : `https://karam.idreis.net${mainImage.startsWith('/') ? '' : '/'}${mainImage}`) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Hub Information</h3>
        
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium mb-1">Cover Image / Logo</label>
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 text-muted-foreground overflow-hidden relative">
                {isUploading && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
                {imageUrl ? (
                  <img src={imageUrl} alt="Hub" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="h-8 w-8 opacity-50" />
                )}
              </div>
              <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleImageChange} 
                />
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }}
                  disabled={isUploading}
                  className="px-4 py-2 bg-secondary text-secondary-foreground text-sm rounded-lg font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  {isUploading ? "Uploading..." : "Upload New"}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hub Name</label>
            <input type="text" className="w-full px-4 py-2 border border-input rounded-xl bg-background" defaultValue={hub.name || ""} readOnly />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className="w-full px-4 py-2 border border-input rounded-xl bg-background resize-none" rows={3} defaultValue={hub.description || ""} readOnly />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${
                hub.status === "approved" ? "bg-green-100 text-green-700" :
                hub.status === "rejected" ? "bg-red-100 text-red-700" :
                "bg-yellow-100 text-yellow-700"
              }`}>
                {hub.status?.charAt(0).toUpperCase() + hub.status?.slice(1) || "Pending"}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <span className="text-sm text-muted-foreground font-mono">{hub.slug}</span>
            </div>
          </div>

          {hub.rejection_reason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <strong>Rejection Reason:</strong> {hub.rejection_reason}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{hub.address_details || "No address"}</span>
            {hub.location && <span className="text-xs bg-muted px-2 py-0.5 rounded">({hub.location.name} - {hub.location.type})</span>}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span dir="ltr">{hub.contact || "No contact"}</span>
          </div>

          <div className="pt-6 mt-6 border-t border-border">
            <button 
              onClick={() => setIsDeleteDialogOpen(true)}
              className="px-4 py-2 bg-red-100 text-red-700 text-sm rounded-lg font-medium hover:bg-red-200 transition-colors"
            >
              Delete Hub
            </button>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-background sm:rounded-3xl border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this Hub?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hub? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={async (e) => {
                e.preventDefault();
                setIsDeleting(true);
                const res = await deleteHub(hub.slug);
                if (res.success) {
                  toast.success("Hub deleted successfully");
                  window.location.href = "/dashboard";
                } else {
                  toast.error(res.error || "Failed to delete hub");
                  setIsDeleting(false);
                  setIsDeleteDialogOpen(false);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Services Tab - Updated for Current Services Table and Dedicated Custom Endpoints
function ServicesTab({ hub, onUpdate }: { hub: any; onUpdate: () => void }) {
  const [globalServices, setGlobalServices] = useState<any[]>([]);
  const [activeServices, setActiveServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingLink, setSavingLink] = useState<number | null>(null);
  const [addingCustom, setAddingCustom] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const [customNameEN, setCustomNameEN] = useState("");
  const [customNameAR, setCustomNameAR] = useState("");
  const [customDescEN, setCustomDescEN] = useState("");
  const [customDescAR, setCustomDescAR] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [globalRes, activeRes] = await Promise.all([
      getAllServices(),
      getHubServices(hub.slug)
    ]);
    
    if (globalRes.success) setGlobalServices(globalRes.data);
    if (activeRes.success) setActiveServices(activeRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [hub.slug]);

  const handleLinkGlobal = async (serviceId: number, isLinked: boolean) => {
    setSavingLink(serviceId);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    if (isLinked) {
      formData.append("remove_service_ids[]", String(serviceId));
    } else {
      formData.append("add_service_ids[]", String(serviceId));
    }

    const res = await updateHub(hub.slug, null, formData);
    if (res.success) {
      toast.success(isLinked ? "Service unlinked" : "Service linked");
      await loadData();
    } else {
      toast.error(res.error || "Failed to update service");
    }
    setSavingLink(null);
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingCustom(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("name_en", customNameEN.trim());
    formData.append("name_ar", customNameAR.trim() || customNameEN.trim());
    formData.append("description_en", customDescEN.trim());
    formData.append("description_ar", customDescAR.trim());

    const res = await addCustomService(hub.slug, null, formData);
    if (res.success) {
      toast.success("Custom service added!");
      setCustomNameEN("");
      setCustomNameAR("");
      setCustomDescEN("");
      setCustomDescAR("");
      await loadData();
    } else {
      toast.error(res.error || "Failed to add service");
    }
    setAddingCustom(false);
  };

  const handleDeleteCustom = async (serviceId: number) => {
    setDeletingId(serviceId);
    const res = await deleteCustomService(hub.slug, serviceId);
    if (res.success) {
      toast.success("Service removed");
      await loadData();
    } else {
      toast.error(res.error || "Failed to remove service");
    }
    setDeletingId(null);
  };

  if (loading && activeServices.length === 0) {
     return <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Current Services Table */}
      <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold">Current Hub Services</h3>
          <p className="text-sm text-muted-foreground">List of all active services for this hub.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Service Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activeServices.map((s: any) => {
                const isCustom = !s.id || s.is_custom || (s.pivot === undefined && !globalServices.find(gs => gs.id === s.id));
                // Note: The API response might distinguish these differently, adjust if needed
                return (
                  <tr key={s.id || s.name?.en} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium block">{s.name?.en || s.name}</span>
                      {s.name?.ar && <span className="text-xs text-muted-foreground block">{s.name.ar}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${s.pivot ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                        {s.pivot ? "Global" : "Custom"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground italic">
                      {s.description?.en || s.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         disabled={deletingId === s.id || savingLink === s.id}
                         onClick={() => s.pivot ? handleLinkGlobal(s.id, true) : handleDeleteCustom(s.id)}
                         className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                       >
                         {deletingId === s.id || savingLink === s.id ? (
                           <Loader2 className="h-4 w-4 animate-spin" />
                         ) : (
                           <Trash2 className="h-4 w-4" />
                         )}
                       </button>
                    </td>
                  </tr>
                );
              })}
              {activeServices.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No active services. Add one below.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Link Global Services */}
        <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Link Global Services</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {globalServices.map((gs) => {
              const isLinked = activeServices.some(as => as.id === gs.id);
              return (
                <div key={gs.id} className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-muted/30 transition-colors">
                  <div>
                    <span className="font-medium block text-sm">{gs.name?.en || gs.name}</span>
                    {gs.name?.ar && <span className="text-[10px] text-muted-foreground block">{gs.name.ar}</span>}
                  </div>
                  <button
                    disabled={savingLink === gs.id}
                    onClick={() => handleLinkGlobal(gs.id, isLinked)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      isLinked 
                        ? "bg-red-50 text-red-600 hover:bg-red-100" 
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    {savingLink === gs.id ? <Loader2 className="h-3 w-3 animate-spin" /> : (isLinked ? "Unlink" : "Link")}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Custom Service */}
        <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Add Custom Service</h3>
          <form onSubmit={handleAddCustom} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 uppercase tracking-wider text-muted-foreground">Service Name (EN) *</label>
                <input 
                  required
                  value={customNameEN}
                  onChange={(e) => setCustomNameEN(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm" 
                  placeholder="e.g. Dedicated Desk"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 uppercase tracking-wider text-muted-foreground">Service Name (AR)</label>
                <input 
                  value={customNameAR}
                  onChange={(e) => setCustomNameAR(e.target.value)}
                  dir="rtl" 
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm text-right" 
                  placeholder="مثال: مكتب خاص"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 uppercase tracking-wider text-muted-foreground">Description (EN)</label>
                <textarea
                  value={customDescEN}
                  onChange={(e) => setCustomDescEN(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm resize-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 uppercase tracking-wider text-muted-foreground">Description (AR)</label>
                <textarea
                  value={customDescAR}
                  onChange={(e) => setCustomDescAR(e.target.value)}
                  dir="rtl"
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background text-sm resize-none text-right"
                  rows={2}
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={addingCustom || !customNameEN.trim()}
              className="w-full px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {addingCustom && <Loader2 className="h-4 w-4 animate-spin" />}
              {addingCustom ? "Adding..." : "Add Service"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}


// Socials Tab - functional form
function SocialsTab({ hubSlug }: { hubSlug: string }) {
  const [state, formAction] = useActionState(addHubSocial.bind(null, hubSlug), null);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold">Social Links</h3>
            <p className="text-sm text-muted-foreground mt-1">Help people find your hub online</p>
          </div>
        </div>

        <form action={formAction} className="max-w-xl space-y-4">
          {state?.error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{state.error}</div>}
          {state?.success && <div className="text-green-600 text-sm bg-green-50 p-2 rounded">Social Account Added!</div>}
          <div className="flex gap-3">
            <select name="platform" className="px-4 py-2 border border-input rounded-xl bg-background text-sm">
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter</option>
            </select>
            <input 
              name="url"
              type="url" 
              placeholder="https://..."
              required
              className="flex-1 px-4 py-2 border border-input rounded-xl bg-background text-sm" 
            />
            <button type="submit" className="px-4 py-2 bg-secondary text-secondary-foreground text-sm rounded-xl font-medium">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
}


// Offers Tab - functional form
function OffersTab({ hubSlug }: { hubSlug: string }) {
  const [showForm, setShowForm] = useState(false);
  const [state, formAction] = useActionState(addHubOffer.bind(null, hubSlug), null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOffers() {
      const res = await getHubOffers(hubSlug);
      if (res.success) setOffers(res.data);
      setLoading(false);
    }
    loadOffers();
  }, [hubSlug, state]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold">Special Offers</h3>
            <p className="text-sm text-muted-foreground mt-1">Provide special deals for your local community</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            {showForm ? "Cancel" : "+ Add Offer"}
          </button>
        </div>

        {showForm && (
          <form action={formAction} className="p-4 border border-border rounded-xl mb-6 space-y-4 bg-muted/20">
            {state?.error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{state.error}</div>}
            {state?.success && <div className="text-green-600 text-sm bg-green-50 p-2 rounded">Offer Added!</div>}
            <div>
              <label className="block text-sm font-medium mb-1">Title (EN)</label>
              <input name="title_en" required className="w-full px-4 py-2 border rounded-lg bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title (AR)</label>
              <input name="title_ar" required dir="rtl" className="w-full px-4 py-2 border rounded-lg bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description (EN)</label>
              <textarea name="description_en" required className="w-full px-4 py-2 border rounded-lg bg-background resize-none" rows={2}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description (AR)</label>
              <textarea name="description_ar" required dir="rtl" className="w-full px-4 py-2 border rounded-lg bg-background resize-none" rows={2}></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input name="price" type="number" required className="w-full px-4 py-2 border rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (Hours)</label>
                <input name="duration" type="number" required className="w-full px-4 py-2 border rounded-lg bg-background" />
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-medium">Save Offer</button>
          </form>
        )}

        <div className="space-y-3">
          {loading ? (
             <div className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
          ) : offers.length > 0 ? (
            offers.map((offer) => (
              <div key={offer.id} className="flex items-center justify-between p-4 border border-border rounded-xl">
                <div>
                  <h4 className="font-medium text-lg">{offer.title?.en || offer.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{offer.description?.en || ""}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-sm font-semibold text-green-600">${offer.price}</span>
                    <span className="text-sm text-muted-foreground">{offer.duration} Hours</span>
                    <span className="text-sm capitalize text-muted-foreground">{offer.type}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="py-12 flex flex-col items-center justify-center text-center bg-muted/10">
                <Tag className="h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                <p className="font-medium">No offers currently active</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default function HubManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState("general");
  const [hub, setHub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHub() {
      setLoading(true);
      const result = await getHubBySlug(resolvedParams.id);
      if (result.success && result.data) {
        setHub(result.data);
      } else {
        setError(result.error || "Failed to load hub");
      }
      setLoading(false);
    }
    fetchHub();
  }, [resolvedParams.id]);
  
  const tabs = [
    { id: "general", label: "General Settings", icon: Settings },
    { id: "services", label: "Services", icon: Box },
    { id: "offers", label: "Special Offers", icon: Tag },
    { id: "socials", label: "Social Accounts", icon: LinkIcon },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading hub details...</span>
      </div>
    );
  }

  if (error || !hub) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
          <p className="font-medium text-red-700">{error || "Hub not found"}</p>
          <Link href="/dashboard" className="inline-block mt-4 text-primary hover:underline text-sm">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const hubName = hub.name || "Unnamed Hub";

  // Re-fetch hub helper for child tabs to refresh data
  const fetchHub = async () => {
    const result = await getHubBySlug(resolvedParams.id);
    if (result.success && result.data) setHub(result.data);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Area */}
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Hubs
        </Link>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">{hubName}</h2>
            <p className="text-muted-foreground mt-1 font-mono text-sm">slug: {hub.slug}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            hub.status === "approved" ? "bg-green-100 text-green-700" :
            hub.status === "rejected" ? "bg-red-100 text-red-700" :
            "bg-yellow-100 text-yellow-700"
          }`}>
            {hub.status?.charAt(0).toUpperCase() + hub.status?.slice(1) || "Pending"}
          </span>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Nav Tabs */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium whitespace-nowrap ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === "general" && <GeneralTab hub={hub} onUpdate={fetchHub} />}
          {activeTab === "services" && <ServicesTab hub={hub} onUpdate={fetchHub} />}
          {activeTab === "offers" && <OffersTab hubSlug={hub.slug} />}
          {activeTab === "socials" && <SocialsTab hubSlug={hub.slug} />}
        </div>
      </div>
    </div>
  );
}

