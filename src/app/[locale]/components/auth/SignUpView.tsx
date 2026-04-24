"use client";

import { Footer } from "@/components/footer/Footer";
import { Header } from "@/components/header/Header";
import { registerUser } from "@/src/actions/auth";
import { Link, useRouter } from "@/src/i18n/routing";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { LocationSelect } from "@/components/location/LocationSelect";
import { useTranslations } from "next-intl";
import { GoogleLoginButton } from "../auth/GoogleLoginButton";

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("SignUp");

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-l from-blue-600 to-purple-600 cursor-pointer hover:opacity-90"
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : t("signUp")}
      {!pending && <ArrowRight className="h-4 w-4" />}
    </button>
  );
}

export default function SignUpView() {
  const [state, formAction] = useActionState(registerUser, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const t = useTranslations("SignUp");

  if (state?.error) console.log(state.error);

  useEffect(() => {
    if (state?.success) {
      router.push("/");
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <div className="flex-1 flex flex-col md:flex-row-reverse pt-20">
        {/* Right side - Form Container */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-20 xl:px-24 pb-20">
          <div className="w-full max-w-sm mt-10">

            <div className="mb-6">
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                {t("createAccount")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>

            <form className="space-y-4" action={formAction}>
              {state?.error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded-lg">
                  {state.error}
                </div>
              )}
              {state?.success && (
                <div className="p-3 bg-green-100 border border-green-400 text-green-700 text-sm rounded-lg">
                  {state.message} {t("redirecting")}
                </div>
              )}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground"
                >
                  {t("nameLabel")}
                </label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    defaultValue={state?.fields?.name || ""}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-input rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm transition-colors"
                    placeholder={t("namePlaceholder")}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground"
                >
                  {t("emailLabel")}
                </label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    defaultValue={state?.fields?.email || ""}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-input rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm transition-colors"
                    placeholder={t("emailPlaceholder")}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  {t("passwordLabel")}
                </label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-input rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm transition-colors"
                    placeholder={t("passwordPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-foreground"
                >
                  {t("confirmPasswordLabel")}
                </label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-input rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm transition-colors"
                    placeholder={t("confirmPasswordPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <LocationSelect />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  {t("accountType")}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center justify-center gap-2 p-3 border border-input rounded-xl cursor-pointer hover:bg-muted/30 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-1 has-[:checked]:ring-primary">
                    <input
                      type="radio"
                      name="role"
                      value="user"
                      className="hidden"
                      defaultChecked={
                        !state?.fields?.role || state?.fields?.role === "user"
                      }
                    />
                    <span className="text-sm font-medium">{t("regularUser")}</span>
                  </label>
                  <label className="flex items-center justify-center gap-2 p-3 border border-input rounded-xl cursor-pointer hover:bg-muted/30 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-1 has-[:checked]:ring-primary">
                    <input
                      type="radio"
                      name="role"
                      value="hub_owner"
                      className="hidden"
                      defaultChecked={state?.fields?.role === "hub_owner"}
                    />
                    <span className="text-sm font-medium">{t("hubOwner")}</span>
                  </label>
                </div>
              </div>

              <div>
                <SubmitButton />
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-input"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">
                    {t("or")}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <GoogleLoginButton section="SignUp" />
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t("haveAccount")} {" "}
                <Link
                  href="/sign-in"
                  className="font-medium text-primary hover:underline"
                >
                  {t("signInInstead")}
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Left side - Image Container */}
        <div className="hidden md:block md:flex-1 relative">
          <div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-background/10 z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1500&auto=format&fit=crop')",
            }}
          />
          <div className="absolute inset-0 bg-black/30 z-0" />
        </div>
      </div>
      <Footer />
    </div>
  );
}
