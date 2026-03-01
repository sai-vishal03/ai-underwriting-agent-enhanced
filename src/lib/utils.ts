import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  const full = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2);
    return `₹${cr} cr / ${full}`;
  } else if (amount >= 100000) {
    const lakhs = (amount / 100000).toFixed(2);
    return `₹${lakhs} L / ${full}`;
  }

  return full;
}

export function formatLakhs(amount: number) {
  return `₹${amount.toFixed(1)}L`;
}
