import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type NameParts = { firstName?: string | null; lastName?: string | null; name?: string | null; email?: string | null };

/**
 * Avatar initials: first letter of the first name + first letter of the last name ("Samson Ajibade" → "SA").
 * Middle names are skipped. Falls back to the full name, then the email, then "?".
 */
export function getInitials(person: NameParts | string | null | undefined) {
  const p: NameParts = typeof person === 'string' ? { name: person } : (person ?? {});
  const first = p.firstName?.trim();
  const last = p.lastName?.trim();
  if (first || last) return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();

  const words = (p.name ?? '').replace(/@.*/, '').trim().split(/\s+/).filter(Boolean);
  if (words.length > 0) return `${words[0][0]}${words.length > 1 ? words[words.length - 1][0] : ''}`.toUpperCase();

  return (p.email?.trim()?.[0] ?? '?').toUpperCase();
}
