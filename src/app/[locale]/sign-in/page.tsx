"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Link, useRouter } from '@/src/i18n/routing'
import { MapPin, Mail, Lock, ArrowRight, Loader2 } from "lucide-react"
import { Header } from "@/components/header/Header"
import { Footer } from "@/components/footer/Footer"
import { loginUser } from "@/src/actions/auth"

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in"}
      {!pending && <ArrowRight className="h-4 w-4" />}
    </button>
  );
}

export default function SignInPage() {
  const [state, formAction] = useActionState(loginUser, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push("/");
      router.refresh();
    }
  }, [state, router]);
  return (
     <div className="flex flex-col min-h-screen">
            <Header />
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-background">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link href="/" className="flex items-center gap-2 mb-10">
            <MapPin className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl tracking-tight text-foreground">
              Habbat
            </span>
          </Link>

          <div>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to manage your hubs or save your favorites.
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
                  {state.message} Redirecting...
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    defaultValue={state?.fields?.email || ""}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-input rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-input rounded-xl bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                    placeholder="••••••••"
                  />
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
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary hover:text-primary/80">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <SubmitButton />
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/sign-up" className="font-medium text-primary hover:text-primary/80">
                  Sign up instead
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
        <div className="absolute inset-0 bg-black/40 z-0" />
        <div className="absolute bottom-10 left-10 right-10 z-20 text-white">
          <blockquote className="text-2xl font-bold leading-relaxed mb-4">
            "Connecting communities when they need it most."
          </blockquote>
          <p className="text-white/80 font-medium">— Habbat Initiative</p>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  )
}