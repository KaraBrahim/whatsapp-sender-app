import { X, Shield } from 'lucide-react';

export default function PrivacyPolicy({ onClose }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg max-h-[90vh] flex flex-col rounded-t-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-lg">
                        <Shield className="w-5 h-5" />
                        سياسة الخصوصية
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-5 space-y-4 text-sm text-slate-700 leading-relaxed">
                    <p className="text-xs text-slate-400">آخر تحديث: يونيو 2026</p>

                    <section>
                        <h3 className="font-bold text-slate-800 mb-1">ما الذي يجمعه التطبيق؟</h3>
                        <p>يجمع التطبيق أسماء جهات الاتصال وأرقام هواتفها فقط عند منحك الإذن صراحةً. لا يجمع أي بيانات أخرى.</p>
                    </section>

                    <section>
                        <h3 className="font-bold text-slate-800 mb-1">أين تُخزَّن البيانات؟</h3>
                        <p>جميع البيانات تُخزَّن <strong>محلياً على جهازك فقط</strong>. لا تُرسَل أي بيانات إلى خوادم خارجية أو أي طرف ثالث.</p>
                    </section>

                    <section>
                        <h3 className="font-bold text-slate-800 mb-1">كيف تُستخدم البيانات؟</h3>
                        <p>تُستخدم أرقام الهاتف والأسماء فقط لفتح تطبيق المراسلة المثبت على جهازك مع رسالة مُعدَّة مسبقاً. التطبيق لا يُرسل رسائل تلقائياً — كل إرسال يتطلب ضغطة يدوية من المستخدم.</p>
                    </section>

                    <section>
                        <h3 className="font-bold text-slate-800 mb-1">صلاحية جهات الاتصال</h3>
                        <p>يطلب التطبيق إذن قراءة جهات الاتصال لعرضها داخل التطبيق فقط. يمكنك رفض هذا الإذن واستخدام الإدخال اليدوي للأرقام بدلاً من ذلك.</p>
                    </section>

                    <section>
                        <h3 className="font-bold text-slate-800 mb-1">حذف البيانات</h3>
                        <p>يمكنك حذف جميع البيانات في أي وقت من خلال زر "مسح الكل" داخل التطبيق، أو بمسح بيانات التطبيق من إعدادات الجهاز.</p>
                    </section>

                    <section>
                        <h3 className="font-bold text-slate-800 mb-1">لا مشاركة مع أطراف ثالثة</h3>
                        <p>لا نشارك أي بيانات مع أي طرف ثالث. التطبيق لا يحتوي على إعلانات ولا تحليلات ولا اتصال بالإنترنت لأغراض جمع البيانات.</p>
                    </section>

                    <section>
                        <h3 className="font-bold text-slate-800 mb-1">التواصل</h3>
                        <p>لأي استفسار بخصوص الخصوصية يمكن التواصل عبر صفحة التطبيق على Google Play.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
