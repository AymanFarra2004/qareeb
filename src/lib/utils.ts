import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Matches strings containing only Arabic letters and spaces */
export const ARABIC_REGEX = /^[\u0600-\u06FF\s]+$/;

/** Matches strings containing only English letters and spaces */
export const ENGLISH_REGEX = /^[a-zA-Z\s]+$/;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function format24to12(time24: string, amLabel: string = "AM", pmLabel: string = "PM"): string {
  if (!time24) return "";
  const [hourStr, minStr = "00"] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? pmLabel : amLabel;
  hour = hour % 12 || 12;
  return `${hour.toString().padStart(2, '0')}:${minStr.padStart(2, '0')} ${period}`;
}

export function format12to24(hour12: number, period: string, minutes: number = 0): string {
  let hour24 = Number(hour12);
  const p = period.toUpperCase();
  if (p === "PM" && hour24 < 12) hour24 += 12;
  if (p === "AM" && hour24 === 12) hour24 = 0;
  return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
