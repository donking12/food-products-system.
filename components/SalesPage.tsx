import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Product } from '../types';
import { ShoppingCartIcon, TrashIcon, CashIcon } from './icons';
import ReceiptModal from './ReceiptModal';

interface SalesPageProps {
  products: Product[];
  onSaleComplete: (cartItems: { product: Product; quantity: number }[]) => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const SalesPage: React.FC<SalesPageProps> = ({ products, onSaleComplete }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<{ items: CartItem[], total: number } | null>(null);

  useEffect(() => {
    if (!showReceipt) {
      barcodeInputRef.current?.focus();
    }
  }, [showReceipt]);

  const handleAddToCart = useCallback(() => {
    if (!barcode.trim()) return;

    const product = products.find(p => p.barcode === barcode);
    if (!product) {
      setError('المنتج غير موجود.');
      return;
    }

    if (product.stock <= 0) {
      setError('الكمية في المخزون نفدت.');
      return;
    }
    
    setError('');
    
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
            return currentCart.map(item =>
                item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
             setError('لا يمكن إضافة كمية أكبر من المتوفر في المخزون.');
             return currentCart;
        }
      } else {
        return [...currentCart, { product, quantity: 1 }];
      }
    });

    setBarcode('');
  }, [barcode, products]);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddToCart();
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(currentCart =>
      currentCart.map(item => {
        if (item.product.id === productId) {
          if (quantity > 0 && quantity <= item.product.stock) {
            setError('');
            return { ...item, quantity };
          } else if (quantity > item.product.stock) {
            setError('الكمية المطلوبة أكبر من المتوفر في المخزون.');
            return item; // Keep original quantity
          }
        }
        return item;
      }).filter(item => item.quantity > 0) // Remove if quantity is 0 or less
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(currentCart => currentCart.filter(item => item.product.id !== productId));
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    
    setReceiptData({ items: [...cart], total: total });
    onSaleComplete(cart);
    setCart([]);
    setShowReceipt(true);
    setError('');
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setReceiptData(null);
  };
  
  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-slate-700 mb-4">سلة المبيعات</h2>
            
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2 mb-4">
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="أدخل باركود المنتج هنا..."
                className="flex-grow px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button type="submit" className="px-4 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600">
                إضافة
              </button>
            </form>
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            
            <div className="overflow-x-auto">
              {cart.length === 0 ? (
                <div className="text-center py-16 px-6 bg-slate-50 rounded-lg">
                  <ShoppingCartIcon className="w-16 h-16 mx-auto text-slate-400" />
                  <p className="text-slate-500 mt-4">سلة المبيعات فارغة.</p>
                  <p className="text-sm text-slate-400 mt-1">ابدأ بإضافة منتجات لبدء عملية بيع جديدة.</p>
                </div>
              ) : (
                <table className="min-w-full bg-white text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-3 font-semibold text-right">الصنف</th>
                      <th className="p-3 font-semibold text-center">الكمية</th>
                      <th className="p-3 font-semibold text-center">سعر الوحدة</th>
                      <th className="p-3 font-semibold text-center">الإجمالي</th>
                      <th className="p-3 font-semibold text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {cart.map(item => (
                      <tr key={item.product.id}>
                        <td className="p-3 font-semibold">{item.product.name}</td>
                        <td className="p-3 w-24">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                            min="1"
                            max={item.product.stock}
                            className="w-full text-center p-1 border rounded-md"
                          />
                        </td>
                        <td className="p-3 text-center">{item.product.price.toFixed(2)}</td>
                        <td className="p-3 text-center font-bold">{(item.product.price * item.quantity).toFixed(2)}</td>
                        <td className="p-3 text-center">
                          <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700">
                            <TrashIcon className="w-5 h-5"/>
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
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg sticky top-28">
            <h2 className="text-xl font-bold text-slate-700 mb-6">ملخص الفاتورة</h2>
            <div className="space-y-4 text-lg">
              <div className="flex justify-between items-center text-slate-600">
                <span>عدد الأصناف:</span>
                <span className="font-bold">{cart.length}</span>
              </div>
              <hr />
              <div className="flex justify-between items-center text-slate-800 font-bold text-2xl">
                <span>الإجمالي:</span>
                <span>{total.toFixed(2)} ج.م</span>
              </div>
            </div>
            <button
              onClick={handleCompleteSale}
              disabled={cart.length === 0}
              className="w-full mt-8 bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <CashIcon className="w-6 h-6"/>
              <span>إتمام البيع</span>
            </button>
          </div>
        </div>
      </div>
      {showReceipt && receiptData && (
        <ReceiptModal
          cartItems={receiptData.items}
          total={receiptData.total}
          onClose={handleCloseReceipt}
        />
      )}
    </>
  );
};

export default SalesPage;