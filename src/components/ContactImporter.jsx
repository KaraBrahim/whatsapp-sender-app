import { useState, useMemo } from 'react';
import {
    Users, UserPlus, CheckCircle2,
    AlertTriangle, Smartphone, Search, X, Plus, Send
} from 'lucide-react';
import { Button, Card, cn } from './ui/BaseComponents';
import { Contacts } from '@capacitor-community/contacts';

const STORAGE_KEY = 'wa_phone_contacts';

function loadSavedContacts() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveContacts(contacts) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts)); } catch {}
}

export default function ContactImporter({ onAddToList }) {
    const [allContacts, setAllContacts] = useState(() => loadSavedContacts());
    const [selected, setSelected] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [loaded, setLoaded] = useState(() => loadSavedContacts().length > 0);

    // Manual entry state
    const [manualName, setManualName] = useState('');
    const [manualPhone, setManualPhone] = useState('');
    const [manualError, setManualError] = useState('');

    // ── load all contacts from phone ──────────────────────────────────────

    const loadContacts = async () => {
        setError('');
        setIsLoading(true);
        try {
            let permStatus = await Contacts.checkPermissions();
            if (permStatus.contacts === 'prompt' || permStatus.contacts === 'prompt-with-rationale') {
                permStatus = await Contacts.requestPermissions();
            }
            if (permStatus.contacts !== 'granted') {
                setError('تم رفض إذن جهات الاتصال. يمكنك منح الإذن من: إعدادات الجهاز ← التطبيقات ← Quick Message Sender ← الأذونات. أو استخدم الإدخال اليدوي أدناه.');
                setIsLoading(false);
                return;
            }

            const result = await Contacts.getContacts({ projection: { name: true, phones: true } });

            const normalized = [];
            (result.contacts || []).forEach((contact) => {
                const name =
                    contact.name?.display ||
                    [contact.name?.given, contact.name?.family].filter(Boolean).join(' ') ||
                    'بدون اسم';
                const phones = contact.phones || [];
                if (phones.length === 0) return;
                phones.forEach((p) => {
                    const phone = (p.number || '').trim();
                    if (!phone) return;
                    normalized.push({ id: crypto.randomUUID(), name, phone });
                });
            });

            normalized.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
            setAllContacts(normalized);
            saveContacts(normalized);
            setLoaded(true);
        } catch (err) {
            console.error('Contacts error:', err);
            setError(`حدث خطأ: ${err?.message || err?.toString() || 'خطأ غير معروف'}`);
        } finally {
            setIsLoading(false);
        }
    };

    // ── manual add ────────────────────────────────────────────────────────

    const handleManualAdd = () => {
        setManualError('');
        const phone = manualPhone.trim();
        const name = manualName.trim() || 'بدون اسم';

        if (!phone) {
            setManualError('رقم الهاتف مطلوب');
            return;
        }
        if (!/^[\d\s\+\-\(\)]+$/.test(phone)) {
            setManualError('رقم غير صالح');
            return;
        }

        onAddToList([{ id: crypto.randomUUID(), name, phone }]);
        setManualName('');
        setManualPhone('');
    };

    // ── send directly to WhatsApp (single number, no list) ───────────────

    const handleDirectSend = () => {
        setManualError('');
        const phone = manualPhone.trim();
        if (!phone) { setManualError('رقم الهاتف مطلوب'); return; }

        let cleaned = phone.replace(/[^0-9]/g, '');
        if (cleaned.startsWith('0')) cleaned = '213' + cleaned.substring(1);
        if (cleaned.length < 8) { setManualError('الرقم قصير جداً'); return; }

        const link = document.createElement('a');
        link.href = `whatsapp://send?phone=${cleaned}`;
        link.click();
    };

    // ── filtered list ─────────────────────────────────────────────────────

    const filtered = useMemo(() => {
        if (!query.trim()) return allContacts;
        const q = query.toLowerCase();
        return allContacts.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.phone.replace(/\s/g, '').includes(q.replace(/\s/g, ''))
        );
    }, [allContacts, query]);

    // ── selection helpers ─────────────────────────────────────────────────

    const toggleSelect = (id) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === filtered.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filtered.map((c) => c.id)));
        }
    };

    const handleAddToList = () => {
        const toAdd = allContacts.filter((c) => selected.has(c.id));
        if (toAdd.length === 0) return;
        onAddToList(toAdd);
        setSelected(new Set());
    };

    // ── manual entry card (always visible) ───────────────────────────────

    const ManualCard = (
        <Card className="p-4 bg-white shadow">
            <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                إضافة رقم يدوياً
            </h3>
            <div className="flex flex-col gap-2">
                <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="الاسم (اختياري)"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-emerald-400 outline-none text-sm font-medium transition-colors bg-white"
                />
                <input
                    type="tel"
                    value={manualPhone}
                    onChange={(e) => { setManualPhone(e.target.value); setManualError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
                    placeholder="رقم الهاتف *"
                    dir="ltr"
                    className={cn(
                        "w-full px-4 py-2.5 rounded-xl border-2 outline-none text-sm font-mono transition-colors bg-white",
                        manualError
                            ? "border-red-300 focus:border-red-400"
                            : "border-slate-200 focus:border-emerald-400"
                    )}
                />
                {manualError && (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" /> {manualError}
                    </p>
                )}
                <div className="flex gap-2 mt-1">
                    <Button onClick={handleManualAdd} className="flex-1">
                        <Plus className="w-4 h-4" />
                        إضافة للقائمة
                    </Button>
                    <Button variant="secondary" onClick={handleDirectSend} className="flex-1">
                        <Send className="w-4 h-4 -rotate-45" />
                        إرسال مباشر
                    </Button>
                </div>
            </div>
        </Card>
    );

    // ── initial screen (contacts not loaded yet) ──────────────────────────

    if (!loaded) {
        return (
            <div className="space-y-4 pb-10">
                {ManualCard}

                <div className="flex flex-col items-center justify-center h-72 bg-white rounded-2xl border-2 border-dashed border-slate-200 gap-5 px-6 text-center">
                    <Users className="w-16 h-16 text-emerald-300" />
                    <div>
                        <h3 className="text-lg font-bold text-slate-700 mb-1">جهات الاتصال</h3>
                        <p className="text-sm text-slate-400">اضغط الزر لتحميل جهات الاتصال من هاتفك</p>
                    </div>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 w-full text-right">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}
                    <Button onClick={loadContacts} disabled={isLoading} className="px-8 py-3 text-base">
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                جارٍ التحميل...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <UserPlus className="w-5 h-5" />
                                تحميل جهات الاتصال
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        );
    }

    // ── loaded screen ─────────────────────────────────────────────────────

    return (
        <div className="space-y-4 pb-28">

            {/* Manual entry — always on top */}
            {ManualCard}

            {/* Toolbar */}
            <Card className="p-4 flex flex-wrap gap-3 items-center justify-between sticky top-4 z-20">
                <div className="flex items-center gap-3 flex-wrap">
                    <Button variant="secondary" onClick={loadContacts} disabled={isLoading}>
                        {isLoading
                            ? <span className="w-4 h-4 border-2 border-slate-400/40 border-t-slate-600 rounded-full animate-spin" />
                            : <UserPlus className="w-4 h-4" />
                        }
                        تحديث
                    </Button>

                    {filtered.length > 0 && (
                        <button
                            onClick={toggleAll}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                        >
                            {selected.size === filtered.length ? 'إلغاء الكل' : `تحديد الكل (${filtered.length})`}
                        </button>
                    )}

                    {selected.size > 0 && (
                        <button
                            onClick={() => setSelected(new Set())}
                            className="text-xs font-bold text-slate-500 hover:text-slate-700 underline underline-offset-2"
                        >
                            إلغاء التحديد
                        </button>
                    )}
                </div>
            </Card>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث بالاسم أو الرقم..."
                    className="w-full pr-11 pl-10 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-400 outline-none bg-white text-sm font-medium transition-colors"
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between px-1">
                <span className="text-sm text-slate-500 font-medium">
                    {filtered.length} جهة اتصال{query ? ` (من ${allContacts.length})` : ''}
                </span>
                {selected.size > 0 && (
                    <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                        {selected.size} محدد
                    </span>
                )}
            </div>

            {/* Empty search */}
            {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400 bg-white rounded-2xl border border-slate-100">
                    <Search className="w-10 h-10 mb-3 opacity-30" />
                    <p className="font-medium">لا توجد نتائج لـ "{query}"</p>
                </div>
            )}

            {/* Contact list */}
            {filtered.length > 0 && (
                <Card className="overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {filtered.map((contact) => {
                            const isSelected = selected.has(contact.id);
                            const initial = contact.name.charAt(0).toUpperCase();
                            return (
                                <div
                                    key={contact.id}
                                    onClick={() => toggleSelect(contact.id)}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors active:scale-[0.99]',
                                        isSelected ? 'bg-emerald-50' : 'bg-white hover:bg-slate-50'
                                    )}
                                >
                                    {/* Checkbox */}
                                    <div className={cn(
                                        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                                        isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300'
                                    )}>
                                        {isSelected && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Avatar */}
                                    <div className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0',
                                        isSelected ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                    )}>
                                        {initial}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 truncate text-sm">{contact.name}</p>
                                        <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1" dir="ltr">
                                            <Smartphone className="w-3 h-3 shrink-0" />
                                            {contact.phone}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Floating add button — raised higher to avoid nav bar */}
            {selected.size > 0 && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
                    <button
                        onClick={handleAddToList}
                        className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl shadow-emerald-300 flex items-center gap-3 transition-all text-base whitespace-nowrap"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        إضافة {selected.size} جهة للإرسال
                    </button>
                </div>
            )}
        </div>
    );
}
