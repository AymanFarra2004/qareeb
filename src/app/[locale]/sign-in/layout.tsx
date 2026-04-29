import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CONFIG } from '@/src/config';


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SignIn' });
  const baseUrl = CONFIG.APP_URL;

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {
      canonical: `${baseUrl}/${locale}/sign-in`,
      languages: {
        'ar': `${baseUrl}/ar/sign-in`,
        'en': `${baseUrl}/en/sign-in`,
        'x-default': `${baseUrl}/ar/sign-in`,
      },
    },
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: t('meta.title'),
      description: t('meta.description'),
    },
  };
}

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
