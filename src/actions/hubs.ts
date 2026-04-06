"use server";

import { cookies } from "next/headers";

const API_BASE_URL = "https://karam.idreis.net/api/v1"; 
// Using v1 as confirmed manually; the POST endpoints for services likely need backend route matching verification

export async function getAllHubs() {
  try {
    const res = await fetch(`${API_BASE_URL}/hubs`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      next: { tags: ['all-hubs'], revalidate: 60 }
    });
    const result = await res.json();
    if (res.ok) {
       return { success: true, data: result.data || result || [] };
    }
    return { error: result.message || "Failed to fetch hubs", data: [] };
  } catch (error) {
    return { error: "Network Error", data: [] };
  }
}

export async function getMyHubs() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { error: "Unauthenticated", data: [] };
  }

  try {
    // Insomnia showed `/api/hubs/my`. 
    // Trying the endpoint with the standard v1 base.
    const res = await fetch(`${API_BASE_URL}/hubs/my`, {
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
       return { success: true, data: result.data || result || [] };
    }
    
    return { error: result.message || "Failed to fetch hubs", data: [] };
  } catch (error) {
    console.error("Error fetching hubs:", error);
    return { error: "Network Error", data: [] };
  }
}

export async function getHubBySlug(slugOrId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated", data: null };

  try {
    const res = await fetch(`${API_BASE_URL}/hubs/${slugOrId}`, {
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

    if (res.ok && result) {
      return { success: true, data: result.data || result };
    }

    // Fallback: If it's a 404 (possibly due to global scope 'approved' hiding pending hubs), use getMyHubs
    const myHubsRes = await getMyHubs();
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

    const payload: any = {
      name: {
        en: name_en,
        ar: name_ar || name_en,
      },
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

    const res = await fetch(`${API_BASE_URL}/hubs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    
    // Robust check: if ok, or if success status is present
    if (res.ok || result.status === 'success') {
      return { 
        success: true, 
        message: result.message || "Hub created successfully", 
        hub: result.data || result // Handle cases where data is at the root
      };
    }
    
    return { error: result.message || `Failed to create hub (Status ${res.status})` };
  } catch (error) {
    console.error("Error creating hub:", error);
    return { error: "Network Error" };
  }
}

// ============== SERVICES ==============

export async function getAllServices() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    const headers: Record<string, string> = { "Accept": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    
    const res = await fetch(`${API_BASE_URL}/services`, {
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
       return { success: true, data: result.data, message: "Added" };
    }
    return { error: result.message || "Failed to create service" };
  } catch (error) {
    return { error: "Network Error" };
  }
}


export async function getProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated", data: null };

  try {
    const res = await fetch(`${API_BASE_URL}/profile`, {
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

export async function getHubOffers(hubSlug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated", data: [] };

  try {
    const res = await fetch(`${API_BASE_URL}/hubs/${hubSlug}/offers`, {
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
      status: formData.get("status") as string || "active",
    };

    const res = await fetch(`${API_BASE_URL}/hubs/${hubSlug}/offers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    return res.ok && result.status === 'success' ? { success: true, message: "Added" } : { error: result.message || "Failed" };
  } catch (e) {
    return { error: "Network Error" };
  }
}

// ============== SOCIALS ==============

export async function getHubSocials(hubId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated", data: [] };

  try {
    const res = await fetch(`${API_BASE_URL}/hubs/${hubId}/social-accounts`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { tags: [`socials-${hubId}`], revalidate: 0 }
    });
    const result = await res.json();
    return res.ok ? { success: true, data: result.data || result || [] } : { error: "Error", data: [] };
  } catch (e) {
    return { error: "Network Error", data: [] };
  }
}

export async function addHubSocial(hubId: string, prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };

  try {
    const payload = {
      platform: formData.get("platform") as string,
      url: formData.get("url") as string
    };

    const res = await fetch(`${API_BASE_URL}/hubs/${hubId}/social-accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    return res.ok && result.status === 'success' ? { success: true, message: "Added" } : { error: result.message || "Failed" };
  } catch (e) {
    return { error: "Network Error" };
  }
}

export async function updateHub(slug: string, prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };

  try {
    // Handling form data including dynamic selections
    const isMultipart = Array.from(formData.keys()).some(
      (key) => formData.get(key) instanceof File && (formData.get(key) as File).size > 0
    );

    let submitBody: BodyInit;
    let headers: Record<string, string> = {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
      "X-HTTP-Method-Override": "PUT" // Emulate PUT
    };

    if (isMultipart) {
      submitBody = formData;
    } else {
      // It's just JSON data. We construct a payload.
      headers["Content-Type"] = "application/json";
      headers["X-HTTP-Method-Override"] = "PUT";
      
      const payload: any = {};
      
      Array.from(formData.entries()).forEach(([key, value]) => {
        if (key === "service_ids") {
          payload[key] = formData.getAll(key).map(Number);
        } else {
          payload[key] = value;
        }
      });
      submitBody = JSON.stringify(payload);
    }

    const res = await fetch(`${API_BASE_URL}/hubs/${slug}`, {
      method: "POST", // API accepts POST for multipart with method spoofing, or we just try POST
      headers,
      body: submitBody
    });

    const result = await res.json();
    return res.ok ? { success: true, message: result.message || "Updated" } : { error: result.message || "Failed" };
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
    return res.ok ? { success: true, message: "Deleted" } : { error: result.message || "Failed" };
  } catch (e) {
    return { error: "Network Error" };
  }
}

