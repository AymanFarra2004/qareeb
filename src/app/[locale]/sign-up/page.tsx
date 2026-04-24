import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SignUpView from "../components/auth/SignUpView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("SignUp");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical: `/${locale}/sign-up`,
      languages: {
        en: '/en/sign-up',
        ar: '/ar/sign-up',
      },
    },
  };
}

export default function SignUpPage() {
  return <SignUpView />;
}
