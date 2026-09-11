import { useState, useRef, useEffect } from 'react';
import { Send, Smartphone, MessageSquare, Copy, Trash2, X } from 'lucide-react';
import { Button, Card, cn } from './ui/BaseComponents';

const DEFAULT_MESSAGE = `السلام عليكم {الاسم} 🌹`;
const MESSAGE_KEY = 'wa_sender_message';
const NAME_COL = 'الاسم';
const PHONE_COL = 'الرقم';

function loadMessage() {
    try { return localStorage.getItem(MESSAGE_KEY) || DEFAULT_MESSAGE; } catch { return DEFAULT_MESSAGE; }
}

export default function Sender({ data, columns, setData }) {
    const [message, setMessage] = useState(() => loadMessage());
    const textAreaRef = useRef(null);

    // Persist message on every change (debounced)
    const saveTimer = useRef(null);
    useEffect(() => {
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            try { localStorage.setItem(MESSAGE_KEY, message); } catch {}
        }, 500);
        return () => clearTimeout(saveTimer.current);
    }, [message]);

    const insertVariable = (varName) => {
        const input = textAreaRef.current;
        if (!input) return;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const varTag = `{${varName}}`;
        const newValue = input.value.substring(0, start) + varTag + input.value.substring(end);
        setMessage(newValue);
        requestAnimationFrame(() => {
            input.focus();
            const newPos = start + varTag.length;
            input.setSelectionRange(newPos, newPos);
        });
    };

    const handleSend = (index, row) => {
        let finalMsg = message;
        columns.forEach(col => {
            const regex = new RegExp(`\\{${col}\\}`, 'g');
            finalMsg = finalMsg.replace(regex, row[col] || '');
        });

        const rawPhone = row[PHONE_COL];
        if (!rawPhone) {
            alert(`❌ لا يوجد رقم هاتف لهذا الشخص.`);
            return;
        }

        let phone = rawPhone.toString().replace(/[^0-9]/g, '');
        if (phone.startsWith('0')) phone = '213' + phone.substring(1);
        if (phone.length < 8) {
            alert(`❌ رقم الهاتف قصير جداً (${phone})`);
            return;
        }

        const link = document.createElement('a');
        link.href = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(finalMsg)}`;
        link.click();

        if (!row.sent) {
            const newData = [...data];
            newData[index].sent = true;
            setData(newData);
        }
    };

    const sentCount = data.filter(d => d.sent).length;

    if (columns.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center p-10 text-slate-400">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">الرجاء إضافة بيانات أولاً</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 pb-24">

            {/* Variables Card */}
            <Card className="p-4 bg-white shadow">
                <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    المتغيرات المتاحة
                </h3>
                <div className="flex flex-wrap gap-2">
                    {columns.filter(c => c !== 'sent').map(col => (
                        <button
                            key={col}
                            onClick={() => insertVariable(col)}
                            className="bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 text-emerald-700 px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border border-emerald-200 hover:border-emerald-300 hover:shadow-sm active:scale-95"
                        >
                            <Copy className="w-3 h-3" /> {col}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-slate-500 mt-3 bg-slate-50 p-2 rounded border border-slate-200">
                    💡 اضغط على أي متغير لإضافته للرسالة
                </p>
            </Card>

            {/* Message Editor Card */}
            <Card className="p-4 bg-white shadow">
                <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    نص الرسالة
                </h3>
                <textarea
                    ref={textAreaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl resize-none outline-none focus:border-emerald-400 transition-all font-medium text-slate-800 leading-relaxed text-base"
                    placeholder="اكتب رسالتك هنا... استخدم {الاسم} أو أي متغير آخر"
                    style={{ caretColor: '#10b981', lineHeight: '1.8' }}
                />
            </Card>

            {/* Contact List */}
            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-emerald-600" />
                        قائمة الإرسال
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                            {sentCount} / {data.length} مرسل
                        </span>
                        {data.length > 0 && (
                            <button
                                onClick={() => { if (confirm('مسح كل القائمة؟')) setData([]); }}
                                className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors border border-red-100"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                مسح الكل
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    {data.map((row, index) => {
                        const displayName = row[NAME_COL] || 'بدون اسم';
                        const displayPhone = row[PHONE_COL] || '---';
                        const initial = displayName.charAt(0).toUpperCase();

                        return (
                            <div
                                key={index}
                                className={cn(
                                    "p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-2",
                                    row.sent ? "bg-emerald-50 border-emerald-200 shadow-sm" : "bg-white border-slate-200"
                                )}
                            >
                                {/* Delete X */}
                                <button
                                    onClick={() => setData(data.filter((_, i) => i !== index))}
                                    className="text-slate-300 hover:text-red-500 transition-colors shrink-0 p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className={cn(
                                        "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                                        row.sent ? "bg-emerald-200 text-emerald-700" : "bg-slate-100 text-slate-600"
                                    )}>
                                        {initial}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold truncate text-sm text-slate-800">{displayName}</h4>
                                        <div className="flex items-center gap-1 text-xs font-mono mt-0.5 text-slate-500">
                                            <Smartphone className="w-3 h-3 shrink-0" />
                                            <span dir="ltr" className="truncate">{displayPhone}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => handleSend(index, row)}
                                    variant={row.sent ? "secondary" : "primary"}
                                    className={cn(
                                        "rounded-full shrink-0 font-bold px-4 py-2 text-sm",
                                        row.sent && "bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200"
                                    )}
                                >
                                    {row.sent ? (
                                        <span className="flex items-center gap-1.5">إعادة <Send className="w-3.5 h-3.5 -rotate-45" /></span>
                                    ) : (
                                        <span className="flex items-center gap-1.5">إرسال <Send className="w-3.5 h-3.5 -rotate-45" /></span>
                                    )}
                                </Button>
                            </div>
                        );
                    })}

                    {data.length === 0 && (
                        <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100">
                            <MessageSquare className="w-14 h-14 mx-auto mb-4 opacity-30" />
                            <p className="text-base font-medium">لا توجد بيانات</p>
                            <p className="text-sm mt-1">أضف جهات اتصال من تبويب "جهات الاتصال"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}