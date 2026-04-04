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

export async function getHubBySlug(slug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated", data: null };

  try {
    const res = await fetch(`${API_BASE_URL}/hubs/${slug}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      next: { revalidate: 0 }
    });
    const result = await res.json();
    if (res.ok) {
      return { success: true, data: result.data || result };
    }
    return { error: result.message || "Failed to fetch hub", data: null };
  } catch (error) {
    return { error: "Network Error", data: null };
  }
}

export async function createHub(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return { error: "Unauthenticated" };

  try {
    const payload = {
      name: {
        en: formData.get("name_en") as string,
        ar: formData.get("name_ar") as string,
      },
      description: {
        en: formData.get("description_en") as string,
        ar: formData.get("description_ar") as string,
      },
      address_details: {
        en: formData.get("address_en") as string,
        ar: formData.get("address_ar") as string,
      },
      contact: formData.get("contact") as string,
      location_id: Number(formData.get("location_id")),
      social_accounts: [] as any[],
    };

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
    
    if (res.ok && result.status === 'success') {
      const hubId = result.data?.id || result.data?.slug;
      
      // If service name was provided, make sequential API call to attach the initial service
      const serviceNameEn = formData.get("service_name_en") as string;
      if (serviceNameEn && hubId) {
        const servicePayload = {
          name: {
            en: serviceNameEn,
            ar: formData.get("service_name_ar") as string || serviceNameEn,
          },
          description: {
            en: formData.get("service_desc_en") as string || "",
            ar: formData.get("service_desc_ar") as string || "",
          }
        };
        try {
          await fetch(`${API_BASE_URL}/hubs/${hubId}/services`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(servicePayload)
          });
        } catch (e) {
          console.error("Failed adding initial service", e);
        }
      }
      
      return { success: true, message: result.message || "Hub created successfully", hub: result.data };
    }
    
    return { error: result.message || "Failed to create hub" };
  } catch (error) {
    console.error("Error creating hub:", error);
    return { error: "Network Error" };
  }
}

// ============== SERVICES ==============

export async function getHubServices(hubId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated", data: [] };

  try {
    const res = await fetch(`${API_BASE_URL}/hubs/${hubId}/services`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { tags: [`services-${hubId}`], revalidate: 0 }
    });
    const result = await res.json();
    return res.ok ? { success: true, data: result.data || result || [] } : { error: "Error", data: [] };
  } catch (e) {
    return { error: "Network Error", data: [] };
  }
}

export async function addHubService(hubId: string, prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };

  try {
    const payload = {
      name: {
        en: formData.get("name_en") as string,
        ar: formData.get("name_ar") as string,
      },
      description: {
        en: formData.get("description_en") as string,
        ar: formData.get("description_ar") as string,
      }
    };

    const res = await fetch(`${API_BASE_URL}/hubs/${hubId}/services`, {
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

