import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit a Hub | Habbat',
  description: 'Add your internet or electricity hub to our network.',
};

export default function NewHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
