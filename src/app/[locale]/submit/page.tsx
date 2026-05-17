import { redirect } from "next/navigation";
import { getUserProfile } from "@/src/actions/auth";

export default async function SubmitRedirectPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { data: userProfile } = await getUserProfile(locale);
  
  if (!userProfile) {
    redirect("/sign-in");
  }

  if (userProfile.role === "hub_owner") {
    redirect("/dashboard/hubs/new");
  } else {
    // Regular users cannot submit hubs
    redirect("/");
  }

  return null;
}