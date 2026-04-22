"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AtSign,
  CheckCircle2,
  Instagram,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Tag,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { submitContactForm } from "@/src/actions/contact";

type FormState = "idle" | "pending" | "success" | "error";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const initialForm: FormData = { name: "", email: "", subject: "", message: "" };

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function ContactView() {
  const t = useTranslations("ContactUs");
  const [form, setForm] = useState<FormData>(initialForm);
  const [status, setStatus] = useState<FormState>("idle");
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = (): boolean => {
    const next: Partial<FormData> = {};
    if (!form.name.trim()) next.name = t("form.errors.nameRequired");
    if (!form.email.trim()) {
      next.email = t("form.errors.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = t("form.errors.emailInvalid");
    }
    if (!form.subject.trim()) next.subject = t("form.errors.subjectRequired");
    if (!form.message.trim()) next.message = t("form.errors.messageRequired");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("pending");
    setApiError(null);

    const result = await submitContactForm(form);

    if (result.success) {
      setStatus("success");
      setForm(initialForm);
    } else {
      setStatus("error");
      setApiError(result.error ?? null);
    }
  };

  const contactCards = [
    {
      icon: Mail,
      labelKey: "info.email.label",
      valueKey: "info.email.value",
      hrefPrefix: "mailto:",
    },
    {
      icon: Phone,
      labelKey: "info.phone.label",
      valueKey: "info.phone.value",
      hrefPrefix: "https://wa.me/",
    },
    {
      icon: Instagram,
      labelKey: "info.instagram.label",
      valueKey: "info.instagram.value",
      hrefPrefix: "https://www.instagram.com/",
    },
    {
      icon: MapPin,
      labelKey: "info.location.label",
      valueKey: "info.location.value",
      hrefPrefix: null,
    },
  ] as const;

  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-purple-600 dark:text-purple-400 mb-4"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500">
              {t("heading")}
            </span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="max-w-xl mx-auto text-black/80 dark:text-white/80 text-base sm:text-lg"
          >
            {t("subheading")}
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1  lg:grid-cols-5 gap-10">
          {/* ── Left: Contact info ── */}
          <motion.aside
            className="lg:col-span-2 flex flex-col gap-6 order-2 lg:order-none"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {contactCards.map(
              ({ icon: Icon, labelKey, valueKey, hrefPrefix }, i) => (
                <motion.div
                  key={labelKey}
                  variants={fadeUp}
                  custom={i}
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-card border border-border hover:border-purple-600/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-primary-foreground transition-colors duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      {t(labelKey)}
                    </p>
                    {hrefPrefix ? (
                      <a
                        href={`${hrefPrefix}${t(valueKey)}`}
                        className="text-sm font-medium text-foreground hover:text-purple-600 transition-colors break-all"
                      >
                        {t(valueKey)}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-foreground break-words">
                        {t(valueKey)}
                      </p>
                    )}
                  </div>
                </motion.div>
              ),
            )}

            {/* Response time notice */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20 "
            >
              <MessageSquare className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("info.responseNote")}
              </p>
            </motion.div>
          </motion.aside>

          {/* ── Right: Form ── */}
          <motion.div
            className="lg:col-span-3 order-1 lg:order-none"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col items-center justify-center py-16 text-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle2 className="w-9 h-9 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {t("form.success.title")}
                    </h3>
                    <p className="text-muted-foreground max-w-xs">
                      {t("form.success.description")}
                    </p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      {t("form.success.sendAnother")}
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                    noValidate
                  >
                    {status === "error" && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {apiError ?? t("form.errors.generic")}
                      </div>
                    )}

                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field
                        id="name"
                        name="name"
                        type="text"
                        label={t("form.nameLabel")}
                        placeholder={t("form.namePlaceholder")}
                        value={form.name}
                        onChange={handleChange}
                        error={errors.name}
                        icon={<User className="w-4 h-4" />}
                        autoComplete="name"
                      />
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        label={t("form.emailLabel")}
                        placeholder={t("form.emailPlaceholder")}
                        value={form.email}
                        onChange={handleChange}
                        error={errors.email}
                        icon={<AtSign className="w-4 h-4" />}
                        autoComplete="email"
                      />
                    </div>

                    {/* Subject */}
                    <Field
                      id="subject"
                      name="subject"
                      type="text"
                      label={t("form.subjectLabel")}
                      placeholder={t("form.subjectPlaceholder")}
                      value={form.subject}
                      onChange={handleChange}
                      error={errors.subject}
                      icon={<Tag className="w-4 h-4" />}
                    />

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-foreground mb-1.5"
                      >
                        {t("form.messageLabel")}
                      </label>
                      <div className="relative">
                        <textarea
                          id="message"
                          name="message"
                          rows={5}
                          value={form.message}
                          onChange={handleChange}
                          placeholder={t("form.messagePlaceholder")}
                          className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground placeholder-muted-foreground text-sm resize-none
                            focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors
                            ${errors.message ? "border-destructive focus:ring-destructive" : "border-input"}`}
                        />
                      </div>
                      {errors.message && (
                        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={status === "pending"}
                      className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold
                        bg-purple-600 text-primary-foreground hover:bg-primary/90
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                        disabled:opacity-60 disabled:cursor-not-allowed
                        transition-all duration-200 shadow-sm hover:shadow-purple-600/20 hover:shadow-md bg-gradient-to-l from-purple-600 to-blue-600"
                    >
                      {status === "pending" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 rtl:rotate-180" />
                      )}
                      {status === "pending"
                        ? t("form.sending")
                        : t("form.submit")}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Reusable input field ──────────────────────────────────────────────────────
interface FieldProps {
  id: string;
  name: string;
  type: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  icon: React.ReactNode;
  autoComplete?: string;
}

function Field({
  id,
  name,
  type,
  label,
  placeholder,
  value,
  onChange,
  error,
  icon,
  autoComplete,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-foreground mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-muted-foreground">
          {icon}
        </div>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`appearance-none block w-full ps-9 pe-4 py-3 rounded-xl border bg-background text-foreground placeholder-muted-foreground text-sm
            focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors
            ${error ? "border-destructive focus:ring-destructive" : "border-input"}`}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
