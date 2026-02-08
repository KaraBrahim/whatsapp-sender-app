import React, { useState } from 'react';
import { Database, Send, Plus, Edit3 } from 'lucide-react';
import CsvEditor from './components/CsvEditor';
import Sender from './components/Sender';
import { Button, Input, cn } from './components/ui/BaseComponents';

// Simple Modal Component
const Modal = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-emerald-800 mb-4">{title}</h3>
        {children}
        <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>إلغاء</Button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('editor');
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  
  // Modals State
  const [isAddColOpen, setIsAddColOpen] = useState(false);
  const [isRenameColOpen, setIsRenameColOpen] = useState(false);
  const [colToRename, setColToRename] = useState(null);
  const [newColName, setNewColName] = useState('');

  // Column Actions
  const handleAddColumn = () => {
    if (!newColName.trim()) return;
    if (columns.includes(newColName)) return alert('اسم العمود موجود');
    setColumns([...columns, newColName]);
    setData(data.map(row => ({ ...row, [newColName]: '' })));
    setNewColName('');
    setIsAddColOpen(false);
  };

  const handleRenameColumn = () => {
    if (!newColName.trim() || !colToRename) return;
    const index = columns.indexOf(colToRename);
    const newCols = [...columns];
    newCols[index] = newColName;
    setColumns(newCols);
    
    // Update Data keys
    setData(data.map(row => {
        const newRow = { ...row, [newColName]: row[colToRename] };
        delete newRow[colToRename];
        return newRow;
    }));
    
    setNewColName('');
    setColToRename(null);
    setIsRenameColOpen(false);
  };

  const handleDeleteColumn = (col) => {
      if(columns.length <= 1) return alert("لا يمكن حذف العمود الأخير");
      if(!confirm(`حذف العمود "${col}"؟`)) return;
      
      setColumns(columns.filter(c => c !== col));
      setData(data.map(row => {
          const newRow = { ...row };
          delete newRow[col];
          return newRow;
      }));
  };

  const openRenameModal = (col) => {
      setColToRename(col);
      setNewColName(col);
      setIsRenameColOpen(true);
  };

  return (
    <div dir="rtl" className="min-h-screen pb-10">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-6 pb-20 rounded-b-[2.5rem] shadow-emerald-200/50 shadow-xl mb-2 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight">WhatsApp Sender</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        {/* Navigation Tabs */}
        <div className="bg-white p-1.5 rounded-2xl shadow-lg border border-slate-100 flex gap-1 mb-6 max-w-lg mx-auto">
            {['editor', 'sender'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                        "flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm",
                        activeTab === tab 
                            ? "bg-emerald-600 text-white shadow-md" 
                            : "text-slate-500 hover:bg-slate-50"
                    )}
                >
                    {tab === 'editor' ? <Database className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                    {tab === 'editor' ? 'محرر البيانات' : 'إرسال الرسائل'}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'editor' ? (
                <CsvEditor 
                    data={data} 
                    columns={columns} 
                    setData={setData} 
                    setColumns={setColumns} 
                    onAddColumn={() => setIsAddColOpen(true)}
                    onRenameColumn={openRenameModal}
                    onDeleteColumn={handleDeleteColumn}
                />
            ) : (
                <Sender data={data} columns={columns} setData={setData} />
            )}
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={isAddColOpen} title="إضافة عمود جديد" onClose={() => setIsAddColOpen(false)}>
        <Input 
            placeholder="مثال: المدينة، العمر" 
            value={newColName} 
            onChange={(e) => setNewColName(e.target.value)} 
            autoFocus
        />
        <Button onClick={handleAddColumn} className="w-full mt-3">إضافة</Button>
      </Modal>

      <Modal isOpen={isRenameColOpen} title="تغيير اسم العمود" onClose={() => setIsRenameColOpen(false)}>
        <Input 
            value={newColName} 
            onChange={(e) => setNewColName(e.target.value)} 
            autoFocus
        />
        <Button onClick={handleRenameColumn} className="w-full mt-3">حفظ التغييرات</Button>
      </Modal>
    </div>
  );
}

export default App;