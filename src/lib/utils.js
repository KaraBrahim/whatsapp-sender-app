import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind class names (clsx + tailwind-merge)
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// Stable per-row id so React keys survive deletes/reorders
export function newId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
