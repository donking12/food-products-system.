import React, { useRef } from 'react';
import { Invoice } from '../types';
import { PrintIcon } from './icons';

interface InvoiceViewModalProps {
    invoice: Invoice;
    onClose: () => void;
}

const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({ invoice, onClose }) => {
    const invoiceRef = useRef<HTMLDivElement>(null);
    const MIN_TABLE_ROWS = 8;
    const emptyRows = Array.from({ length: Math.max(0, MIN_TABLE_ROWS - invoice.items.length) });

    const handlePrint = () => {
        const printContent = invoiceRef.current;
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=800');
            if (printWindow) {
                printWindow.document.write('<html><head><title>فاتورة</title>');
                printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
                printWindow.document.write('<style>@import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap"); body { font-family: "Cairo", sans-serif; direction: rtl; } .no-print { display: none !important; } </style>');
                printWindow.document.write('</head><body >');
                
                const contentToPrint = printContent.cloneNode(true) as HTMLElement;
                printWindow.document.write(contentToPrint.innerHTML);

                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => { 
                    printWindow.print();
                    printWindow.close();
                }, 250);
            }
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div 
                className="bg-white p-4 md:p-6 rounded-xl shadow-2xl w-full max-w-4xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div ref={invoiceRef}>
                    <div className="border-2 border-black p-4">
                        <header className="pb-4 mb-4">
                            <div className="flex justify-between items-center">
                                <div className="text-left font-mono text-sm">
                                    {new Date(invoice.date).toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <h1 className="text-3xl font-bold text-red-600" style={{ borderBottom: '3px solid red', paddingBottom: '4px' }}>
                                    فاتورة المبيعات
                                </h1>
                                <div className="text-right font-mono text-sm">
                                    {new Date(invoice.date).toLocaleDateString('en-GB')}
                                </div>
                            </div>
                        </header>

                        <section className="border-2 border-black p-4 mb-4">
                            <div className="w-full md:w-2/3 mx-auto space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="w-1/2 px-3 py-1 text-center font-semibold">{invoice.invoiceNumber}</div>
                                    <div className="font-bold text-slate-800 text-lg">رقم الفاتورة</div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="w-1/2 px-3 py-1 text-center">{new Date(invoice.date).toLocaleDateString('ar-EG')}</div>
                                    <div className="font-bold text-slate-800 text-lg">التاريخ</div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="w-1/2 px-3 py-1 text-center">{invoice.customerName}</div>
                                    <div className="font-bold text-slate-800 text-lg">اسم العميل</div>
                                </div>
                            </div>
                        </section>

                        <section className="border-2 border-black">
                            <table className="min-w-full text-sm text-center">
                                <thead className="bg-slate-200">
                                    <tr className="divide-x divide-black">
                                        <th className="p-2 font-semibold">ملاحظات</th>
                                        <th className="p-2 font-semibold">الاجمالي</th>
                                        <th className="p-2 font-semibold">السعر</th>
                                        <th className="p-2 font-semibold">الكمية</th>
                                        <th className="p-2 font-semibold w-2/5">اسم المنتج</th>
                                        <th className="p-2 font-semibold bg-yellow-200">م</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item, index) => (
                                        <tr key={item.id} className="divide-x divide-black border-t border-black">
                                            <td className="p-2 text-right">{item.notes}</td>
                                            <td className="p-2 font-semibold">{(item.quantity * item.price).toFixed(2)}</td>
                                            <td className="p-2">{item.price.toFixed(2)}</td>
                                            <td className="p-2">{item.quantity}</td>
                                            <td className="p-2 text-right font-semibold">{item.productName}</td>
                                            <td className="p-2">{index + 1}</td>
                                        </tr>
                                    ))}
                                    {emptyRows.map((_, index) => (
                                         <tr key={`empty-${index}`} className="divide-x divide-black border-t border-black h-9">
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                         </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>

                        <footer className="border-2 border-black mt-4 p-2">
                            <div className="flex items-center justify-end gap-4">
                                <div className="border-2 border-red-600 p-2 w-48 text-center text-2xl font-bold bg-gray-50 text-red-700">{invoice.total.toFixed(2)}</div>
                                <span className="text-2xl font-bold text-red-600">اجمالي الفاتورة</span>
                            </div>
                        </footer>
                    </div>
                </div>

                <div className="mt-6 flex gap-3 no-print">
                    <button
                        onClick={handlePrint}
                        className="flex-1 bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <PrintIcon className="w-5 h-5" />
                        <span>طباعة</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceViewModal;