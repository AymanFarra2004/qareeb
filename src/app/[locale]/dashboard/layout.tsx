import { DashboardClientWrapper } from "../components/dashboard/DashboardClientWrapper";
import type { Metadata } from 'next';
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Dashboard' });
 
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    robots: { index: false, follow: false },
    alternates: {
      canonical: `/${locale}/dashboard`,
      languages: {
        en: '/en/dashboard',
        ar: '/ar/dashboard',
      },
    },
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <DashboardClientWrapper>
      {children}
    </DashboardClientWrapper>
  );
}
