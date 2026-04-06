import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SubmitRedirectPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  
  if (!userCookie) {
    redirect("/sign-in");
  }

  try {
    const user = JSON.parse(userCookie);
    if (user.role === "hub_owner") {
      redirect("/dashboard/hubs/new");
    } else {
      // Regular users cannot submit hubs
      redirect("/");
    }
  } catch (e) {
    redirect("/sign-in");
  }

  return null;
}