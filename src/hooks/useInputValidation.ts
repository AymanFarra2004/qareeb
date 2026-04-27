import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ARABIC_REGEX, ENGLISH_REGEX } from "@/src/lib/utils";

export type LangCheck = "ar" | "en";

export function useInputValidation(langCheck?: LangCheck) {
  const t = useTranslations("Errors");
  const [error, setError] = useState<string | null>(null);

  const onBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!langCheck) return;

      const value = e.target.value.trim();

      // Empty fields are ignored here — HTML `required` handles that
      if (!value) {
        setError(null);
        return;
      }

      if (langCheck === "ar" && !ARABIC_REGEX.test(value)) {
        setError(t("onlyArabic"));
      } else if (langCheck === "en" && !ENGLISH_REGEX.test(value)) {
        setError(t("onlyEnglish"));
      } else {
        setError(null);
      }
    },
    [langCheck, t]
  );

  return { error, onBlur };
}
