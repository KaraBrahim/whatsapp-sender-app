import React, { useState, useEffect, useRef } from 'react';
import { Database, Send, BookUser, Shield } from 'lucide-react';
import CsvEditor from './components/CsvEditor';
import Sender from './components/Sender';
import ContactImporter from './components/ContactImporter';
import PrivacyPolicy from './components/PrivacyPolicy';
import { Button } from './components/ui/BaseComponents';
import { cn, newId } from './lib/utils';

// ── localStorage helpers ──────────────────────────────────────────────────
const STORAGE_KEY = 'wa_sender_data';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: [], columns: ['الاسم', 'الرقم'] };
    const parsed = JSON.parse(raw);
    if (!parsed.columns || parsed.columns.length === 0) parsed.columns = ['الاسم', 'الرقم'];
    // Migrate rows saved before ids existed
    parsed.data = (parsed.data || []).map(row => (row.id ? row : { ...row, id: newId() }));
    return parsed;
  } catch {
    return { data: [], columns: ['الاسم', 'الرقم'] };
  }
}

function saveToStorage(data, columns) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, columns }));
  } catch { /* storage unavailable */ }
}

// ── Uncontrolled text input modal ─────────────────────────────────────────
// Uses a ref instead of controlled state so Arabic IME composition works correctly.
function TextInputModal({ isOpen, title, defaultValue = '', placeholder = '', onConfirm, onClose }) {
  const inputRef = useRef(null);

  // When modal opens, focus and set the default value
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.value = defaultValue;
      // Small delay to ensure the modal is rendered before focusing
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, defaultValue]);

  const handleConfirm = () => {
    const val = inputRef.current?.value?.trim() || '';
    if (!val) return;
    onConfirm(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-emerald-800 mb-4">{title}</h3>
        <input
          ref={inputRef}
          type="text"
          dir="auto"
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-2.5 rounded-lg border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-base"
        />
        <Button onClick={handleConfirm} className="w-full mt-3">تأكيد</Button>
        <div className="mt-2 flex justify-end">
          <Button variant="secondary" onClick={onClose}>إلغاء</Button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('contacts');
  const [showPrivacy, setShowPrivacy] = useState(false);

  const [data, setData] = useState(() => loadFromStorage().data);
  const [columns, setColumns] = useState(() => loadFromStorage().columns);

  // Debounced persist
  const saveTimer = useRef(null);
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveToStorage(data, columns), 500);
    return () => clearTimeout(saveTimer.current);
  }, [data, columns]);

  // Modal state — just open/close flags + which col to rename
  const [isAddColOpen, setIsAddColOpen] = useState(false);
  const [colToRename, setColToRename] = useState(null); // null = closed

  // ── column actions ──────────────────────────────────────────────────────

  const handleAddColumn = (name) => {
    if (columns.includes(name)) { alert('هذه الخاصية موجودة مسبقاً'); return; }
    setColumns(prev => [...prev, name]);
    setData(prev => prev.map(row => ({ ...row, [name]: '' })));
    setIsAddColOpen(false);
  };

  const handleRenameColumn = (newName) => {
    if (!colToRename) return;
    if (columns.includes(newName) && newName !== colToRename) { alert('هذه الخاصية موجودة مسبقاً'); return; }
    setColumns(prev => prev.map(c => c === colToRename ? newName : c));
    setData(prev => prev.map(row => {
      const r = { ...row, [newName]: row[colToRename] };
      if (newName !== colToRename) delete r[colToRename];
      return r;
    }));
    setColToRename(null);
  };

  const handleDeleteColumn = (col) => {
    if (columns.length <= 1) { alert('لا يمكن حذف الخاصية الأخيرة'); return; }
    if (!confirm(`حذف الخاصية "${col}"؟`)) return;
    setColumns(prev => prev.filter(c => c !== col));
    setData(prev => prev.map(row => { const r = { ...row }; delete r[col]; return r; }));
  };

  // ── contacts merge ──────────────────────────────────────────────────────

  const handleAddContactsToList = (contacts) => {
    const nameKey = 'الاسم';
    const phoneKey = 'الرقم';
    let currentCols = [...columns];
    if (currentCols.length === 0) {
      currentCols = [nameKey, phoneKey];
      setColumns(currentCols);
    } else {
      let updated = false;
      if (!currentCols.includes(nameKey)) { currentCols = [nameKey, ...currentCols]; updated = true; }
      if (!currentCols.includes(phoneKey)) { currentCols = [...currentCols, phoneKey]; updated = true; }
      if (updated) setColumns(currentCols);
    }
    const newRows = contacts.map(c => {
      const row = currentCols.reduce((acc, col) => ({ ...acc, [col]: '' }), {});
      row[nameKey] = c.name;
      row[phoneKey] = c.phone;
      row.id = newId();
      row.sent = false;
      return row;
    });
    setData(prev => {
      const padded = prev.map(row => {
        const r = { ...row };
        currentCols.forEach(col => { if (!(col in r)) r[col] = ''; });
        return r;
      });
      return [...padded, ...newRows];
    });
  };

  // Expose the sticky header's height as --header-h so in-panel sticky
  // toolbars can stick just below it instead of sliding underneath.
  const headerRef = useRef(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () =>
      document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div dir="rtl" className="min-h-screen pb-10">
      {/* Sticky header + tabs */}
      <div
        ref={headerRef}
        className="sticky top-0 z-30 bg-slate-50 bg-[radial-gradient(#dcf8c6_2px,transparent_2px)] bg-[size:30px_30px] pb-3"
      >
        <div className="bg-emerald-600 text-white p-6 pb-20 rounded-b-[2.5rem] shadow-emerald-200/50 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle,white_1.5px,transparent_1.5px)] bg-[size:20px_20px]" />
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <h1 className="text-3xl font-extrabold tracking-tight">WA Sender</h1>
            <button
              onClick={() => setShowPrivacy(true)}
              className="mt-2 text-emerald-100 hover:text-white text-xs flex items-center gap-1 mx-auto opacity-70 hover:opacity-100 transition-opacity"
            >
              <Shield className="w-3 h-3" /> سياسة الخصوصية
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 -mt-16 relative">
          <div className="bg-white p-1.5 rounded-2xl shadow-lg border border-slate-100 flex gap-1 max-w-xl mx-auto">
          {[
            { key: 'editor',   label: 'محرر البيانات', icon: <Database className="w-4 h-4" /> },
            { key: 'contacts', label: 'جهات الاتصال',  icon: <BookUser  className="w-4 h-4" /> },
            { key: 'sender',   label: 'إرسال الرسائل', icon: <Send      className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 py-3 px-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-1.5 text-xs sm:text-sm',
                activeTab === tab.key ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Panels — always mounted */}
      <div className="max-w-7xl mx-auto px-4 pt-3 relative z-20">
        <div>
          <div className={activeTab === 'editor' ? '' : 'hidden'}>
            <CsvEditor
              data={data}
              columns={columns}
              setData={setData}
              setColumns={setColumns}
              onAddColumn={() => setIsAddColOpen(true)}
              onRenameColumn={(col) => setColToRename(col)}
              onDeleteColumn={handleDeleteColumn}
            />
          </div>
          <div className={activeTab === 'contacts' ? '' : 'hidden'}>
            <ContactImporter onAddToList={handleAddContactsToList} />
          </div>
          <div className={activeTab === 'sender' ? '' : 'hidden'}>
            <Sender data={data} columns={columns} setData={setData} />
          </div>
        </div>
      </div>

      {/* Privacy */}
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}

      {/* Add column modal */}
      <TextInputModal
        isOpen={isAddColOpen}
        title="إضافة خاصية جديدة"
        placeholder="مثال: المدينة، العمر"
        defaultValue=""
        onConfirm={handleAddColumn}
        onClose={() => setIsAddColOpen(false)}
      />

      {/* Rename column modal */}
      <TextInputModal
        isOpen={colToRename !== null}
        title="تغيير اسم الخاصية"
        placeholder=""
        defaultValue={colToRename || ''}
        onConfirm={handleRenameColumn}
        onClose={() => setColToRename(null)}
      />
    </div>
  );
}

export default App;
