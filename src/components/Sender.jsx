import React, { useState, useEffect, useRef } from 'react';
import { Send, CheckCircle2, Copy, Smartphone, User, MessageSquare, Settings2 } from 'lucide-react';
import { Button, Card, cn } from './ui/BaseComponents';

const DEFAULT_MESSAGE = `السلام عليكم {name} 🌹`;

export default function Sender({ data, columns, setData }) {
    const [message, setMessage] = useState(DEFAULT_MESSAGE);
    const [nameCol, setNameCol] = useState('');
    const [phoneCol, setPhoneCol] = useState('');
    const textAreaRef = useRef(null);

    // Auto-detect fields only once when columns first load
    useEffect(() => {
        if (columns.length === 0) return;
        
        // Only auto-detect if not already set
        if (!nameCol) {
            const foundName = columns.find(col =>
                col.toLowerCase().includes('name') ||
                col.toLowerCase().includes('اسم') ||
                col.toLowerCase().includes('الاسم') ||
                col.toLowerCase().includes('إسم') ||
                col.toLowerCase().includes('nom')
            );
            if (foundName) setNameCol(foundName);
        }

        if (!phoneCol) {
            const foundPhone = columns.find(col =>
                col.toLowerCase().includes('number') ||
                col.toLowerCase().includes('phone') ||
                col.toLowerCase().includes('رقم') ||
                col.toLowerCase().includes('الرقم') ||
                col.toLowerCase().includes('هاتف') ||
                col.toLowerCase().includes('جوال') ||
                col.toLowerCase().includes('موبايل') ||
                col.toLowerCase().includes('tel')
            );
            if (foundPhone) setPhoneCol(foundPhone);
        }
    }, [columns.length]); // Only run when columns count changes

    const insertVariable = (varName) => {
        const input = textAreaRef.current;
        if (!input) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;
        const text = input.value;
        const varTag = `{${varName}}`;
        const newValue = text.substring(0, start) + varTag + text.substring(end);

        setMessage(newValue);
        
        // Focus and set cursor position after state update
        requestAnimationFrame(() => {
            input.focus();
            const newPos = start + varTag.length;
            input.setSelectionRange(newPos, newPos);
        });
    };

    const handleSend = (index, row) => {
        if (!phoneCol) {
            alert('⚠️ تنبيه: الرجاء تحديد "عمود رقم الهاتف" من الإعدادات أولاً.');
            return;
        }

        let finalMsg = message;

        // Replace all variables with actual data - EXACT SAME LOGIC AS HTML
        columns.forEach(col => {
            const regex = new RegExp(`\\{${col}\\}`, 'g');
            finalMsg = finalMsg.replace(regex, row[col] || '');
        });

        const rawPhone = row[phoneCol];

        if (!rawPhone) {
            alert(`❌ خطأ: الحقل فارغ في العمود "${phoneCol}" لهذا الشخص.`);
            return;
        }

        // Clean and format phone number - EXACT SAME LOGIC AS HTML
        let phone = rawPhone.toString().replace(/[^0-9]/g, '');

        // Handle Algerian phone numbers - EXACT SAME LOGIC AS HTML
        if (phone.startsWith('0')) phone = '213' + phone.substring(1);

        if (phone.length < 8) {
            alert(`❌ خطأ: رقم الهاتف يبدو قصيراً جداً (${phone})`);
            return;
        }

        // EXACT SAME AS HTML - Use whatsapp:// protocol to open installed app directly
        const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(finalMsg)}`;
        
        // Create a temporary link and click it (React-safe approach)
        const link = document.createElement('a');
        link.href = url;
        link.click();

        // Mark as sent (only if not already sent)
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
            {/* Left: Controls */}
            <div className="lg:col-span-5 flex flex-col gap-4 h-full overflow-y-auto pb-4">

                {/* Settings Card - Manual Field Selection */}
                <Card className="p-5 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-md">
                    <div className="flex items-center gap-2 mb-4 text-emerald-800 font-bold text-sm border-b border-emerald-200 pb-3">
                        <Settings2 className="w-5 h-5" />
                        إعدادات الحقول
                    </div>

                    <div className="space-y-4">
                        {/* Name Column Selector */}
                        <div>
                            <label className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                                <User className="w-4 h-4 text-emerald-600" /> 
                                عمود الاسم (للعرض)
                            </label>
                            <div className="relative">
                                <select
                                    className={cn(
                                        "w-full p-3 pr-4 pl-10 rounded-lg border-2 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-300 appearance-none cursor-pointer transition-all",
                                        nameCol 
                                            ? "border-emerald-200 bg-white text-slate-800" 
                                            : "border-amber-300 bg-amber-50 text-amber-700 animate-pulse"
                                    )}
                                    value={nameCol}
                                    onChange={(e) => setNameCol(e.target.value)}
                                >
                                    <option value="">-- اختر عمود الاسم --</option>
                                    {columns.filter(c => c !== 'sent').map(col => (
                                        <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                                    ▼
                                </div>
                            </div>
                            {!nameCol && (
                                <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                                    ⚠️ اختياري - لكن مفيد لعرض الأسماء
                                </p>
                            )}
                        </div>

                        {/* Phone Column Selector */}
                        <div>
                            <label className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                                <Smartphone className="w-4 h-4 text-emerald-600" /> 
                                عمود رقم الهاتف (مطلوب)
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    className={cn(
                                        "w-full p-3 pr-4 pl-10 rounded-lg border-2 text-sm font-medium outline-none focus:ring-2 appearance-none cursor-pointer transition-all",
                                        phoneCol 
                                            ? "border-emerald-200 bg-white text-slate-800 focus:ring-emerald-300" 
                                            : "border-red-300 bg-red-50 text-red-700 focus:ring-red-200 animate-pulse"
                                    )}
                                    value={phoneCol}
                                    onChange={(e) => setPhoneCol(e.target.value)}
                                >
                                    <option value="">-- اختر عمود الهاتف --</option>
                                    {columns.filter(c => c !== 'sent').map(col => (
                                        <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                                    ▼
                                </div>
                            </div>
                            {!phoneCol && (
                                <p className="text-xs text-red-600 mt-1.5 font-medium flex items-center gap-1">
                                    ❌ مطلوب للإرسال - الرجاء الاختيار
                                </p>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Variables Card */}
                <Card className="p-4 bg-white shadow">
                    <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Copy className="w-4 h-4" />
                        المتغيرات المتاحة
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {columns.filter(c => c !== 'sent').length > 0 ? (
                            columns.filter(c => c !== 'sent').map(col => (
                                <button
                                    key={col}
                                    onClick={() => insertVariable(col)}
                                    className="bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 text-emerald-700 px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border border-emerald-200 hover:border-emerald-300 hover:shadow-sm"
                                >
                                    <Copy className="w-3 h-3" /> {col}
                                </button>
                            ))
                        ) : (
                            <p className="text-xs text-slate-400 w-full text-center py-2">
                                لا توجد أعمدة متاحة
                            </p>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-3 bg-slate-50 p-2 rounded border border-slate-200">
                        💡 اضغط على أي متغير لإضافته للرسالة
                    </p>
                </Card>

                {/* Message Editor Card */}
                <Card className="p-4 flex-1 flex flex-col min-h-[200px] bg-white shadow">
                    <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        نص الرسالة
                    </h3>
                    <textarea
                        ref={textAreaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 w-full p-4 bg-white border-2 border-slate-200 rounded-xl resize-none outline-none focus:border-emerald-400 focus:bg-white transition-all font-medium text-slate-800 leading-relaxed text-[15px]"
                        placeholder="اكتب رسالتك هنا... استخدم {name} أو أي متغير آخر"
                        style={{
                            caretColor: '#10b981',
                            lineHeight: '1.8'
                        }}
                    />
                </Card>
            </div>

            {/* Right: Contact List */}
            <div className="lg:col-span-7 flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-emerald-600" />
                        قائمة الإرسال
                    </h2>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                        {sentCount} / {data.length} مرسل
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 pl-1 pb-4">
                    {data.map((row, index) => {
                        const displayName = nameCol && row[nameCol] ? row[nameCol] : 'غير محدد';
                        const displayPhone = phoneCol && row[phoneCol] ? row[phoneCol] : '---';
                        const initial = displayName.charAt(0).toUpperCase();

                        return (
                            <div
                                key={index}
                                className={cn(
                                    "p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group",
                                    row.sent
                                        ? "bg-emerald-50 border-emerald-200 shadow-sm"
                                        : "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold shrink-0 transition-all",
                                        row.sent 
                                            ? "bg-emerald-200 text-emerald-700 shadow-sm" 
                                            : "bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                                    )}>
                                        {initial}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className={cn(
                                            "font-bold truncate",
                                            nameCol ? "text-slate-800" : "text-amber-500 italic"
                                        )}>
                                            {displayName}
                                        </h4>
                                        <div className={cn(
                                            "flex items-center gap-1.5 text-xs font-mono mt-1",
                                            phoneCol ? "text-slate-500" : "text-red-400"
                                        )}>
                                            <Smartphone className="w-3.5 h-3.5" />
                                            <span dir="ltr">{displayPhone}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => handleSend(index, row)}
                                    variant={row.sent ? "secondary" : "primary"}
                                    disabled={!phoneCol}
                                    className={cn(
                                        "rounded-full px-6 py-2.5 shrink-0 font-bold transition-all",
                                        row.sent && "bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200",
                                        !phoneCol && "opacity-50 cursor-not-allowed bg-slate-300 text-slate-600 shadow-none hover:bg-slate-300"
                                    )}
                                >
                                    {row.sent ? (
                                        <span className="flex items-center gap-1.5 text-sm">
                                            إعادة إرسال <Send className="w-4 h-4 -rotate-45" />
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5">
                                            {!phoneCol ? 'اختر عمود الهاتف' : 'إرسال'}
                                            {phoneCol && <Send className="w-4 h-4 -rotate-45" />}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        );
                    })}

                    {data.length === 0 && (
                        <div className="text-center py-20 text-slate-400">
                            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">لا توجد بيانات</p>
                            <p className="text-sm mt-2">قم بإضافة بيانات في محرر CSV</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}