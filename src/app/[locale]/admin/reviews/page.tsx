import { getAdminReviews } from "@/src/actions/admin";
import AdminReviewsTable from "./AdminReviewsTable";
import { getTranslations } from "next-intl/server";

export default async function AdminReviewsPage() {
  const [res, t] = await Promise.all([
    getAdminReviews(),
    getTranslations("AdminReviews"),
  ]);

  if (res.error) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight underline decoration-primary/30 underline-offset-8">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mt-2">{t("description")}</p>
        </div>
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {res.error}
        </div>
      </div>
    );
  }

  const reviews = res.data || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight underline decoration-primary/30 underline-offset-8">
          {t("title")}
        </h2>
        <p className="text-muted-foreground mt-2">{t("description")}</p>
      </div>

      <AdminReviewsTable initialReviews={reviews} />
    </div>
  );
}
