"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";

import { CONFIG } from "@/src/config";

const API_BASE_URL = `${CONFIG.API_URL}/api/v1`;


// Internal helper for auth
async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return token ? { "Authorization": `Bearer ${token}` } : null;
}

export async function getAdminUsers() {
  const authHeaders = await getAuthHeaders();
  if (!authHeaders) return { error: "Unauthenticated", data: [] };

  try {
    const res = await fetch(`${API_BASE_URL}/admin/users?per_page=1000`, {
      method: "GET",
      headers: { "Accept": "application/json", ...authHeaders },
      next: { tags: ["admin-users"], revalidate: 0 }
    });
    
    if (!res.ok) {
      if (res.status === 403) return { error: "Access denied.", data: [] };
      return { error: "Failed to fetch users", data: [] };
    }
    
    const result = await res.json();
    return { success: true, data: result.data || result || [] };
  } catch (error) {
    return { error: "Network Error", data: [] };
  }
}

export async function getAdminUserStatistics() {
  const authHeaders = await getAuthHeaders();
  if (!authHeaders) return { error: "Unauthenticated", data: null };

  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/statistics`, {
      method: "GET",
      headers: { "Accept": "application/json", ...authHeaders },
      next: { tags: ["admin-users-statistics"], revalidate: 0 }
    });
    
    if (!res.ok) {
      return { error: "Failed to fetch statistics", data: null };
    }
    
    const result = await res.json();
    return { success: true, data: result.data || result || null };
  } catch (error) {
    return { error: "Network Error", data: null };
  }
}

export async function createAdminUser(data: any) {
  const authHeaders = await getAuthHeaders();
  if (!authHeaders) return { error: "Unauthenticated" };

  try {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      method: "POST",
      headers: { 
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...authHeaders 
      },
      body: JSON.stringify(data)
    });
    
    const result = await res.json();
    
    if (!res.ok) {
      return { error: result.message || result.error || "Failed to create user" };
    }
    
    revalidateTag("admin-users", "layout");
    revalidateTag("admin-users-statistics", "layout");
    return { success: true, data: result.data || result };
  } catch (error) {
    console.log("addinng user error: ",error);
    return { error: "Network Error" };
  }
}

export async function updateAdminUser(id: string | number, data: any) {
  const authHeaders = await getAuthHeaders();
  if (!authHeaders) return { error: "Unauthenticated" };

  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: "PUT",
      headers: { 
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...authHeaders 
      },
      body: JSON.stringify(data)
    });
    
    const result = await res.json();
    
    if (!res.ok) {
      return { error: result.message || result.error || "Failed to update user" };
    }
    
    revalidateTag("admin-users", "layout");
    return { success: true, data: result.data || result };
  } catch (error) {
    return { error: "Network Error" };
  }
}

export async function deleteAdminUser(id: string | number) {
  const authHeaders = await getAuthHeaders();
  if (!authHeaders) return { error: "Unauthenticated" };

  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: { "Accept": "application/json", ...authHeaders }
    });
    
    if (!res.ok) {
      const result = await res.json();
      return { error: result.message || result.error || "Failed to delete user" };
    }
    
    revalidateTag("admin-users", "layout");
    revalidateTag("admin-users-statistics", "layout");
    return { success: true };
  } catch (error) {
    return { error: "Network Error" };
  }
}
