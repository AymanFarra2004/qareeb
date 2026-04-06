import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Habbat',
  description: 'Sign in to manage your hubs or save your favorite locations across Gaza.',
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
