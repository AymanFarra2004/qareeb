import { DashboardSidebar } from "../components/dashboard/DashboardSidebar";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Habbat Owner',
  description: 'Manage your hubs and connect with your community.',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  
  if (!userCookie) {
    redirect("/sign-in");
  }

  try {
    const user = JSON.parse(userCookie);
    if (user.role !== "hub_owner") {
      redirect("/");
    }
  } catch (e) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
