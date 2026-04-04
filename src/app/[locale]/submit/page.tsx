"use client";

import { Header } from "../components/header/Header";
import { Footer } from "../components/footer/Footer";
import { MapPin, Info, Loader2 } from "lucide-react";
import BasicInfo from "../components/submit/BasicInfo";
import ServicesPricing from "../components/submit/ServicesPricing";
import UploadPhoto from "../components/submit/UploadPhoto";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "@/src/i18n/routing";
import { createHub } from "@/src/actions/hubs";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex gap-2 items-center">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      Submit Listing
    </button>
  );
}

export default function SubmitHub() {
  const [state, formAction] = useActionState(createHub, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success && state?.hub) {
      router.push(`/dashboard/hubs/${state.hub.id || state.hub.slug}`);
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-24 pb-20 bg-muted/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
              <MapPin className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">List Your Hub</h1>
            <p className="text-muted-foreground text-lg">
              Help your community stay connected. Add your internet or electricity hub to our network.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-10">
            <form action={formAction} className="space-y-8">
              
              {state?.error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                  {state.error}
                </div>
              )}

              {/* Basic Info */}
              <BasicInfo />

              {/* Services & Contact */}
              <ServicesPricing />

              {/* Photos */}
              <UploadPhoto />

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3 text-sm text-muted-foreground">
                <Info className="h-5 w-5 text-primary flex-shrink-0" />
                <p>
                  By submitting this form, you agree that our team will review the information. 
                  Approved listings receive a "Verified Partner" badge.
                </p>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3 mt-8">
                <a href="/dashboard" className="px-6 py-2 rounded-md border border-input text-foreground font-medium hover:bg-muted transition-colors">
                  Cancel
                </a>
                <SubmitButton />
              </div>

            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}