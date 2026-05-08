"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { format12to24 } from "../lib/utils";
import { CONFIG } from "@/src/config";

const API_BASE_URL = `${CONFIG.API_URL}/api/v1`;


// Map next-intl locale codes to API lang query params
function getLangParam(locale: string = "ar"): string {
  return `lang=${locale === 'en' ? 'en' : 'ar'}`;
}
// Using v1 as confirmed manually; the POST endpoints for services likely need backend route matching verification

/**
 * Fetches the full flat locations list (governorates, cities, areas) from the public API.
 * No authentication required.
 */
export async function getPublicLocations(locale: string = "ar") {
  try {
    const langParam = getLangParam(locale);
    const res = await fetch(`${API_BASE_URL}/locations?${langParam}`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      next: { tags: ["public-locations"], revalidate: 3600 }, // cache for 1 hour
    });
    const result = await res.json();
    if (res.ok && result.status === "success") {
      return { success: true, data: result.data as LocationEntry[] };
    }
    return { error: result.message || "Failed to fetch locations", data: [] as LocationEntry[] };
  } catch (error) {
    return { error: "Network Error", data: [] as LocationEntry[] };
  }
}

export type LocationEntry = {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  type: "governorate" | "city" | "area";
};

export type UserLocationContext = {
  userAreaId: number | null;
  userCityId: number | null;
  userGovernorateId: number | null;
  allLocations: LocationEntry[];
};

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
      next: { tags: ['my-hubs'], revalidate: 0 }
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

export async function getHubDataBySlugForManagement(slugOrId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated", data: null };
  try {
    const [resAr, resEn] = await Promise.all([
      fetch(`${API_BASE_URL}/hubs/${slugOrId}?lang=ar`,{
         headers: {
           "Accept":"application/json",
           "Authorization": `Bearer ${token}`
         },
          next: { revalidate: 0 } }),
      fetch(`${API_BASE_URL}/hubs/${slugOrId}?lang=en`, {
         headers: {
           "Accept":"application/json",
           "Authorization": `Bearer ${token}`
         }, next: { revalidate: 0 } })
    ]);

    if (!resAr.ok || !resEn.ok) {
      throw new Error("Failed to fetch data from one or both locales");
    }

    const jsonAr = await resAr.json();
    const jsonEn = await resEn.json();

    const dataAr = jsonAr.data;
    const dataEn = jsonEn.data;

    return {
      success: true,
      data: {
        name: {
          ar: dataAr.name || "",
          en: dataEn.name || ""
        },
        description: {
          ar: dataAr.description || "",
          en: dataEn.description || ""
        },
        address_details: {
          ar: dataAr.address_details || "",
          en: dataEn.address_details || ""
        },
        contact: dataAr.contact || "",
        location_id: dataAr.location.id || null,
        offers: {
          ar: dataAr.offers || [],
          en: dataEn.offers || []
        },
        hourly_price: dataAr.hourly_price || 0,
        
      }
    };
  } catch (error) {
    console.error("Error in getHubDataBySlugForManagement:", error);
    return { success: false, error: "Network Error or Data Mismatch" };
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
      cache: 'no-store',
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

    if (!name_ar) return { error: "اسم المركز (بالعربية) مطلوب" };
    if (!location_id || isNaN(location_id) || location_id <= 0) {
      return { error: "يرجى اختيار موقع محدد (محافظة، مدينة، أو منطقة)" };
    }

    const hourly_price_raw = formData.get("hourly_price");
    const hourly_price = hourly_price_raw ? Number(hourly_price_raw) : undefined;

    const payload: any = {
      name: {
        en: name_en || "",
        ar: name_ar,
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
    const startTime = formData.get("start_time") as string;
    const endTime = formData.get("end_time") as string;
    
    // Fallback for old fields
    const startHour = formData.get("start_hour");
    const startPeriod = formData.get("start_period") as string;
    const endHour = formData.get("end_hour");
    const endPeriod = formData.get("end_period") as string;

    if (startTime && endTime) {
      payload.working_hours = {
        start: startTime,
        end: endTime
      };
      payload.working_hours_start = startTime;
      payload.working_hours_end = endTime;
    } else if (startHour && startPeriod && endHour && endPeriod) {
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
    
    let result: any = null;
    let resOk = false;
    let resStatus = 0;

    try {
      const controller = new AbortController();
      // Increase timeout slightly before aborting (e.g. 45 seconds to allow backend to finish)
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const res = await fetch(`${API_BASE_URL}/hubs?${langParam}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      resOk = res.ok;
      resStatus = res.status;

      const text = await res.text();
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error("JSON parse error for Hub creation. Raw:", text);
      }
    } catch (fetchError) {
      console.error("Fetch API error during hub creation:", fetchError);
    }

    // ─── Recovery Check: If we failed to get a normal success response ────────
    if (!result || (!resOk && result?.status !== 'success')) {
      console.log("Creation API failed or timed out. Attempting recovery check...");
      
      // Delay to give Laravel time to commit the transaction if it was just a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        // We call getMyHubs from the same file, to see if the hub got created
        const myHubsRes = await getMyHubs();
        if (myHubsRes.success && Array.isArray(myHubsRes.data)) {
          const enName = payload.name.en;
          const recoveredHub = myHubsRes.data.find((h: any) => 
             h.name === enName || (h.name && h.name.en === enName)
          );
          
          if (recoveredHub && recoveredHub.slug) {
            result = {
              status: 'success',
              message: "Hub created (Recovered from timeout)",
              data: recoveredHub
            };
            resOk = true;
          }
        }
      } catch (recoveryError) {
        console.error("Recovery check failed:", recoveryError);
      }
    }

    if (!result || (!resOk && result.status !== 'success')) {
      return { error: result?.message || `فشل إنشاء المركز (الحالة ${resStatus || 'خطأ في الشبكة'})` };
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

    // ─── Step 3: Create custom service if provided ──────────────────────────
    if (hubSlug && (customNameAr?.trim() || customNameEn?.trim())) {
      try {
        const customServicePayload = {
          name: {
            en: customNameEn?.trim() || "",
            ar: customNameAr?.trim() || customNameEn?.trim(),
          },
          description: {
            en: customDescEn?.trim() || "",
            ar: customDescAr?.trim() || "",
          },
          is_active: true
        };

        await fetch(`${API_BASE_URL}/hubs/${hubSlug}/custom-services`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(customServicePayload),
        });
      } catch (customServiceError) {
        console.error("Custom service creation failed after hub creation:", customServiceError);
      }
    }

    // ─── Step 4: Create initial offers if provided (Subscriptions by default) ───
    const offerTitlesAr = formData.getAll("offer_title_ar[]") as string[];
    const offerDescriptionsAr = formData.getAll("offer_description_ar[]") as string[];
    const offerTypes = formData.getAll("offer_type[]") as string[];
    const offerPrices = formData.getAll("offer_price[]") as string[];
    const offerDurations = formData.getAll("offer_duration[]") as string[];

    if (hubSlug && offerTitlesAr.length > 0) {
      for (let i = 0; i < offerTitlesAr.length; i++) {
        const titleAr = offerTitlesAr[i];
        if (!titleAr?.trim()) continue;

        try {
          const offerPayload = {
            title: {
              en: "", 
              ar: titleAr.trim(),
            },
            description: {
              en: "",
              ar: (offerDescriptionsAr[i] || "").trim(),
            },
            type: offerTypes[i] || "monthly",
            price: Number(offerPrices[i] || 0),
            duration: Number(offerDurations[i] || 0),
            starts_at: null, // Subscription = unlimited
            ends_at: null,   // Subscription = unlimited
            is_global: false,
            status: "active",
          };

          await fetch(`${API_BASE_URL}/hubs/${hubSlug}/offers`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json", 
              "Accept": "application/json", 
              "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify(offerPayload),
          });
        } catch (offerError) {
          console.error(`Initial offer ${i} creation failed:`, offerError);
        }
      }
    }

    if (hubSlug) {
      revalidatePath('/dashboard');
      revalidatePath('/[locale]/dashboard', 'page');
      revalidatePath('/', 'layout');
      revalidateTag('all-hubs', 'layout');
    }

    return {
      success: true,
      message: result.message || "تم إنشاء المركز بنجاح",
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
    const nameEn = formData.get("name_en") as string;
    const nameAr = formData.get("name_ar") as string;
    
    if (!nameAr && !nameEn) return { error: "اسم الخدمة مطلوب" };

    const payload = {
      name: {
        en: nameEn || "",
        ar: nameAr || nameEn,
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
      revalidateTag(`hub-services-${hubSlug}`, 'page');
      return { success: true, data: result.data, message: "تمت إضافة الخدمة بنجاح" };
    }
    return { error: result.message || "فشل إضافة الخدمة" };
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
      revalidateTag(`hub-services-${hubSlug}`, 'page');
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

  const formValues = Object.fromEntries(formData.entries());

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
      starts_at: formData.get("starts_at") ? (formData.get("starts_at") as string) + " 00:00:00" : null,
      ends_at: formData.get("ends_at") ? (formData.get("ends_at") as string) + " 00:00:00" : null,
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
      return { success: true, message: "تمت إضافة العرض بنجاح" };
    }
    return { error: result.message || "فشل إضافة العرض", data: formValues };
  } catch (e) {
    return { error: "Network Error", data: formValues };
  }
}

export async function updateHubOffer(hubSlug: string, offerId: number, prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };

  const formValues = Object.fromEntries(formData.entries());

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
      starts_at: formData.get("starts_at") ? (formData.get("starts_at") as string) + " 00:00:00" : null,
      ends_at: formData.get("ends_at") ? (formData.get("ends_at") as string) + " 00:00:00" : null,
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
      return { success: true, message: "تم تحديث العرض بنجاح" };
    }
    return { error: result.message || "فشل تحديث العرض", data: formValues };
  } catch (e) {
    return { error: "Network Error", data: formValues };
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
      revalidateTag(`offers-${hubSlug}`, 'page');
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
    const res = await fetch(`${API_BASE_URL}/hubs/${hubId}?${langParam}`, {
      headers: { Authorization: `Bearer ${token}`, "Accept": "application/json" },
      next: { tags: [`socials-${hubId}`], revalidate: 0 }
    });
    
    const result = await res.json();
    if (res.ok){
      const socialsAccounts = result.data.social_accounts;
      return { success: true, data: socialsAccounts };
    }
    return { error: "Error", data: [] };
  } catch (e) {
    return { error: "Network Error", data: [] };
  }
}

export interface SocialAccount {
  platform: string;
  url: string;
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

/**
 * Saves the full social_accounts array to the hub via PUT.
 * Sends: { social_accounts: [{ platform, url }, ...] }
 */
export async function updateHubSocials(hubSlug: string, socials: SocialAccount[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };

  try {
    const payload = { social_accounts: socials };
    const res = await fetch(`${API_BASE_URL}/hubs/${hubSlug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (res.ok && result.status === "success") {
      revalidatePath(`/hubs/${hubSlug}`);
      revalidatePath(`/dashboard/hubs/${hubSlug}`);
      revalidateTag(`socials-${hubSlug}`, "page");
      return { success: true, message: result.message || "Social accounts updated" };
    }
    return { error: result.message || "Failed to update social accounts" };
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
      } else if (key.includes("[") && key.endsWith("]")) {
        // Handle nested keys like name[en] or description[ar]
        const parts = key.split(/[\[\]]/).filter(Boolean);
        let current = payload;
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (i === parts.length - 1) {
            current[part] = value;
          } else {
            current[part] = current[part] || {};
            current = current[part];
          }
        }
      } else {
        payload[key] = value;
      }
    });

    // Handle working hours specifically if present
    const startTime = formData.get("start_time") as string;
    const endTime = formData.get("end_time") as string;

    const startHour = formData.get("start_hour");
    const startPeriod = formData.get("start_period") as string;
    const endHour = formData.get("end_hour");
    const endPeriod = formData.get("end_period") as string;

    if (startTime && endTime) {
      payload.working_hours = {
        start: startTime,
        end: endTime
      };
      payload.working_hours_start = startTime;
      payload.working_hours_end = endTime;
    } else if (startHour && startPeriod && endHour && endPeriod) {
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
      return { error: jsonResult.message || "فشل تحديث بيانات المركز" };
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

    // --- Step 3: Handle custom service if provided ---
    if (slug && (customNameAr?.trim() || customNameEn?.trim())) {
      try {
        const customServicePayload = {
          name: {
            en: customNameEn?.trim() || "",
            ar: customNameAr?.trim() || customNameEn?.trim(),
          },
          description: {
            en: customDescEn?.trim() || "",
            ar: customDescAr?.trim() || "",
          },
          is_active: true
        };

        await fetch(`${API_BASE_URL}/hubs/${slug}/custom-services`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(customServicePayload)
        });
      } catch (customServiceError) {
        console.warn("Custom service update failed, but hub text update succeeded.");
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/[locale]/dashboard', 'page');
    revalidatePath(`/hubs/${slug}`);
    revalidatePath('/', 'layout');
    revalidateTag('all-hubs', 'layout');
    return { success: true, message: jsonResult.message || "تم التحديث بنجاح" };
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
      revalidateTag('all-hubs', 'layout');
      return { success: true, message: "Deleted" };
    }
    return { error: result.message || "Failed" };
  } catch (e) {
    return { error: "Network Error" };
  }
}

// ============== REVIEWS ==============

/** Fetch all reviews for a hub (public, no auth needed)
 * API response: { data: { reviews: [...], average_rating: "5.0000", review_count: 2 } }
 */
export async function getHubReviews(hubSlug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/hubs/${hubSlug}/reviews`, {
      headers: { "Accept": "application/json" },
      next: { tags: [`reviews-${hubSlug}`], revalidate: 0 },
    });
    let result: any = null;
    try { result = await res.json(); } catch { result = null; }
    if (res.ok && result) {
      // Real shape: { status:'success', data: { reviews: [...], average_rating, review_count } }
      const inner = result.data || result;
      const reviews = Array.isArray(inner?.reviews) ? inner.reviews
        : Array.isArray(inner) ? inner
        : [];
      const averageRating = parseFloat(inner?.average_rating) || 0;
      const reviewCount = inner?.review_count ?? reviews.length;
      return { success: true, data: reviews, averageRating, reviewCount };
    }
    return { error: result?.message || "Failed to fetch reviews", data: [], averageRating: 0, reviewCount: 0 };
  } catch {
    return { error: "Network Error", data: [], averageRating: 0, reviewCount: 0 };
  }
}

/** Fetch the currently authenticated user's review for a hub (null when they haven't reviewed) */
export async function getMyHubReview(hubSlug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { success: true, data: null, authenticated: false };

  try {
    const res = await fetch(`${API_BASE_URL}/hubs/${hubSlug}/my-review`, {
      headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
      next: { revalidate: 0 },
    });

    // A 404 or any non-success status just means the user hasn't reviewed yet — not an error
    if (!res.ok) return { success: true, data: null, authenticated: true };

    let result: any = null;
    try { result = await res.json(); } catch { result = null; }

    if (result?.status === "success" && result?.data) {
      return { success: true, data: result.data, authenticated: true };
    }
    // status !== "success" (e.g. "لم تقم بتقييم هذا الهب") → no review yet
    return { success: true, data: null, authenticated: true };
  } catch {
    return { success: true, data: null, authenticated: true };
  }
}

/** Create (POST) or update (PUT) the authenticated user's review for a hub.
 *  Only includes `comment` in the body when it is non-empty to avoid backend validation errors.
 *  `isUpdate` must be explicitly `true` (passed by the caller who knows the user already has a review).
 */
export async function submitHubReview(hubSlug: string, rating: number, comment: string, isUpdate = false) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };

  try {
    const method = isUpdate ? "PUT" : "POST";
    const body: Record<string, any> = { rating };
    if (comment && comment.trim().length > 0) {
      body.comment = comment.trim();
    }

    const res = await fetch(`${API_BASE_URL}/hubs/${hubSlug}/reviews`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    let result: any = null;
    try { result = await res.json(); } catch { result = null; }

    if (res.ok) {
      revalidateTag(`reviews-${hubSlug}`, "page");
      return { success: true, data: result?.data || result };
    }

    // If PUT failed because no prior review exists (e.g. stale isUpdate flag), retry with POST
    if (isUpdate && !res.ok) {
      const retryRes = await fetch(`${API_BASE_URL}/hubs/${hubSlug}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      let retryResult: any = null;
      try { retryResult = await retryRes.json(); } catch { retryResult = null; }
      if (retryRes.ok) {
        revalidateTag(`reviews-${hubSlug}`, "page");
        return { success: true, data: retryResult?.data || retryResult };
      }
      return { error: retryResult?.message || "Failed to submit review" };
    }

    return { error: result?.message || `Failed to ${isUpdate ? 'update' : 'submit'} review` };
  } catch {
    return { error: "Network Error" };
  }
}

/** Delete the authenticated user's own review for a hub */
export async function deleteMyHubReview(hubSlug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };

  try {
    const res = await fetch(`${API_BASE_URL}/hubs/${hubSlug}/reviews`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    let result: any = null;
    try { result = await res.json(); } catch { result = null; }

    if (res.ok) {
      revalidateTag(`reviews-${hubSlug}`, "page");
      return { success: true, message: result?.message || "Review deleted" };
    }
    return { error: result?.message || "Failed to delete review" };
  } catch {
    return { error: "Network Error" };
  }
}

// Proxies image downloads to bypass strict Client-side CORS issues
export async function downloadImageServer(url: string) {
  try {
    // Security mechanism: Only allow fetching from our backend
    try {
      const parsedUrl = new URL(url);
      // Ensure the hostname is related to the API to prevent SSRF
      const apiHostname = new URL(CONFIG.API_URL).hostname;
      const isAllowed = parsedUrl.hostname.includes(apiHostname) || 
                        parsedUrl.hostname.includes("pub-a1221038980d454e849a65bacb03f448.r2.dev");
      
      if (!isAllowed) {
        return { error: "Unauthorized image domain" };
      }
    } catch {
      return { error: "Invalid URL" };
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

