import React from 'react';
import { Product, UserRole } from '../types';
import { TrashIcon } from './icons';

interface ProductListProps {
  products: Product[];
  onDeleteProduct: (barcode: string) => void;
  userRole: UserRole;
}

const ProductList: React.FC<ProductListProps> = ({ products, onDeleteProduct, userRole }) => {
  const isAdmin = userRole === UserRole.ADMIN;

  if (products.length === 0) {
    return (
        <div className="text-center py-10 px-6 bg-slate-50 rounded-lg">
            <p className="text-slate-500">لا توجد منتجات في المخزون حاليًا.</p>
            <p className="text-sm text-slate-400 mt-2">ابدأ بإضافة منتج جديد من النموذج.</p>
        </div>
    );
  }

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full bg-white text-sm text-right">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-3 font-semibold tracking-wide">باركود</th>
            <th className="p-3 font-semibold tracking-wide">اسم الصنف</th>
            <th className="p-3 font-semibold tracking-wide">الفئة</th>
            <th className="p-3 font-semibold tracking-wide text-center">السعر</th>
            <th className="p-3 font-semibold tracking-wide text-center">وحدات</th>
            <th className="p-3 font-semibold tracking-wide text-center">المخزون</th>
            {isAdmin && <th className="p-3 font-semibold tracking-wide text-center">إجراء</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-slate-50">
              <td className="p-3 text-slate-600 whitespace-nowrap font-mono">{product.barcode}</td>
              <td className="p-3 text-slate-800 whitespace-nowrap font-semibold">{product.name}</td>
              <td className="p-3 text-slate-600 whitespace-nowrap">{product.category}</td>
              <td className="p-3 text-slate-600 whitespace-nowrap text-center font-semibold">{product.price.toFixed(2)}</td>
              <td className="p-3 text-slate-600 whitespace-nowrap text-center">{product.units}</td>
              <td className="p-3 text-slate-600 whitespace-nowrap text-center">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.stock > 20 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.stock} قطعة
                </span>
                </td>
              {isAdmin && (
                <td className="p-3 whitespace-nowrap text-center">
                  <button
                    onClick={() => onDeleteProduct(product.barcode)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                    aria-label={`حذف ${product.name}`}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
