"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/src/store/authSlice";
import { handleGoogleCallback } from "@/src/actions/auth";
import { Loader2 } from "lucide-react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get("token");
      const userStr = searchParams.get("user");
      const error = searchParams.get("error");

      if (error || !token) {
        console.error("Auth error:", error);
        router.push("/sign-in?error=" + (error || "auth_failed"));
        return;
      }

      try {
        // 1. Save to localStorage (as requested)
        localStorage.setItem("token", token);
        
        let userData = null;
        if (userStr) {
          localStorage.setItem("user", userStr);
          
          // 2. Update Redux
          try {
            userData = JSON.parse(decodeURIComponent(userStr));
            dispatch(loginSuccess(userData));
          } catch (e) {
            console.error("Failed to parse user data", e);
          }
        }

        // 3. Set auth cookies via Server Action for SSR support
        await handleGoogleCallback(token, userStr);

        // 4. Redirect
        router.push("/");
        router.refresh();
      } catch (e) {
        console.error("Failed to process auth callback", e);
        router.push("/sign-in?error=process_failed");
      }
    };

    handleAuth();
  }, [searchParams, router, dispatch]);

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
