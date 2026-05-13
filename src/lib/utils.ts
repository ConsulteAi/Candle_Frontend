import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { User } from "@/types";
import { QueryCategory } from "@/types/query";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeUser(user: any): User {
  if (!user) return user;

  const normalizedRole =
    typeof user.role === 'string' && user.role.trim()
      ? user.role.trim().toUpperCase()
      : 'USER';

  return {
    name: user.name || '',
    email: user.email || '',
    role: normalizedRole,
    phone: user.phone,
  };
}


export const getPriorityCategory = (categories: QueryCategory[]) => {
    if (categories.includes(QueryCategory.CREDIT)) return QueryCategory.CREDIT;
    if (categories.includes(QueryCategory.VEHICLE)) return QueryCategory.VEHICLE;
    if (categories.includes(QueryCategory.COMPANY)) return QueryCategory.COMPANY;
    if (categories.includes(QueryCategory.PERSON)) return QueryCategory.PERSON;
    return categories[0];
  };

export function formatDisplayDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  // Check if already in DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }
  // Try parsing ISO or other formats
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Fallback to original if invalid
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    return dateString;
  }
}
