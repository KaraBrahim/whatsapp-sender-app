import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for class merging
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const Button = ({ children, variant = 'primary', className, ...props }) => {
    const variants = {
        primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200/50',
        secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200',
        danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-100',
        ghost: 'hover:bg-slate-100 text-slate-600',
    };

    return (
        <button
            className={cn(
                'px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 text-sm shadow-sm',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export const Card = ({ children, className }) => (
    <div className={cn('bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/40', className)}>
        {children}
    </div>
);

export const Input = ({ className, ...props }) => (
    <input
        className={cn(
            'w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-sm',
            className
        )}
        {...props}
    />
);