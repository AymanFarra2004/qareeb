"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/src/store/authSlice";
import { getProfileByToken, handleGoogleCallback } from "@/src/actions/auth";
import { Loader2 } from "lucide-react";
import { useLocale } from "next-intl";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const locale = useLocale();

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");

      if (error || !token) {
        console.error("Auth error:", error);
        router.push("/sign-in?error=" + (error || "auth_failed"));
        return;
      }

      try {
        // 1. Save to localStorage (optional, but kept as requested)
        localStorage.setItem("token", token);
        
        let userData = null;
        
        // 2. Fetch profile using the token instead of relying on URL params
        const { data, error: profileError } = await getProfileByToken(token, locale);
        if(data && !profileError) {
          userData = data;
          // Optionally update Redux state immediately
          dispatch(loginSuccess(userData));
        }

        // 3. Set auth cookies via Server Action for SSR support
        // We check userData to avoid passing "null" string to cookies
        await handleGoogleCallback(token, userData ? JSON.stringify(userData) : null);

        // 4. Redirect to appropriate page
        if (!userData) {
          // If we couldn't fetch user data, something is wrong
          window.location.href = `/${locale}/sign-in?error=profile_fetch_failed`;
          return;
        }

        const hasLocation = userData.location_id || userData.location;
        const hasRole = userData.role;

        if (!hasRole || !hasLocation) {
          window.location.href = `/${locale}/complete-profile`;
        } else {
          window.location.href = `/${locale}`;
        }
      } catch (e) {
        console.error("Failed to process auth callback", e);
        window.location.href = `/${locale}/sign-in?error=process_failed`;
      }
    };

    handleAuth();
  }, [searchParams, router, dispatch, locale]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse text-lg font-medium">Completing sign in...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
