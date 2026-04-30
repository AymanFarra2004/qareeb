"use client";

import { Footer } from "@/components/footer/Footer";
import { Header } from "@/components/header/Header";
import { updateUserProfile } from "@/src/actions/auth";
import { useRouter } from "@/src/i18n/routing";
import {
  ArrowRight,
  Loader2,
  Phone,
  User,
} from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { LocationSelect } from "@/components/location/LocationSelect";
import { useTranslations } from "next-intl";

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("CompleteProfile");

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-l from-blue-600 to-purple-600 cursor-pointer hover:opacity-90"
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : t("submit")}
      {!pending && <ArrowRight className="h-4 w-4" />}
    </button>
  );
}

export default function CompleteProfileView() {
  const [state, formAction] = useActionState(async (prevState: any, formData: FormData) => {
    const role = formData.get("role") as string;
    const location_id = formData.get("location_id") as string;
    const phone = formData.get("phone") as string;

    if (!role || !location_id) {
      return { error: "Role and location are required" };
    }

    const result = await updateUserProfile({
      role,
      location_id: parseInt(location_id, 10),
      phone: phone || undefined,
    });

    return result;
  }, null);

  const router = useRouter();
  const t = useTranslations("CompleteProfile");
  const tSignUp = useTranslations("SignUp");

  useEffect(() => {
    if (state?.success) {
      router.push("/");
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              {t("title")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded-lg">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {t("roleLabel")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center justify-center gap-2 p-3 border border-input rounded-xl cursor-pointer hover:bg-muted/30 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-1 has-[:checked]:ring-primary">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    className="hidden"
                    required
                    defaultChecked
                  />
                  <span className="text-sm font-medium">{tSignUp("regularUser")}</span>
                </label>
                <label className="flex items-center justify-center gap-2 p-3 border border-input rounded-xl cursor-pointer hover:bg-muted/30 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-1 has-[:checked]:ring-primary">
                  <input
                    type="radio"
                    name="role"
                    value="hub_owner"
                    className="hidden"
                  />
                  <span className="text-sm font-medium">{tSignUp("hubOwner")}</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {t("locationLabel")}
              </label>
              <LocationSelect />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-foreground"
              >
                {t("phoneLabel")}
              </label>
              <div className="mt-1 relative rounded-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-input rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm transition-colors"
                  placeholder={t("phonePlaceholder")}
                />
              </div>
            </div>

            <div className="pt-2">
              <SubmitButton />
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
