const API_BASE_URL = "https://karam.idreis.net/api/v1";


export async function getLocationDataBySlugForManagement(slug: string) {
    try {
    const [resAr, resEn] = await Promise.all([
      fetch(`${API_BASE_URL}/locations/${slug}?lang=ar`, { next: { revalidate: 0 } }),
      fetch(`${API_BASE_URL}/locations/${slug}?lang=en`, { next: { revalidate: 0 } })
    ]);

    if (!resAr.ok || !resEn.ok) {
      throw new Error("Failed to fetch location data from one or both locales");
    }

    const jsonAr = await resAr.json();
    const jsonEn = await resEn.json();

    const nameAr = jsonAr?.data?.name;
    const nameEn = jsonEn?.data?.name;

    return {
      success: true,
      data: {
        nameAR: nameAr,
        nameEN: nameEn
      }
    };
  } catch (error) {
    console.error("Error in getLocationDataBySlugForManagement:", error);
    return { success: false, error: "Network Error or Data Mismatch" };
  }
}