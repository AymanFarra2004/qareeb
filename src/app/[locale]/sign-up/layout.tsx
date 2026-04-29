import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CONFIG } from '@/src/config';


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SignUp' });
  const baseUrl = CONFIG.APP_URL;

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {
      canonical: `${baseUrl}/${locale}/sign-up`,
      languages: {
        'ar': `${baseUrl}/ar/sign-up`,
        'en': `${baseUrl}/en/sign-up`,
        'x-default': `${baseUrl}/ar/sign-up`,
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

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
