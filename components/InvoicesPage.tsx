import React, { useState, useMemo, useEffect } from 'react';
import { Invoice, InvoiceItem, Product } from '../types';
import { PlusIcon, SaveIcon, TrashIcon, ViewIcon } from './icons';
import InvoiceViewModal from './InvoiceViewModal';

interface InvoicesPageProps {
    onSaveInvoice: (invoice: Invoice) => void;
    invoices: Invoice[];
    products: Product[];
}

const getNextInvoiceNumber = (invoices: Invoice[]): string => {
    if (invoices.length === 0) {
        return '1';
    }
    const maxNumber = Math.max(0, ...invoices.map(inv => parseInt(inv.invoiceNumber, 10) || 0));
    return (maxNumber + 1).toString();
};

const createInitialState = (nextInvoiceNumber: string) => ({
    id: `INV-${Date.now()}`,
    invoiceNumber: nextInvoiceNumber,
    customerName: '',
    date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    items: [{ id: `item-${Date.now()}`, productName: '', quantity: 1, price: 0, notes: '' }] as InvoiceItem[],
});

const MIN_TABLE_ROWS = 8;

const InvoicesPage: React.FC<InvoicesPageProps> = ({ onSaveInvoice, invoices, products }) => {
    const [invoice, setInvoice] = useState(() => createInitialState(getNextInvoiceNumber(invoices)));
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    
    // State for product autocomplete
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null);
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }, 1000);
        return () => clearInterval(timerId);
    }, []);

    const total = useMemo(() => {
        return invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    }, [invoice.items]);

    const handleHeaderChange = (field: 'invoiceNumber' | 'customerName' | 'date', value: string) => {
        setInvoice(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (itemId: string, field: keyof Omit<InvoiceItem, 'id'>, value: string | number) => {
        setInvoice(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === itemId ? { ...item, [field]: value } : item
            )
        }));
    };
    
    const handleProductSelect = (itemIndex: number, product: Product) => {
        const itemId = invoice.items[itemIndex].id;
        setInvoice(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === itemId ? { ...item, productName: product.name, price: product.price } : item
            )
        }));
        setActiveSuggestionIndex(null);
        setProductSearch('');
    };

    const handleAddItem = () => {
        const newItem: InvoiceItem = {
            id: `item-${Date.now()}`,
            productName: '',
            quantity: 1,
            price: 0,
            notes: '',
        };
        setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const handleRemoveItem = (itemId: string) => {
        if (invoice.items.length > 1) {
            setInvoice(prev => ({
                ...prev,
                items: prev.items.filter(item => item.id !== itemId)
            }));
        }
    };

    const handleSave = () => {
        if (!invoice.customerName.trim()) {
            alert('الرجاء إدخال اسم العميل.');
            return;
        }
        const validItems = invoice.items.filter(item => item.productName.trim() !== '' && item.quantity > 0);
        if (validItems.length === 0) {
            alert('الرجاء إضافة صنف واحد على الأقل للفاتورة.');
            return;
        }

        const finalInvoice: Invoice = { ...invoice, items: validItems, total, id: invoice.id };
        onSaveInvoice(finalInvoice);
        setInvoice(createInitialState(getNextInvoiceNumber([...invoices, finalInvoice])));
    };

    const filteredProducts = productSearch 
        ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
        : [];
    
    const emptyRows = Array.from({ length: Math.max(0, MIN_TABLE_ROWS - invoice.items.length) });

    return (
        <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-white p-4 md:p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-slate-700 mb-4 border-b pb-3">إنشاء فاتورة جديدة</h2>
                    <div id="invoice-preview" className="border-2 border-black p-4">
                        {/* Header */}
                        <header className="pb-4 mb-4">
                            <div className="flex justify-between items-center">
                                <div className="text-left font-mono text-sm border border-black p-1 px-2">
                                    {currentTime}
                                </div>
                                <h1 className="text-3xl font-bold text-red-600" style={{ borderBottom: '3px solid red', paddingBottom: '4px' }}>
                                    فاتورة المبيعات
                                </h1>
                                <div className="text-right font-mono text-sm">
                                    {new Date(invoice.date || new Date()).toLocaleDateString('en-GB')}
                                </div>
                            </div>
                        </header>

                        {/* Details */}
                        <section className="border-2 border-black p-4 mb-4">
                            <div className="w-full md:w-2/3 mx-auto space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                    <input id="invoice-number" type="text" value={invoice.invoiceNumber} onChange={(e) => handleHeaderChange('invoiceNumber', e.target.value)} className="w-1/2 px-3 py-1 border border-slate-400 rounded-sm text-center font-semibold"/>
                                    <label htmlFor="invoice-number" className="font-bold text-slate-800 text-lg">رقم الفاتورة</label>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <input id="invoice-date" type="date" value={invoice.date} onChange={(e) => handleHeaderChange('date', e.target.value)} className="w-1/2 px-3 py-1 border border-slate-400 rounded-sm text-center"/>
                                    <label htmlFor="invoice-date" className="font-bold text-slate-800 text-lg">التاريخ</label>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <input id="customer-name" type="text" value={invoice.customerName} onChange={(e) => handleHeaderChange('customerName', e.target.value)} placeholder="اسم العميل" className="w-1/2 px-3 py-1 border border-slate-400 rounded-sm text-center"/>
                                    <label htmlFor="customer-name" className="font-bold text-slate-800 text-lg">اسم العميل</label>
                                </div>
                            </div>
                        </section>

                        {/* Items Table */}
                        <section className="border-2 border-black">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-center">
                                    <thead className="bg-slate-200">
                                        <tr className="divide-x divide-black">
                                            <th className="p-2 font-semibold"></th>
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
                                                <td className="p-1 align-middle">
                                                    <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50" disabled={invoice.items.length <= 1}>
                                                        <TrashIcon className="w-4 h-4"/>
                                                    </button>
                                                </td>
                                                <td className="p-0"><input type="text" value={item.notes} onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)} className="w-full h-full text-right p-2 bg-transparent focus:outline-none focus:bg-gray-100"/></td>
                                                <td className="p-2 font-semibold align-middle">{(item.quantity * item.price).toFixed(2)}</td>
                                                <td className="p-0"><input type="number" min="0" step="0.01" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', Number(e.target.value))} className="w-full h-full text-center p-2 bg-transparent focus:outline-none focus:bg-gray-100"/></td>
                                                <td className="p-0"><input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))} className="w-full h-full text-center p-2 bg-transparent focus:outline-none focus:bg-gray-100"/></td>
                                                <td className="p-0 relative">
                                                    <input 
                                                        type="text" 
                                                        value={item.productName} 
                                                        onChange={(e) => {
                                                            handleItemChange(item.id, 'productName', e.target.value);
                                                            setProductSearch(e.target.value);
                                                        }}
                                                        onFocus={() => setActiveSuggestionIndex(index)}
                                                        className="w-full h-full text-right p-2 bg-cyan-50 focus:outline-none focus:bg-cyan-100 font-semibold"
                                                    />
                                                    {activeSuggestionIndex === index && filteredProducts.length > 0 && (
                                                        <ul className="absolute z-10 w-full bg-white border border-slate-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                            {filteredProducts.map(p => (
                                                                <li key={p.id} onClick={() => handleProductSelect(index, p)} className="p-2 text-right hover:bg-slate-100 cursor-pointer">
                                                                    {p.name} - <span className="text-slate-500">{p.price.toFixed(2)} ج.م</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </td>
                                                <td className="p-2 align-middle">{index + 1}</td>
                                            </tr>
                                        ))}
                                        {emptyRows.map((_, index) => (
                                            <tr key={`empty-${index}`} className="divide-x divide-black border-t border-black h-9">
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td className="bg-cyan-50"></td>
                                                <td></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Footer */}
                        <footer className="border-2 border-black mt-4 p-2">
                            <div className="flex items-center justify-end gap-4">
                                <div className="border-2 border-red-600 p-2 w-48 text-center text-2xl font-bold bg-gray-50 text-red-700">{total.toFixed(2)}</div>
                                <span className="text-2xl font-bold text-red-600">اجمالي الفاتورة</span>
                            </div>
                        </footer>
                    </div>
                    {/* Actions */}
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <button onClick={handleAddItem} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                            <PlusIcon className="w-4 h-4" />
                            <span>إضافة صنف للفاتورة</span>
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                            <SaveIcon className="w-5 h-5" />
                            <span>حفظ الفاتورة</span>
                        </button>
                    </div>
                </div>

                <div className="xl:col-span-1 bg-white p-4 md:p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-slate-700 mb-4 border-b pb-3">سجل الفواتير</h2>
                    <div className="overflow-y-auto max-h-[800px]">
                        {invoices.length === 0 ? (
                            <p className="text-center text-slate-500 py-8">لا توجد فواتير محفوظة بعد.</p>
                        ) : (
                            <table className="w-full text-sm text-right">
                                <thead className="bg-slate-100 sticky top-0">
                                    <tr>
                                        <th className="p-2 font-semibold">رقم الفاتورة</th>
                                        <th className="p-2 font-semibold">العميل</th>
                                        <th className="p-2 font-semibold">التاريخ</th>
                                        <th className="p-2 font-semibold">الإجمالي</th>
                                        <th className="p-2 font-semibold">إجراء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {invoices.map(inv => (
                                        <tr key={inv.id} className="hover:bg-slate-50">
                                            <td className="p-2 font-mono">#{inv.invoiceNumber}</td>
                                            <td className="p-2">{inv.customerName}</td>
                                            <td className="p-2">{new Date(inv.date).toLocaleDateString('ar-EG')}</td>
                                            <td className="p-2 font-bold">{inv.total.toFixed(2)}</td>
                                            <td className="p-2">
                                                <button onClick={() => setSelectedInvoice(inv)} className="text-emerald-600 hover:text-emerald-800 p-1 flex items-center gap-1 text-xs">
                                                    <ViewIcon className="w-4 h-4" />
                                                    <span>عرض</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {selectedInvoice && (
                <InvoiceViewModal 
                    invoice={selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}
        </>
    );
};

export default InvoicesPage;