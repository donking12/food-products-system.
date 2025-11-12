import React, { useRef } from 'react';
import { Product } from '../types';
import { PrintIcon } from './icons';

interface CartItem {
    product: Product;
    quantity: number;
}

interface ReceiptModalProps {
    cartItems: CartItem[];
    total: number;
    onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ cartItems, total, onClose }) => {
    const receiptRef = useRef<HTMLDivElement>(null);
    const saleDate = new Date();

    const handlePrint = () => {
        const printContent = receiptRef.current;
        if (printContent) {
            const printWindow = window.open('', '', 'height=600,width=800');
            if (printWindow) {
                printWindow.document.write('<html><head><title>فاتورة</title>');
                printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
                printWindow.document.write('<style>@import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap"); body { font-family: "Cairo", sans-serif; text-align: right; direction: rtl; } .no-print { display: none !important; } </style>');
                printWindow.document.write('</head><body >');
                
                // Clone the receipt content and remove buttons before printing
                const contentToPrint = printContent.cloneNode(true) as HTMLElement;
                const buttons = contentToPrint.querySelector('.no-print');
                if(buttons) buttons.remove();

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
                className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <div ref={receiptRef}>
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">فاتورة بيع</h2>
                        <p className="text-slate-500 text-sm">منظومة مبيعات المواد الغذائية</p>
                        <p className="text-slate-500 text-xs mt-1">
                            {saleDate.toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' })} - {saleDate.toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    
                    <div className="border-t border-b border-dashed border-slate-300 py-3 my-3">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="font-semibold text-right pb-2">الصنف</th>
                                    <th className="font-semibold text-center pb-2">الكمية</th>
                                    <th className="font-semibold text-center pb-2">السعر</th>
                                    <th className="font-semibold text-left pb-2">الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map(item => (
                                    <tr key={item.product.id}>
                                        <td className="py-1">{item.product.name}</td>
                                        <td className="text-center py-1">{item.quantity}</td>
                                        <td className="text-center py-1">{item.product.price.toFixed(2)}</td>
                                        <td className="text-left py-1 font-semibold">{(item.product.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-2 mt-4 text-base">
                         <div className="flex justify-between items-center text-slate-600">
                            <span>عدد الأصناف:</span>
                            <span className="font-bold">{cartItems.length}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-800 font-bold text-2xl pt-2">
                            <span>الإجمالي:</span>
                            <span>{total.toFixed(2)} ج.م</span>
                        </div>
                    </div>

                    <div className="text-center mt-6 text-xs text-slate-400">
                        شكراً لتعاملكم معنا!
                    </div>
                </div>

                <div className="mt-6 flex gap-3 no-print">
                    <button
                        onClick={handlePrint}
                        className="flex-1 bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <PrintIcon className="w-5 h-5" />
                        <span>طباعة</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                        إغلاق (بيع جديد)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;
