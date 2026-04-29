import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';

import { CONFIG } from "@/src/config";

const API_BASE_URL = `${CONFIG.API_URL}/api/v1`;


export const maxDuration = 60; // Prevent 30-second Next.js default timeout during large uploads

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    // Safely extract the parsed FormData from Next.js req wrapper
    const formData = await req.formData();

    try {
       const response = await axios.post(`${API_BASE_URL}/hubs/${slug}`, formData, {
         headers: {
           "Authorization": `Bearer ${token}`,
           "Accept": "application/json",
           "X-HTTP-Method-Override": "PUT",
           // axios automatically handles form-data boundaries
         }
       });

       return NextResponse.json(response.data, { status: response.status });
    } catch (backendError: any) {
       console.error("Laravel Backend error:", backendError?.response?.data || backendError.message);
       const status = backendError?.response?.status || 500;
       const errorMsg = backendError?.response?.data?.message || "Error communicating with backend API";
       return NextResponse.json({ error: errorMsg }, { status });
    }

  } catch (error) {
    console.error("Image proxy rewrite error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
