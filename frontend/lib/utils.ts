import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

export function formatDate(value: string) {
  const hasTimezone = /z$|[+-]\d{2}:\d{2}$/i.test(value);
  const date = new Date(hasTimezone ? value : `${value}Z`);
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
    timeZoneName: "short"
  }).format(date);
}
