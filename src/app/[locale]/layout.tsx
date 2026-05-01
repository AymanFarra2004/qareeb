import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations, getMessages } from 'next-intl/server';
import StoreProvider from "@/src/providers/storeProvider";
import AuthHydrator from "@/src/providers/AuthHydrator";
import { ThemeProvider } from "@/src/providers/ThemeProvider";
import { Toaster } from "react-hot-toast";
import { cookies } from "next/headers";
import { CONFIG } from "@/src/config";
import { Analytics } from '@vercel/analytics/react';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Index' });

  const baseUrl = CONFIG.APP_URL;

  return {
    metadataBase: new URL(baseUrl),
    title: t('meta.title'),
    description: t('meta.description'),
    keywords: ["Gaza", "hubs", "internet", "electricity", "workspace", "Qareeb", "Palestine", "غزة", "قريب", "مساحة عمل", "مساحات عمل", "اماكن عمل", "اماكن كهرباء", "اماكن انترنت", "هب", "هبات"],
    authors: [{ name: "Qareeb Team" }],
    icons: {
      icon: '/qareeb-logo-location.png',
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'ar': `${baseUrl}/ar`,
        'en': `${baseUrl}/en`,
        'x-default': `${baseUrl}/ar`,
      },
    },
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      siteName: "Qareeb",
      type: "website",
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
    },
    twitter: {
      card: "summary_large_image",
      title: t('meta.title'),
      description: t('meta.description'),
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userCookie = cookieStore.get("user")?.value;
  let user = null;
  if (userCookie) {
    try {
    const decodedUser = decodeURIComponent(userCookie);
    if (decodedUser.startsWith('eyJ')) {
      const base64ToString = Buffer.from(decodedUser, 'base64').toString('utf-8');
      user = JSON.parse(base64ToString);
    } else {
      user = JSON.parse(decodedUser);
    }
    
  } catch (e) {
    console.error("Layout JSON Parse Error:", e);
    try { user = JSON.parse(userCookie); } catch(e2) {}
  }
  }

  const isRtl = locale === "ar";

  return (
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
            <StoreProvider> 
              {token && <AuthHydrator user={user} />}
              {children}
              <Analytics />
              <Toaster position="top-center" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white rounded-xl' }} />
            </StoreProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
