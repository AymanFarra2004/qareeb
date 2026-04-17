"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";

const API_BASE_URL = "https://karam.idreis.net/api/v1";

// Map next-intl locale codes to API lang query params
function getLangParam(locale: string = "ar"): string {
  return `lang=${locale === 'en' ? 'en' : 'ar'}`;
}

export interface HubsResponse {
  success?: boolean;
  error?: string;
  data: any[];
}

export async function getAdminHubs(locale: string = "ar"): Promise<HubsResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated", data: [] };

  try {
    const langParam = getLangParam(locale);
    // Fetch from both contexts in parallel
    // 1. Admin context (Token): Usually returns pending/rejected applications
    // 2. Guest context (No Token): Usually returns approved public listings
    const [adminRes, guestRes] = await Promise.all([
      fetch(`${API_BASE_URL}/front/hubs?${langParam}`, {
        method: "GET",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
        next: { tags: ["admin-hubs"], revalidate: 0 }
      }),
      fetch(`${API_BASE_URL}/front/hubs?${langParam}`, {
        method: "GET",
        headers: { "Accept": "application/json" },
        next: { tags: ["all-hubs"], revalidate: 0 }
      })
    ]);

    const adminResult = await adminRes.json();
    const guestResult = await guestRes.json();

    const extractHubs = (res: any) => {
      if (!res) return [];
      let data = res.data || res;
      // Handle pagination wrapper
      if (data && !Array.isArray(data) && Array.isArray(data.data)) {
        data = data.data;
      }
      return Array.isArray(data) ? data : [];
    };

    const adminHubs = extractHubs(adminResult);
    const guestHubs = extractHubs(guestResult);

    // Merge and de-duplicate by ID or Slug to ensure no duplicates if contexts overlap
    const uniqueHubs = new Map();
    [...adminHubs, ...guestHubs].forEach(hub => {
      const key = hub.id || hub.slug;
      if (key) uniqueHubs.set(key, hub);
    });

    return { success: true, data: Array.from(uniqueHubs.values()) };
  } catch (error) {
    console.error("Error fetching admin hubs:", error);
    return { error: "Network Error", data: [] };
  }
}

export async function updateHubStatus(slugOrId: string, status: string, rejectionReason?: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };

  try {
    const payload: any = { status };
    if (rejectionReason) {
      payload.rejection_reason = rejectionReason;
    }

    // Attempt POST for status update
    const res = await fetch(`${API_BASE_URL}/hubs/${slugOrId}/status`, {
      method: "POST", 
      headers: { 
        "Content-Type": "application/json", 
        "Accept": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok && res.status === 405) {
      // Fallback to PATCH
      const retryRes = await fetch(`${API_BASE_URL}/hubs/${slugOrId}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          "Accept": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      const retryResult = await retryRes.json();
      if (retryRes.ok) {
        revalidatePath('/', 'layout');
        revalidateTag('all-hubs', 'layout');
        return { success: true, message: "Status updated" };
      }
      return { error: retryResult.message || "Failed" };
    }

    const result = await res.json();
    if (res.ok) {
      revalidatePath('/admin/hubs');
      revalidatePath('/[locale]/admin/hubs', 'page');
      revalidatePath('/hubs');
      revalidatePath('/[locale]/hubs', 'page');
      revalidatePath('/', 'layout');
      revalidateTag('admin-hubs', 'layout');
      revalidateTag('all-hubs', 'layout');
      return { success: true, message: "Status updated" };
    }
    return { error: result.message || "Failed" };
  } catch (error) {
    return { error: "Network Error" };
  }
}

export async function getAdminNotifications(locale: string = "ar") {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated", data: [] };

  try {
    const langParam = getLangParam(locale);
    const res = await fetch(`${API_BASE_URL}/admin/notifications?${langParam}`, {
      method: "GET",
      headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
      next: { tags: ["admin-notifications"], revalidate: 0 }
    });
    const result = await res.json();
    if (!res.ok) {
      if (res.status === 403) return { error: "Access denied: This account does not have admin privileges.", data: [] };
      return { error: `API Error ${res.status}: ${result.message || 'Failed to fetch notifications'}`, data: [] };
    }
    return { success: true, data: result.data || result || [] };
  } catch (error) {
    return { error: "Network Error", data: [] };
  }
}

export async function markAllAdminNotificationsRead() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };

  try {
    const res = await fetch(`${API_BASE_URL}/admin/notifications/mark-all-read`, {
      method: "POST",
      headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
    });
    const result = await res.json();
    return res.ok ? { success: true, message: "Marked as read" } : { error: "Failed" };
  } catch (error) {
    return { error: "Network Error" };
  }
}

// 5. Delete Service
export async function deleteService(serviceId: number | string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };

  try {
    const res = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
      method: "DELETE",
      headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
    });
    const result = await res.json();
    return res.ok ? { success: true, message: "Service deleted" } : { error: result.message || "Failed to delete" };
  } catch (error) {
    return { error: "Network Error" };
  }
}

// ============== ADMIN REVIEWS ==============

/** Fetch all reviews across all hubs — admin only */
export async function getAdminReviews() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { success: false, error: "Unauthenticated", data: [] };
  }

  try {
    const res = await fetch(`https://karam.idreis.net/api/v1/admin/reviews`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      next: { tags: ["admin-reviews"], revalidate: 0 },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.message || `Server Error: ${res.status}`, 
        data: [] 
      };
    }

    const result = await res.json();

    const reviewsArray = result?.data?.data?.data || [];
    
    const paginationMeta = result?.data?.meta || null;

    return { 
      success: true, 
      data: reviewsArray, 
      meta: paginationMeta 
    };

  } catch (error) {
    console.error("Fetch Error in getAdminReviews:", error);
    return { success: false, error: "Network Error", data: [] };
  }
}

/** Delete any review by ID — admin only */
export async function deleteAdminReview(reviewId: number | string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated" };

  try {
    const res = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    let result: any = null;
    try { result = await res.json(); } catch { result = null; }

    if (res.ok) {
      revalidatePath("/admin/reviews");
      revalidatePath("/[locale]/admin/reviews", "page");
      return { success: true, message: result?.message || "Review deleted" };
    }
    return { error: result?.message || "Failed to delete review" };
  } catch (error) {
    return { error: "Network Error" };
  }
}
