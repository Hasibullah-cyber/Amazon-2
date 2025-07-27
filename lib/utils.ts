import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add this slugify function
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')   // Remove non-word characters (keep spaces and hyphens)
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/-+/g, '-')         // Collapse multiple hyphens
    .trim();
}
