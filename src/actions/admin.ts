"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";

const API_BASE_URL = "https://karam.idreis.net/api/v1";

export async function getAdminHubs() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated", data: [] };

  try {
    const res = await fetch(`${API_BASE_URL}/hubs`, {
      method: "GET",
      headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
      next: { tags: ["admin-hubs"], revalidate: 0 }
    });
    const result = await res.json();
    if (!res.ok) return { error: `API Error ${res.status}: ${result.message || 'Failed to load hubs'}`, data: [] };
    return { success: true, data: result.data || result || [] };
  } catch (error) {
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
        revalidateTag('all-hubs');
        return { success: true, message: "Status updated" };
      }
      return { error: retryResult.message || "Failed" };
    }

    const result = await res.json();
    if (res.ok) {
      revalidatePath('/', 'layout');
      revalidateTag('all-hubs');
      return { success: true, message: "Status updated" };
    }
    return { error: result.message || "Failed" };
  } catch (error) {
    return { error: "Network Error" };
  }
}

export async function getAdminNotifications() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Unauthenticated", data: [] };

  try {
    const res = await fetch(`${API_BASE_URL}/admin/notifications`, {
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
