import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { User } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeUser(user: any): User {
  if (!user) return user;
  
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    balance: typeof user.balance === 'number' ? user.balance : 0,
    // Only include necessary public fields
  };
}
