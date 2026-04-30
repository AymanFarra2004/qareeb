import { getTranslations } from "next-intl/server";
import CompleteProfileView from "../components/auth/CompleteProfileView";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CompleteProfile" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default function CompleteProfilePage() {
  return <CompleteProfileView />;
}
