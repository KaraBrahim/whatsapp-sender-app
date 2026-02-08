import React, { useRef } from 'react';
import { Trash2, Plus, Download, Upload, FilePlus, Edit2 } from 'lucide-react';
import Papa from 'papaparse';
import { Button, Card, Input } from './ui/BaseComponents';

export default function CsvEditor({
    data,
    columns,
    setData,
    setColumns,
    onAddColumn,
    onRenameColumn,
    onDeleteColumn
}) {
    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data.length > 0) {
                    setColumns(Object.keys(results.data[0]));
                    setData(results.data.map(row => ({ ...row, sent: false })));
                }
            }
        });
    };

    const updateCell = (rowIndex, column, value) => {
        const newData = [...data];
        newData[rowIndex][column] = value;
        setData(newData);
    };

    const addRow = () => {
        const newRow = columns.reduce((acc, col) => ({ ...acc, [col]: '' }), {});
        setData([...data, { ...newRow, sent: false }]);
    };

    const deleteRow = (index) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الصف؟')) {
            setData(data.filter((_, i) => i !== index));
        }
    };

    const exportCSV = (withStatus = false) => {
        const dataToExport = data.map(row => {
            const newRow = { ...row };
            if (!withStatus) delete newRow.sent;
            else newRow.sent = row.sent ? 'نعم' : 'لا';
            return newRow;
        });

        const csv = Papa.unparse(dataToExport);
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = withStatus ? 'contacts_status.csv' : 'contacts.csv';
        link.click();
    };

    if (columns.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <FilePlus className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-slate-600">لا توجد بيانات حالياً</h3>
                <p className="mb-6">قم بإنشاء جدول جديد أو استيراد ملف CSV</p>
                <div className="flex gap-3">
                    <Button onClick={() => {
                        setColumns(['الاسم', 'الرقم']);
                        setData([{ الاسم: '', الرقم: '', sent: false }]);
                    }}>
                        إنشاء جديد
                    </Button>
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4" /> استيراد CSV
                    </Button>
                </div>
                <input type="file" ref={fileInputRef} hidden accept=".csv" onChange={handleFileUpload} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <Card className="p-4 flex flex-wrap gap-3 items-center justify-between sticky top-4 z-20">
                <div className="flex gap-2">
                    <Button onClick={addRow} variant="secondary"><Plus className="w-4 h-4" /> صف</Button>
                    <Button onClick={onAddColumn} variant="secondary"><Plus className="w-4 h-4" /> عمود</Button>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => exportCSV(false)}>
                        <Download className="w-4 h-4" /> CSV
                    </Button>
                    <Button onClick={() => exportCSV(true)}>
                        <Download className="w-4 h-4" /> حفظ الحالة
                    </Button>
                    <Button variant="danger" onClick={() => { if (confirm('مسح الكل؟')) { setData([]); setColumns([]); } }}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto max-h-[65vh]">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                {columns.map(col => (
                                    <th key={col} className="p-4 text-sm font-bold text-slate-700 min-w-[150px] border-b border-slate-200 group">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="cursor-pointer hover:text-emerald-600" onClick={() => onRenameColumn(col)}>{col}</span>
                                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => onRenameColumn(col)} className="p-1 hover:bg-slate-200 rounded"><Edit2 className="w-3 h-3 text-slate-500" /></button>
                                                <button onClick={() => onDeleteColumn(col)} className="p-1 hover:bg-red-100 rounded"><Trash2 className="w-3 h-3 text-red-500" /></button>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                                <th className="p-4 w-16 sticky left-0 bg-slate-50"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.map((row, rIndex) => (
                                <tr key={rIndex} className="hover:bg-slate-50/80 transition-colors group">
                                    {columns.map(col => (
                                        <td key={`${rIndex}-${col}`} className="p-2 border-l border-transparent hover:border-slate-200">
                                            <input
                                                type="text"
                                                className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder-slate-300"
                                                value={row[col] || ''}
                                                onChange={(e) => updateCell(rIndex, col, e.target.value)}
                                                placeholder="..."
                                            />
                                        </td>
                                    ))}
                                    <td className="p-2 sticky left-0 bg-white group-hover:bg-slate-50">
                                        <button onClick={() => deleteRow(rIndex)} className="text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}