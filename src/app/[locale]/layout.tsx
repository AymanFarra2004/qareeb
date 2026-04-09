import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import StoreProvider from "@/src/providers/storeProvider";
import AuthHydrator from "@/src/providers/AuthHydrator";
import { ThemeProvider } from "@/src/providers/ThemeProvider";
import { Toaster } from "react-hot-toast";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Habbat - Connect to Essential Services in Gaza",
  description: "Habbat connects people in Gaza to essential hubs providing internet, electricity, workspaces, and essential services.",
  keywords: ["Gaza", "hubs", "internet", "electricity", "workspace", "Habbat", "Palestine"],
  authors: [{ name: "Habbat Team" }],
  openGraph: {
    title: "Habbat - Connect to Essential Services in Gaza",
    description: "Find the nearest internet, electricity, and workspace hubs in Gaza through Habbat.",
    siteName: "Habbat",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Habbat - Connect to Essential Services in Gaza",
    description: "Find the nearest internet, electricity, and workspace hubs in Gaza through Habbat.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userCookie = cookieStore.get("user")?.value;
  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch(e) {}
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <StoreProvider> 
            {token && user && <AuthHydrator user={user} />}
           <NextIntlClientProvider>{children}</NextIntlClientProvider>
           <Toaster position="top-center" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white rounded-xl' }} />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
