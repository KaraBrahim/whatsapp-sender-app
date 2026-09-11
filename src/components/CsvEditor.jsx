import { useRef, useEffect } from 'react';
import { Trash2, Plus, Download, Edit2 } from 'lucide-react';
import Papa from 'papaparse';
import { Button, Card } from './ui/BaseComponents';

// Uncontrolled cell — types freely, commits to state only on blur.
// Prevents the re-render-on-every-keystroke problem that resets input.
function CellInput({ value, onCommit, isNumeric }) {
    const ref = useRef(null);

    // Sync external value only when the input is not focused
    useEffect(() => {
        if (ref.current && document.activeElement !== ref.current) {
            ref.current.value = value ?? '';
        }
    }, [value]);

    return (
        <input
            ref={ref}
            type="text"
            dir={isNumeric ? 'ltr' : 'auto'}
            defaultValue={value ?? ''}
            onBlur={(e) => onCommit(e.target.value)}
            className="w-full bg-transparent outline-none text-base md:text-sm text-slate-700 placeholder-slate-300"
            placeholder="..."
        />
    );
}

export default function CsvEditor({
    data,
    columns,
    setData,
    setColumns,
    onAddColumn,
    onRenameColumn,
    onDeleteColumn,
}) {
    const commitCell = (rowId, column, value) => {
        setData(prev =>
            prev.map(row => (row.id === rowId ? { ...row, [column]: value } : row))
        );
    };

    const deleteRow = (rowId) => {
        setData(prev => prev.filter(row => row.id !== rowId));
    };

    const exportCSV = () => {
        // Export only user-visible columns, in column order
        const dataToExport = data.map(row =>
            Object.fromEntries(columns.map(col => [col, row[col] ?? '']))
        );
        const csv = Papa.unparse(dataToExport);
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'contacts.csv';
        link.click();
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <Card className="p-4 flex flex-wrap gap-3 items-center justify-between sticky top-4 z-20">
                <div className="flex gap-2">
                    <Button onClick={onAddColumn} variant="secondary">
                        <Plus className="w-4 h-4" /> متغير جديد
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={exportCSV}>
                        <Download className="w-4 h-4" /> CSV
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => {
                            if (confirm('مسح الكل؟')) {
                                setData([]);
                                setColumns(['الاسم', 'الرقم']);
                            }
                        }}
                    >
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
                                    <th
                                        key={col}
                                        className="p-4 text-sm font-bold text-slate-700 min-w-[150px] border-b border-slate-200 group"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span
                                                className="cursor-pointer hover:text-emerald-600"
                                                onClick={() => onRenameColumn(col)}
                                            >
                                                {col}
                                            </span>
                                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onRenameColumn(col)}
                                                    className="p-1 hover:bg-slate-200 rounded"
                                                >
                                                    <Edit2 className="w-3 h-3 text-slate-500" />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteColumn(col)}
                                                    className="p-1 hover:bg-red-100 rounded"
                                                >
                                                    <Trash2 className="w-3 h-3 text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                                <th className="p-4 w-16 sticky left-0 bg-slate-50"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                                    {columns.map(col => {
                                        const isNumeric =
                                            col === 'الرقم' ||
                                            col.toLowerCase().includes('رقم') ||
                                            col.toLowerCase().includes('phone') ||
                                            col.toLowerCase().includes('tel');
                                        return (
                                            <td
                                                key={col}
                                                className="p-2 border-l border-transparent hover:border-slate-200"
                                            >
                                                <CellInput
                                                    value={row[col] || ''}
                                                    onCommit={(val) => commitCell(row.id, col, val)}
                                                    isNumeric={isNumeric}
                                                />
                                            </td>
                                        );
                                    })}
                                    <td className="p-2 sticky left-0 bg-white group-hover:bg-slate-50">
                                        <button
                                            onClick={() => deleteRow(row.id)}
                                            className="text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={columns.length + 1}
                                        className="text-center py-16 text-slate-400 text-sm"
                                    >
                                        لا توجد بيانات — أضف جهات اتصال من تبويب "جهات الاتصال"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
