import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | Habbat',
  description: 'Join Habbat to manage a hub and help connect your community.',
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
