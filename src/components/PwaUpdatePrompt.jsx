import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { cn } from './ui/BaseComponents';

export default function PwaUpdatePrompt() {
    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW registered:', r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    if (!needRefresh) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
            <div className="bg-emerald-700 text-white rounded-2xl shadow-2xl px-5 py-4 flex items-center justify-between gap-4">
                <p className="text-sm font-semibold">تحديث جديد متاح 🎉</p>
                <button
                    onClick={() => updateServiceWorker(true)}
                    className="bg-white text-emerald-700 font-bold text-xs px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors shrink-0"
                >
                    تحديث الآن
                </button>
            </div>
        </div>
    );
}
