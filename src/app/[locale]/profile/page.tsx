import { getUserProfile } from "@/src/actions/auth";
import { ProfileView } from "../components/profile/ProfileView";
import { Header } from "../components/header/Header";
import { Link } from "@/src/i18n/routing";
import { getLocale, getTranslations } from "next-intl/server";
import { UserX, LogIn } from "lucide-react";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Profile" });
  return {
    title: `${t("title")} | Habbat`,
    description: t("subtitle"),
  };
}

export default async function ProfilePage() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Profile" });

  const result = await getUserProfile(locale);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-muted/20 pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page heading */}
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              {t("title")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
          </div>

          {/* Error / Unauthenticated state */}
          {result.error || !result.data ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center rounded-3xl bg-background border border-border/60 shadow-sm animate-in fade-in duration-500">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
                <UserX className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {t("errorTitle")}
              </h2>
              <p className="text-muted-foreground max-w-sm mb-7">
                {result.error === "Unauthenticated"
                  ? t("unauthenticated")
                  : t("errorDesc")}
              </p>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
              >
                <LogIn className="h-4 w-4" />
                {t("signIn")}
              </Link>
            </div>
          ) : (
            <ProfileView profile={result.data} />
          )}
        </div>
      </main>
    </>
  );
}
