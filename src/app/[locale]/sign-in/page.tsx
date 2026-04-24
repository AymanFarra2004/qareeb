import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SignInView from "../components/auth/SignInView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("SignIn");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `/${locale}/sign-in`,
      languages: {
        en: '/en/sign-in',
        ar: '/ar/sign-in',
      },
    },
  };
}

export default function SignInPage() {
  return <SignInView />;
}