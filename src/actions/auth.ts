"use server";

import { cookies } from "next/headers";

// Map next-intl locale codes to API lang query params
function getLangParam(locale: string = "ar"): string {
  return `lang=${locale === 'en' ? 'en' : 'ar'}`;
}

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required", fields: { email, password: "" } };
  }

  try {
    const res = await fetch("https://karam.idreis.net/api/v1/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const body = await res.json();

    console.log("FULL LOGIN RESPONSE:", JSON.stringify(body, null, 2));
    if (!res.ok || body.status !== "success") {
      return { error: body.message || "Failed to log in. Please check your credentials.", fields: { email, password: "" } };
    }

    // Success, store the token securely in cookies
    if (body.data?.token) {
      const cookieStore = await cookies();
      
      const user = body.data?.user  || { name: body.data?.name || "User", email };
      cookieStore.set({
        name: "user",
        value: JSON.stringify(user),
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
      });

      cookieStore.set({
        name: "token",
        value: body.data.token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      return { success: true, message: body.message || "Logged in successfully" };
    }

    return { error: "Token missing from response" };
  } catch (error) {
    console.error("Login Error:", error);
    return { error: "An unexpected error occurred while sign in.", fields: { email, password: "" } };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("user");
}


export async function registerUser(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  console.log("name: ++++++++++++++++++",name, "++++++++++++++++");
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const password_confirmation = formData.get("password_confirmation") as string;
  const role = formData.get("role") as string;
  // const phone = formData.get("phone") as string;
  const locationIid = formData.get("location_id") as  string;
  const location_id = parseInt(locationIid, 10);
  // const specialization = formData.get("specialization") as string;

  try{
    const response = await fetch("https://karam.idreis.net/api/v1/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ name, email, password, password_confirmation, role, location_id }),
  });

  const body = await response.json();

  if (!response.ok || body.status !== "success") {
    return { error: body.message || "Failed to register. Please try again.", fields: { name, email, role, location_id: locationIid } };
  }

  // Set selected location_id in cookies for the application to remember
  if (location_id) {
    const cookieStore = await cookies();
    cookieStore.set({
      name: "user_location_id",
      value: String(location_id),
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  // Auto-login after successful registration
  const loginResult = await loginUser(prevState, formData);
  if (loginResult?.error) {
    return { 
      success: true, 
      message: "Registered successfully, but auto-login failed. Please sign in manually." 
    };
  }

  return { success: true, message: body.message || "Registered and logged in successfully" };
} catch (error) {
  console.log(error)
  console.error("Registration Error:", error);
    return { error: "An unexpected error occurred while registering.", fields: { name, email, role, location_id: locationIid } };
  }
}

export async function getUserProfile(locale: string = "ar") {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { error: "Unauthenticated", data: null };
  }

  try {
    const langParam = getLangParam(locale);
    const res = await fetch(`https://karam.idreis.net/api/v1/profile?${langParam}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      },
      next: { revalidate: 0 }
    });

    const body = await res.json();
    if (res.ok) {
      return { success: true, data: body.data || body };
    }
    return { error: body.message || "Failed to fetch profile", data: null };
  } catch (error) {
    return { error: "Network Error", data: null };
  }
}