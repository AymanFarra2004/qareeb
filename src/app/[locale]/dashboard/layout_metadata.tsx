import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Habbat Owner',
  description: 'Manage your hubs and connect with your community.',
};

export default function DashboardIndexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
