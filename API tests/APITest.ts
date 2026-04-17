 import { cookies } from "next/headers";
 async function getAdminReviews(){
    const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
 const res = await fetch(`https://karam.idreis.net/api/v1/admin/reviews`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      next: { tags: ["admin-reviews"], revalidate: 0 },
    });
     let result: any = null;
    try { result = await res.json(); } catch { result = null; }
    const actualReviewsArray = result?.data?.data?.data || [];
    console.log("reviews: ",actualReviewsArray);
}

export function APITest() {
    console.log("test");
    getAdminReviews();
    return null;
}