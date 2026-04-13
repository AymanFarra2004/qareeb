"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { format12to24 } from "../lib/utils";

const API_BASE_URL = "https://karam.idreis.net/api/v1";

// Map next-intl locale codes to API lang query params
function getLangParam(locale: string = "ar"): string {
  return `lang=${locale === 'en' ? 'en' : 'ar'}`;
}
// Using v1 as confirmed manually; the POST endpoints for services likely need backend route matching verification

export async function getAllHubs(locale: string = "ar") {
  try {
    const langParam = getLangParam(locale);
    const res = await fetch(`${API_BASE_URL}/front/hubs?${langParam}&per_page=1000`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      next: { tags: ['all-hubs'], revalidate: 0 }
    });
    const result = await res.json();
    if (res.ok) {
       let hubsArray = result.data;
       // If paginated, data is nested under data.data
       if (hubsArray && !Array.isArray(hubsArray) && Array.isArray(hubsArray.data)) {
          hubsArray = hubsArray.data;
       }
       return { success: true, data: hubsArray || [] };
    }
    return { error: result.message || "Failed to fetch hubs", data: [] };
  } catch (error) {
    return { error: "Network Error", data: [] };
  }
}

export async function getMyHubs(locale: string = "ar") {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { error: "Unauthenticated", data: [] };
  }

  try {
    const langParam = getLangParam(locale);
    const res = await fetch(`${API_BASE_URL}/hubs/my?${langParam}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      },
      next: { tags: ['my-hubs'], revalidate: 60 }
    });

    const result = await res.json();
    
    // Check if the API returned an array directly or inside `data`
    if (res.ok) {
       let hubsArray = result.data;
       if (hubsArray && !Array.isArray(hubsArray) && Array.isArray(hubsArray.data)) {
          hubsArray = hubsArray.data;
       }
       return { success: true, data: hubsArray || [] };
    }
    
    return { error: result.message || "Failed to fetch hubs", data: [] };
  } catch (error) {
    console.error("Error fetching hubs:", error);
    return { error: "Network Error", data: [] };
  }
}

export async function getHubBySlug(slugOrId: string, locale: string = "ar") {
  try {
    const langParam = getLangParam(locale);
    const headers: Record<string, string> = { "Accept": "application/json" };

    const res = await fetch(`${API_BASE_URL}/front/hubs/${slugOrId}?${langParam}`, {
      method: "GET",
      headers,
      next: { revalidate: 0 }
    });
    
    let result;
    try {
      result = await res.json();
    } catch (e) {
      result = null;
    }

    if (res.ok && result) {
      return { success: true, data: result.data || result };
    }

    return { error: (result && result.message) ? result.message : "Failed to fetch hub", data: null };
  } catch (error) {
    return { error: "Network Error", data: null };
  }
}

export async function getPrivateHubBySlug(slugOrId: string, locale: string = "ar") {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated", data: null };

  try {
    const langParam = getLangParam(locale);
    const res = await fetch(`${API_BASE_URL}/hubs/${slugOrId}?${langParam}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      next: { revalidate: 0 }
    });
    
    let result;
    try {
      result = await res.json();
    } catch (e) {
      result = null;
    }

    if (res.ok && result && result.status === 'success') {
      return { success: true, data: result.data };
    }

    // Fallback if the direct API fails for some backend reason, try getting from list.
    const myHubsRes = await getMyHubs(locale);
    if (myHubsRes.success && myHubsRes.data) {
       const found = myHubsRes.data.find((h: any) => String(h.id) === String(slugOrId) || String(h.slug) === String(slugOrId));
       if (found) {
         return { success: true, data: found };
       }
    }

    return { error: (result && result.message) ? result.message : "Failed to fetch hub", data: null };
  } catch (error) {
    return { error: "Network Error", data: null };
  }
}

export async function createHub(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "Unauthenticated" };

  try {
    const name_en = formData.get("name_en") as string;
    const name_ar = formData.get("name_ar") as string;
    const location_id_raw = formData.get("location_id");
    const location_id = location_id_raw ? Number(location_id_raw) : 0;

    if (!name_en) return { error: "Hub name (EN) is required" };
    if (!location_id || isNaN(location_id) || location_id <= 0) {
      return { error: "Please select a specific location (Governorate, City, or Area)" };
    }

    const hourly_price_raw = formData.get("hourly_price");
    const hourly_price = hourly_price_raw ? Number(hourly_price_raw) : undefined;

    const payload: any = {
      name: {
        en: name_en,
        ar: name_ar || name_en,
      },
      working_hours: {} as any, // Initialize
      description: {
        en: formData.get("description_en") as string || "",
        ar: formData.get("description_ar") as string || "",
      },
      address_details: {
        en: formData.get("address_en") as string || "",
        ar: formData.get("address_ar") as string || "",
      },
      contact: formData.get("contact") as string || "",
      location_id: location_id,
      social_accounts: [] as any[],
    };

    // Handle working hours (mandatory)
    const startHour = formData.get("start_hour");
    const startPeriod = formData.get("start_period") as string;
    const endHour = formData.get("end_hour");
    const endPeriod = formData.get("end_period") as string;

    if (startHour && startPeriod && endHour && endPeriod) {
      const start24 = format12to24(Number(startHour), startPeriod);
      const end24 = format12to24(Number(endHour), endPeriod);
      
      payload.working_hours = {
        start: start24,
        end: end24
      };
      
      // Flat keys fallback as indicated by the Arabic error message " الحقل working hours start مطلوب "
      payload.working_hours_start = start24;
      payload.working_hours_end = end24;
    }

    if (hourly_price !== undefined && !isNaN(hourly_price)) {
      payload.hourly_price = hourly_price;
    }

    // Gather service_ids if they exist
    const serviceIdsRaw = formData.getAll("service_ids");
    const service_ids = serviceIdsRaw.map(id => Number(id)).filter(id => !isNaN(id) && id > 0);

    const customNameEn = formData.get("custom_service_en") as string;
    const customNameAr = formData.get("custom_service_ar") as string;
    const customDescEn = formData.get("custom_service_description_en") as string;
    const customDescAr = formData.get("custom_service_description_ar") as string;
    
    // Instead of creating a separate service, embed it in the hub payload if backend supports it
    // Aligning with the custom_service[name][en] pattern used in updateHub
    if (customNameEn && customNameEn.trim() !== '') {
      payload.custom_service = {
        name: {
          en: customNameEn.trim(),
          ar: customNameAr?.trim() || customNameEn.trim(),
        },
        description: {
          en: customDescEn?.trim() || "",
          ar: customDescAr?.trim() || "",
        }
      };
    }

    if (service_ids.length > 0) {
      payload.service_ids = service_ids;
    }

    const fbUrl = formData.get("facebook_url") as string;
    if (fbUrl) payload.social_accounts.push({ platform: "facebook", url: fbUrl });
    
    const instaUrl = formData.get("instagram_url") as string;
    if (instaUrl) payload.social_accounts.push({ platform: "instagram", url: instaUrl });
    
    const xUrl = formData.get("twitter_url") as string;
    if (xUrl) payload.social_accounts.push({ platform: "twitter", url: xUrl });

    // ─── Step 1: Create hub with JSON (text fields only) ───────────────────────
    const langParam = getLangParam();
    const res = await fetch(`${API_BASE_URL}/hubs?${langParam}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok && result.status !== 'success') {
      return { error: result.message || `Failed to create hub (Status ${res.status})` };
    }

    const hub = result.data || result;
    const hubSlug = hub.slug;

    // ─── Step 2: Upload images if provided ─────────────────────────────────────
    const mainImage = formData.get("main_image") as File | null;
    const galleryFiles = formData.getAll("gallery[]") as File[];

    const hasMainImage = mainImage instanceof File && mainImage.size > 0;
    const hasGallery = galleryFiles.some(f => f instanceof File && (f as File).size > 0);

    if ((hasMainImage || hasGallery) && hubSlug) {
      const imageForm = new FormData();
      imageForm.append("_method", "PUT");

      if (hasMainImage) {
        imageForm.append("main_image", mainImage as File);
      }

      if (hasGallery) {
        galleryFiles.forEach(file => {
          if (file instanceof File && file.size > 0) {
            imageForm.append("gallery[]", file);
          }
        });
      }

      try {
        await fetch(`${API_BASE_URL}/hubs/${hubSlug}`, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
            "X-HTTP-Method-Override": "PUT",
          },
          body: imageForm,
        });
      } catch (_) {
        // Images failed — hub was still created, not fatal
        console.warn("Image upload failed after hub creation; hub still created.");
      }
    }

    if (hubSlug) {
      revalidatePath('/dashboard');
      revalidatePath('/[locale]/dashboard', 'page');
      revalidatePath('/', 'layout');
      revalidateTag('all-hubs');
    }

    return {
      success: true,
      message: result.message || "Hub created successfully",
      hub,
    };
  } catch (error) {
    console.error("Error creating hub:", error);
    return { error: "Network Error" };
  }
}

// ============== SERVICES ==============

export async function getAllServices(locale: string = "ar") {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    const headers: Record<string, string> = { "Accept": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    const langParam = getLangParam(locale);
    const res = await fetch(`${API_BASE_URL}/services?${langParam}`, {
      method: "GET",
      headers,
      next: { tags: ["services"], revalidate: 60 }
    });
    if (!res.ok) return { error: `API Error: ${res.status}`, data: [] };
    const result = await res.json();
    return { success: true, data: result.data || result || [] };
  } catch (e) {
    return { error: "Network Error", data: [] };
  }
}

export async function createService(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };

  try {
    const payload = {
      name: {
        en: formData.get("name_en") as string,
        ar: formData.get("name_ar") as string || formData.get("name_en") as string,
      },
      description: {
        en: formData.get("description_en") as string || "",
        ar: formData.get("description_ar") as string || "",
      }
    };

    const res = await fetch(`${API_BASE_URL}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    
    const result = await res.json();
    if (res.ok && result.status === 'success') {
       revalidatePath('/dashboard');
       return { success: true, data: result.data, message: "Added" };
    }
    return { error: result.message || "Failed to create service" };
  } catch (error) {
    return { error: "Network Error" };
  }
}

export async function getHubServices(slug: string, locale: string = "ar") {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated", data: [] };

  try {
    const langParam = getLangParam(locale);
    const res = await fetch(`${API_BASE_URL}/hubs/${slug}/services?${langParam}`, {
      method: "GET",
      headers: { 
        "Accept": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      next: { tags: [`hub-services-${slug}`], revalidate: 0 }
    });
    const result = await res.json();
    if (res.ok) {
       return { success: true, data: result.data || result || [] };
    }
    return { error: result.message || "Failed to fetch services", data: [] };
  } catch (e) {
    return { error: "Network Error", data: [] };
  }
}

export async function addCustomService(hubSlug: string, prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };

  try {
    const payload = {
      name: {
        en: formData.get("name_en") as string,
        ar: formData.get("name_ar") as string || formData.get("name_en") as string,
      },
      description: {
        en: formData.get("description_en") as string || "",
        ar: formData.get("description_ar") as string || "",
      },
      is_active: formData.get("is_active") === "true" || true
    };

    const res = await fetch(`${API_BASE_URL}/hubs/${hubSlug}/custom-services`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Accept": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(payload)
    });
    
    const result = await res.json();
    if (res.ok) {
      revalidatePath(`/dashboard/hubs/${hubSlug}`);
      revalidateTag(`hub-services-${hubSlug}`);
      return { success: true, data: result.data, message: "Custom service added successfully" };
    }
    return { error: result.message || "Failed to add custom service" };
  } catch (error) {
    return { error: "Network Error" };
  }
}

export async function deleteCustomService(hubSlug: string, serviceId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };

  try {
    const res = await fetch(`${API_BASE_URL}/hubs/${hubSlug}/custom-services/${serviceId}`, {
      method: "DELETE",
      headers: { 
        "Accept": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
    });
    
    if (res.ok) {
      revalidatePath(`/dashboard/hubs/${hubSlug}`);
      revalidateTag(`hub-services-${hubSlug}`);
      return { success: true, message: "Custom service deleted successfully" };
    }
    const result = await res.json();
    return { error: result.message || "Failed to delete custom service" };
  } catch (error) {
    return { error: "Network Error" };
  }
}


export async function getProfile(locale: string = "ar") {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated", data: null };

  try {
    const langParam = getLangParam(locale);
    const res = await fetch(`${API_BASE_URL}/profile?${langParam}`, {
      method: "GET",
      headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
      next: { revalidate: 60 }
    });
    const result = await res.json();
    return res.ok ? { success: true, data: result.data || result } : { error: "Failed to load profile" };
  } catch (error) {
    return { error: "Network Error" };
  }
}

// ============== OFFERS ==============

export async function getHubOffers(hubSlug: string, locale: string = "ar") {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated", data: [] };

  try {
    const langParam = getLangParam(locale);
    const res = await fetch(`${API_BASE_URL}/hubs/${hubSlug}/offers?${langParam}`, {
      headers: { Authorization: `Bearer ${token}`, "Accept": "application/json" },
      next: { tags: [`offers-${hubSlug}`], revalidate: 0 }
    });
    const result = await res.json();
    return res.ok ? { success: true, data: result.data || result || [] } : { error: "Error", data: [] };
  } catch (e) {
    return { error: "Network Error", data: [] };
  }
}

export async function addHubOffer(hubSlug: string, prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };

  try {
    const payload = {
      title: {
        en: formData.get("title_en") as string,
        ar: formData.get("title_ar") as string,
      },
      description: {
        en: formData.get("description_en") as string,
        ar: formData.get("description_ar") as string,
      },
      type: formData.get("type") as string || "daily",
      price: Number(formData.get("price")),
      duration: Number(formData.get("duration")),
      starts_at: (formData.get("starts_at") as string) + " 00:00:00",
      ends_at: (formData.get("ends_at") as string) + " 00:00:00",
      is_global: false,
      status: formData.get("status") as string || "active",
    };

    const res = await fetch(`${API_BASE_URL}/hubs/${hubSlug}/offers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (res.ok && result.status === 'success') {
      revalidatePath(`/hubs/${hubSlug}`);
      revalidatePath(`/dashboard/hubs/${hubSlug}`);
      return { success: true, message: "Added" };
    }
    return { error: result.message || "Failed" };
  } catch (e) {
    return { error: "Network Error" };
  }
}

export async function updateHubOffer(hubSlug: string, offerId: number, prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };

  try {
    const payload = {
      title: {
        en: formData.get("title_en") as string,
        ar: formData.get("title_ar") as string,
      },
      description: {
        en: formData.get("description_en") as string,
        ar: formData.get("description_ar") as string,
      },
      type: formData.get("type") as string || "daily",
      price: Number(formData.get("price")),
      duration: Number(formData.get("duration")),
      starts_at: (formData.get("starts_at") as string) + " 00:00:00",
      ends_at: (formData.get("ends_at") as string) + " 00:00:00",
      status: formData.get("status") as string || "active",
    };

    const res = await fetch(`${API_BASE_URL}/hubs/${hubSlug}/offers/${offerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Accept": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (res.ok && result.status === 'success') {
      revalidatePath(`/hubs/${hubSlug}`);
      revalidatePath(`/dashboard/hubs/${hubSlug}`);
      return { success: true, message: "Updated" };
    }
    return { error: result.message || "Failed" };
  } catch (e) {
    return { error: "Network Error" };
  }
}

export async function deleteHubOffer(hubSlug: string, offerId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };

  try {
    const res = await fetch(`${API_BASE_URL}/hubs/${hubSlug}/offers/${offerId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, "Accept": "application/json" }
    });
    if (res.ok) {
      revalidatePath(`/hubs/${hubSlug}`);
      revalidatePath(`/dashboard/hubs/${hubSlug}`);
      revalidateTag(`offers-${hubSlug}`);
      return { success: true, message: "Deleted" };
    }
    const result = await res.json();
    return { error: result.message || "Failed" };
  } catch (e) {
    return { error: "Network Error" };
  }
}

// ============== SOCIALS ==============

export async function getHubSocials(hubId: string, locale: string = "ar") {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated", data: [] };

  try {
    const langParam = getLangParam(locale);
    const res = await fetch(`${API_BASE_URL}/hubs/${hubId}/social-accounts?${langParam}`, {
      headers: { Authorization: `Bearer ${token}`, "Accept": "application/json" },
      next: { tags: [`socials-${hubId}`], revalidate: 0 }
    });
    const result = await res.json();
    return res.ok ? { success: true, data: result.data || result || [] } : { error: "Error", data: [] };
  } catch (e) {
    return { error: "Network Error", data: [] };
  }
}

export async function addHubSocial(hubSlug: string, prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };

  try {
    const payload = {
      platform: formData.get("platform") as string,
      url: formData.get("url") as string
    };

    const res = await fetch(`${API_BASE_URL}/hubs/${hubSlug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Accept": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (res.ok && result.status === 'success') {
      revalidatePath(`/hubs/${hubSlug}`);
      revalidatePath(`/dashboard/hubs/${hubSlug}`);
      return { success: true, message: "Added" };
    }
    return { error: result.message || "Failed" };
  } catch (e) {
    return { error: "Network Error" };
  }
}

export async function updateHub(slug: string, prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };

  try {
    const payload: any = {};
    
    // Extract textual JSON payload
    Array.from(formData.entries()).forEach(([key, value]) => {
      // Skip files and temporary UI fields for the JSON request
      if (value instanceof File) return; 
      if (["start_hour", "start_period", "end_hour", "end_period"].includes(key)) return;

      if (key === "service_ids" || key === "service_ids[]") {
        if (!payload["service_ids"]) payload["service_ids"] = [];
        payload["service_ids"].push(Number(value));
      } else if (key === "add_service_ids" || key === "add_service_ids[]") {
        if (!payload["add_service_ids"]) payload["add_service_ids"] = [];
        payload["add_service_ids"].push(Number(value));
      } else if (key === "remove_service_ids" || key === "remove_service_ids[]") {
        if (!payload["remove_service_ids"]) payload["remove_service_ids"] = [];
        payload["remove_service_ids"].push(Number(value));
      } else {
        payload[key] = value;
      }
    });

    // Handle working hours specifically if present
    const startHour = formData.get("start_hour");
    const startPeriod = formData.get("start_period") as string;
    const endHour = formData.get("end_hour");
    const endPeriod = formData.get("end_period") as string;

    if (startHour && startPeriod && endHour && endPeriod) {
      const start24 = format12to24(Number(startHour), startPeriod);
      const end24 = format12to24(Number(endHour), endPeriod);
      
      payload.working_hours = {
        start: start24,
        end: end24
      };
      
      payload.working_hours_start = start24;
      payload.working_hours_end = end24;
    }

    // Handle custom services if present in formData
    const customNameEn = formData.get("custom_service_en") as string;
    const customNameAr = formData.get("custom_service_ar") as string;
    const customDescEn = formData.get("custom_service_description_en") as string;
    const customDescAr = formData.get("custom_service_description_ar") as string;
    
    if (customNameEn && customNameEn.trim() !== '') {
      payload.custom_service = {
        name: {
          en: customNameEn.trim(),
          ar: customNameAr?.trim() || customNameEn.trim(),
        },
        description: {
          en: customDescEn?.trim() || "",
          ar: customDescAr?.trim() || "",
        }
      };
    }

    // --- Step 1: Send JSON data ---
    const langParam = getLangParam();
    const jsonRes = await fetch(`${API_BASE_URL}/hubs/${slug}?${langParam}`, {
      method: "PUT", 
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const jsonResult = await jsonRes.json();
    if (!jsonRes.ok && jsonResult.status !== 'success') {
      return { error: jsonResult.message || "Failed to update hub details" };
    }

    // --- Step 2: Upload images if provided ---
    // Safely extract potential main_image and gallery files
    const mainImage = formData.get("main_image");
    const galleryFiles = formData.getAll("gallery[]");

    const hasMainImage = mainImage instanceof File && mainImage.size > 0;
    const hasGallery = galleryFiles.some(f => f instanceof File && (f as File).size > 0);

    if (hasMainImage || hasGallery) {
      const imageForm = new FormData();
      imageForm.append("_method", "PUT");

      if (hasMainImage) {
        imageForm.append("main_image", mainImage as File);
      }

      if (hasGallery) {
        galleryFiles.forEach(file => {
          if (file instanceof File && file.size > 0) {
            imageForm.append("gallery[]", file);
          }
        });
      }

      try {
        const imageRes = await fetch(`${API_BASE_URL}/hubs/${slug}`, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
            "X-HTTP-Method-Override": "PUT",
          },
          body: imageForm,
        });
        
        if (!imageRes.ok) {
           console.warn("Image update endpoint returned an error, but JSON text update succeeded.");
        }
      } catch (_) {
        console.warn("Network error during image upload, but text update succeeded.");
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/[locale]/dashboard', 'page');
    revalidatePath(`/hubs/${slug}`);
    revalidatePath('/', 'layout');
    revalidateTag('all-hubs');
    return { success: true, message: jsonResult.message || "Updated" };
  } catch (e) {
    return { error: "Network Error" };
  }
}

export async function deleteHub(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };


  try {
    const res = await fetch(`${API_BASE_URL}/hubs/${slug}`, {
      method: "DELETE",
      headers: { "Accept": "application/json", Authorization: `Bearer ${token}` }
    });
    const result = await res.json();
    if (res.ok) {
      revalidatePath('/dashboard');
      revalidatePath('/[locale]/dashboard', 'page');
      revalidatePath('/', 'layout');
      revalidateTag('all-hubs');
      return { success: true, message: "Deleted" };
    }
    return { error: result.message || "Failed" };
  } catch (e) {
    return { error: "Network Error" };
  }
}

// Proxies image downloads to bypass strict Client-side CORS issues
export async function downloadImageServer(url: string) {
  try {
    // Security mechanism: Only allow fetching from our backend
    if (!url.startsWith(API_BASE_URL.replace('/v1', '')) && !url.startsWith("https://karam.idreis.net")) {
      return { error: "Unauthorized image domain" };
    }

    const res = await fetch(url);
    if (!res.ok) return { error: "Failed to fetch image" };
    
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const type = res.headers.get('content-type') || 'image/jpeg';
    
    return { success: true, base64, type };
  } catch (e) {
    return { error: "Failed to fetch image" };
  }
}

