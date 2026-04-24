"use client";

import { useState, useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Link, useRouter } from '@/src/i18n/routing'
import { MapPin, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react"
import { Header } from "@/components/header/Header"
import { Footer } from "@/components/footer/Footer"
import { loginUser } from "@/src/actions/auth"
import { useTranslations } from "next-intl";
import { GoogleLoginButton } from "../auth/GoogleLoginButton";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-l from-purple-600 to-blue-600 cursor-pointer hover:opacity-90"
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : label}
      {!pending && <ArrowRight className="h-4 w-4 rtl:rotate-180" />}
    </button>
  );
}

export default function SignInView() {
  const [state, formAction] = useActionState(loginUser, null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const t = useTranslations("SignIn");

  useEffect(() => {
    if (state?.success) {
      router.push("/");
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="min-h-screen flex flex-col md:flex-row pt-20">
        {/* Left side - Form */}
        <div className="flex-1 flex flex-col justify-center pb-20 px-4 sm:px-6 lg:px-20 xl:px-24 bg-background">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <Link href="/" className="flex items-center justify-center gap-2 mb-10">
              <img src="/logo.png" alt="Qareeb Logo" className="h-52 w-auto object-contain drop-shadow-md" />
            </Link>

            <div>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                {t("welcomeBack")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>

            <div className="mt-8">
              <form action={formAction} className="space-y-6">
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
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    {t("emailLabel")}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      defaultValue={state?.fields?.email || ""}
                      className="appearance-none block w-full ps-10 pe-3 py-3 border border-input rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    {t("passwordLabel")}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="appearance-none block w-full ps-10 pe-10 py-3 border border-input rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 end-0 pe-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ms-2 block text-sm text-foreground">
                      {t("rememberMe")}
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary hover:text-primary/80">
                      {t("forgotPassword")}
                    </a>
                  </div>
                </div>

                <div>
                  <SubmitButton label={t("signIn")} />
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
                  <GoogleLoginButton section="SignIn" />
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {t("noAccount")}{" "}
                  <Link href="/sign-up" className="font-medium text-primary hover:text-primary/80">
                    {t("signUpInstead")}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="hidden md:block md:flex-1 relative bg-muted">
          <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-background z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1500&auto=format&fit=crop')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600 z-0" />
          <div className="absolute bottom-10 start-10 end-10 z-20 text-white">
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
