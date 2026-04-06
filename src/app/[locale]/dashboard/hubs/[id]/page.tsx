"use client";

import { useState, use, useEffect, useActionState } from "react";
import { Settings, Box, Tag, Link as LinkIcon, Camera, Save, ArrowLeft, Loader2, AlertTriangle, MapPin, Phone } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { useRouter } from "next/navigation";
import { getHubBySlug, updateHub, deleteHub, addHubSocial, getHubOffers, addHubOffer, getAllServices, createService } from "@/src/actions/hubs";

// General Tab - shows real hub data
function GeneralTab({ hub }: { hub: any }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Hub Information</h3>
        
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium mb-1">Cover Image / Logo</label>
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 text-muted-foreground overflow-hidden">
                {hub.images?.main ? (
                  <img src={hub.images.main} alt="Hub" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="h-8 w-8 opacity-50" />
                )}
              </div>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground text-sm rounded-lg font-medium hover:bg-secondary/80 transition-colors">
                Upload New
              </button>
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
              onClick={async () => {
                if (confirm("Are you sure you want to delete this hub?")) {
                  const res = await deleteHub(hub.slug);
                  if (res.success) {
                    window.location.href = "/dashboard";
                  } else {
                    alert(res.error || "Failed to delete hub");
                  }
                }
              }}
              className="px-4 py-2 bg-red-100 text-red-700 text-sm rounded-lg font-medium hover:bg-red-200 transition-colors"
            >
              Delete Hub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Services Tab - Checkbox list of global services, with "Other" option
function ServicesTab({ hub, onUpdate }: { hub: any; onUpdate: () => void }) {
  const [globalServices, setGlobalServices] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [showOther, setShowOther] = useState(false);
  const [customNameEN, setCustomNameEN] = useState("");
  const [customNameAR, setCustomNameAR] = useState("");
  const [customDescEN, setCustomDescEN] = useState("");
  const [customDescAR, setCustomDescAR] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadServices() {
      const res = await getAllServices();
      if (res.success) setGlobalServices(res.data);
      
      const initialIds = hub.services?.map((s: any) => s.id) || [];
      setSelectedIds(initialIds);
      setLoading(false);
    }
    loadServices();
  }, [hub]);

  const toggleService = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Build form data for hub update
    const updateData = new FormData();
    
    // Add selected global service IDs
    selectedIds.forEach(id => updateData.append("service_ids[]", String(id)));

    // If "Other" is checked with a name, send it as a custom service on the hub
    if (showOther && customNameEN.trim()) {
      updateData.append("custom_service[name][en]", customNameEN.trim());
      updateData.append("custom_service[name][ar]", customNameAR.trim() || customNameEN.trim());
      if (customDescEN.trim()) updateData.append("custom_service[description][en]", customDescEN.trim());
      if (customDescAR.trim()) updateData.append("custom_service[description][ar]", customDescAR.trim());
    }
    
    const res = await updateHub(hub.slug, null, updateData);
    
    if (res.success) {
      setSuccess("Hub services updated successfully.");
      setShowOther(false);
      setCustomNameEN("");
      setCustomNameAR("");
      setCustomDescEN("");
      setCustomDescAR("");
      onUpdate();
    } else {
      setError(res.error || "Failed to update hub services.");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold">Services Engine</h3>
            <p className="text-sm text-muted-foreground mt-1">Select the services your hub provides to the community</p>
          </div>
        </div>

        {error && <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">{error}</div>}
        {success && <div className="p-3 mb-4 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200">{success}</div>}

        {loading ? (
          <div className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6 max-w-xl">
            <div className="space-y-1 p-4 border border-border rounded-xl bg-muted/10">
              {globalServices.map((service) => (
                <label key={service.id} className="flex items-start gap-3 p-2.5 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary mt-0.5"
                    checked={selectedIds.includes(service.id)}
                    onChange={() => toggleService(service.id)}
                  />
                  <div>
                    <span className="font-medium">{service.name?.en || service.name}</span>
                    {service.name?.ar && <span className="text-xs text-muted-foreground block">{service.name.ar}</span>}
                    {service.description?.en && <p className="text-xs text-muted-foreground mt-0.5">{service.description.en}</p>}
                  </div>
                </label>
              ))}
              
              <label className="flex items-center gap-3 p-2.5 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors border-t border-border mt-1 pt-3">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  checked={showOther}
                  onChange={(e) => setShowOther(e.target.checked)}
                />
                <span className="font-medium text-primary">Other (Add a Custom Service)</span>
              </label>
            </div>

            {showOther && (
              <div className="p-4 border border-primary/30 rounded-xl bg-primary/5 space-y-4 animate-in slide-in-from-top-2">
                <h4 className="text-sm font-semibold text-primary">Custom Service Details</h4>
                <p className="text-xs text-muted-foreground -mt-2">This service will be added directly to your hub.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Service Name (English) <span className="text-red-500">*</span></label>
                    <input 
                      required={showOther}
                      value={customNameEN}
                      onChange={(e) => setCustomNameEN(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" 
                      placeholder="e.g. Free Coffee"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Service Name (Arabic)</label>
                    <input 
                      value={customNameAR}
                      onChange={(e) => setCustomNameAR(e.target.value)}
                      dir="rtl" 
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" 
                      placeholder="مثال: قهوة مجانية"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description (English)</label>
                    <textarea
                      value={customDescEN}
                      onChange={(e) => setCustomDescEN(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm resize-none"
                      rows={2}
                      placeholder="Brief description of the service..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description (Arabic)</label>
                    <textarea
                      value={customDescAR}
                      onChange={(e) => setCustomDescAR(e.target.value)}
                      dir="rtl"
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm resize-none"
                      rows={2}
                      placeholder="وصف مختصر للخدمة..."
                    />
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={saving || (showOther && !customNameEN.trim())}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Save Services"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}


// Socials Tab - functional form
function SocialsTab({ hubId }: { hubId: string }) {
  const [state, formAction] = useActionState(addHubSocial.bind(null, hubId), null);

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
          {activeTab === "general" && <GeneralTab hub={hub} />}
          {activeTab === "services" && <ServicesTab hub={hub} onUpdate={fetchHub} />}
          {activeTab === "offers" && <OffersTab hubSlug={hub.slug} />}
          {activeTab === "socials" && <SocialsTab hubId={resolvedParams.id} />}
        </div>
      </div>
    </div>
  );
}

