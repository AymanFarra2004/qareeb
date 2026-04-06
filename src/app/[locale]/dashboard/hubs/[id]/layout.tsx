import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hub Management | Habbat Owner',
  description: 'Manage settings, services, and offers for your hub.',
};

export default function HubManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
