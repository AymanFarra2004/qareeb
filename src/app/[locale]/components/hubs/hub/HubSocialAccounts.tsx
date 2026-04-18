"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { SocialAccount } from "@/data/hubs";

/** SVG brand icons as React components */
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const TwitterXIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

/** Map a platform string to its icon and a brand colour class */
function getSocialMeta(platform: string): {
  icon: React.ReactNode;
  label: string;
  colorClass: string;
  bgClass: string;
} {
  const p = platform.toLowerCase();
  if (p === "facebook")
    return {
      icon: <FacebookIcon />,
      label: "Facebook",
      colorClass: "text-blue-600",
      bgClass: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    };
  if (p === "instagram")
    return {
      icon: <InstagramIcon />,
      label: "Instagram",
      colorClass: "text-pink-600",
      bgClass: "bg-pink-50 hover:bg-pink-100 border-pink-200",
    };
  if (p === "twitter" || p === "x" || p === "twitter_x")
    return {
      icon: <TwitterXIcon />,
      label: "X (Twitter)",
      colorClass: "text-foreground",
      bgClass: "bg-muted hover:bg-muted/80 border-border",
    };
  if (p === "linkedin")
    return {
      icon: <LinkedInIcon />,
      label: "LinkedIn",
      colorClass: "text-sky-700",
      bgClass: "bg-sky-50 hover:bg-sky-100 border-sky-200",
    };
  // "other" or anything unknown
  return {
    icon: <ExternalLink className="h-5 w-5" />,
    label: platform,
    colorClass: "text-primary",
    bgClass: "bg-primary/5 hover:bg-primary/10 border-primary/20",
  };
}

interface HubSocialAccountsProps {
  socials: SocialAccount[];
  title?: string;
}

export default function HubSocialAccounts({ socials, title = "Follow Us" }: HubSocialAccountsProps) {
  if (!socials || socials.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="flex flex-wrap gap-3">
        {socials.map((s, i) => {
          const meta = getSocialMeta(s.platform);
          return (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-150 ${meta.colorClass} ${meta.bgClass}`}
            >
              {meta.icon}
              <span className="capitalize">{meta.label}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
