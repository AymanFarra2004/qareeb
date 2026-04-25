"use client";

import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit3,
  Lock,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { EditProfileModal } from "./EditProfileModal";
import { ChangePasswordModal } from "./ChangePasswordModal";

interface ProfileData {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  location?: { name?: string; id?: number } | string;
  created_at?: string;
  [key: string]: any;
}

interface ProfileViewProps {
  profile: ProfileData;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-border/50 last:border-0 group">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground break-words">{value}</p>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const t = useTranslations("Profile");
  const colorMap: Record<string, string> = {
    admin: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
    hub_owner: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    user: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
  };
  const color =
    colorMap[role] ?? "bg-muted text-muted-foreground border-border";
  const label =
    t.raw(`roles.${role}` as any) ?? role;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${color}`}
    >
      <Shield className="h-3 w-3" />
      {label}
    </span>
  );
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getLocation(location: ProfileData["location"]): string {
  if (!location) return "—";
  if (typeof location === "string") return location;
  return location.name ?? "—";
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function ProfileView({ profile }: ProfileViewProps) {
  const t = useTranslations("Profile");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const initials = (profile.name ?? "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Card */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-background to-blue-500/10 border border-border/60 shadow-sm"
        >
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-10 -end-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -start-10 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-white font-extrabold text-3xl tracking-tight">
                  {initials}
                </span>
              </div>
              {/* Online indicator */}
              <span className="absolute -bottom-1 -end-1 w-5 h-5 bg-green-500 border-2 border-background rounded-full" />
            </div>

            {/* Name & Role */}
            <div className="text-center sm:text-start flex-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {profile.name ?? "—"}
              </h2>
              <p className="text-muted-foreground text-sm mt-1 mb-3">
                {profile.email ?? ""}
              </p>
              {profile.role && <RoleBadge role={profile.role} />}
            </div>
          </div>
        </motion.div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details Card */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 rounded-3xl bg-background border border-border/60 shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border/50">
              <h3 className="font-semibold text-foreground">
                Personal Information
              </h3>
            </div>
            <div className="px-6 divide-y divide-border/0">
              <InfoRow
                icon={User}
                label={t("name")}
                value={profile.name ?? t("notAvailable")}
              />
              <InfoRow
                icon={Mail}
                label={t("email")}
                value={profile.email ?? t("notAvailable")}
              />
              <InfoRow
                icon={Phone}
                label={t("phone")}
                value={profile.phone ?? t("notAvailable")}
              />
              <InfoRow
                icon={MapPin}
                label={t("location")}
                value={getLocation(profile.location) !== "—" ? getLocation(profile.location) : t("notAvailable")}
              />
              <InfoRow
                icon={Calendar}
                label={t("joinedDate")}
                value={formatDate(profile.created_at)}
              />
            </div>
          </motion.div>

          {/* Actions Card */}
          <motion.div
            variants={itemVariants}
            className="rounded-3xl bg-background border border-border/60 shadow-sm overflow-hidden h-fit"
          >
            <div className="px-6 py-4 border-b border-border/50">
              <h3 className="font-semibold text-foreground">Account Settings</h3>
            </div>
            <div className="p-4 space-y-3">
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all active:scale-95"
              >
                <Edit3 className="h-4 w-4 shrink-0" />
                {t("editProfile")}
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted hover:-translate-y-0.5 transition-all active:scale-95"
              >
                <Lock className="h-4 w-4 shrink-0" />
                {t("changePassword")}
              </button>
            </div>

            {/* Stats Strip */}
            {profile.id && (
              <div className="px-6 py-4 border-t border-border/50 bg-muted/30">
                <p className="text-xs text-muted-foreground">
                  User ID:{" "}
                  <span className="font-semibold text-foreground">
                    #{profile.id}
                  </span>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </>
  );
}
