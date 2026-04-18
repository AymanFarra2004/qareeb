'use client'

import { Link, useRouter } from '@/src/i18n/routing'
import { MapPin, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react"
import { Header } from "@/components/header/Header"
import { Footer } from "@/components/footer/Footer"
import { registerUser } from "@/src/actions/auth"
import { useState, useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom";
import { LocationSelect } from "../components/location/LocationSelect";


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign up"}
      {!pending && <ArrowRight className="h-4 w-4" />}
    </button>
  );
}

export default function SignUpPage() {
  const [state, formAction] = useActionState(registerUser, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  if (state?.error) console.log(state.error);

  useEffect(() => {
    if (state?.success) {
      // Redirect to home page upon successful login
      router.push("/");
      router.refresh();
    }
  }, [state, router]);


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <div className="flex-1 flex flex-col md:flex-row-reverse">

        {/* Right side - Form Container */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="w-full max-w-sm">

            <Link href="/" className="flex items-center gap-2 mb-10">
              <MapPin className="h-8 w-8 text-primary" />
              <span className="font-bold text-2xl tracking-tight text-foreground">
                Habbat
              </span>
            </Link>

            <div className="mb-6">
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
                Create an account
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Join Habbat to manage a hub or save locations.
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
                  {state.message} Redirecting...
                </div>
              )}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground">Full Name</label>
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
                    placeholder="Ahmed Al-Masri"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">Email address</label>
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
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground">Password</label>
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
                    placeholder="••••••••"
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                  Confirm Password
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
                    placeholder="••••••••"
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
                <label className="block text-sm font-medium text-foreground">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center justify-center gap-2 p-3 border border-input rounded-xl cursor-pointer hover:bg-muted/30 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-1 has-[:checked]:ring-primary">
                    <input type="radio" name="role" value="user" className="hidden" defaultChecked={!state?.fields?.role || state?.fields?.role === "user"} />
                    <span className="text-sm font-medium">Regular User</span>
                  </label>
                  <label className="flex items-center justify-center gap-2 p-3 border border-input rounded-xl cursor-pointer hover:bg-muted/30 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-1 has-[:checked]:ring-primary">
                    <input type="radio" name="role" value="hub_owner" className="hidden" defaultChecked={state?.fields?.role === "hub_owner"} />
                    <span className="text-sm font-medium">Hub Owner</span>
                  </label>
                </div>
              </div>

              <div>
                <SubmitButton />
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/sign-in" className="font-medium text-primary hover:underline">
                  Sign in
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
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1500&auto=format&fit=crop')" }}
          />
          <div className="absolute inset-0 bg-black/30 z-0" />
          <div className="absolute bottom-12 left-12 right-12 z-20 text-white">
            <blockquote className="text-2xl font-bold leading-relaxed mb-4">
              "We are stronger together. Join the network of resilience."
            </blockquote>
            <p className="text-white/80 font-medium">— Habbat Community</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}