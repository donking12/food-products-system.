import React, { useState, useRef, useEffect } from 'react';
import { Product, ProductCategory } from '../types';
import { PlusIcon } from './icons';

interface ProductFormProps {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
}

interface InputFieldProps {
  label: string;
  id: string;
  children?: React.ReactNode;
}

const InputField = ({ label, id, children }: InputFieldProps) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-slate-600 mb-2">{label}</label>
    {children}
  </div>
);

const ProductForm: React.FC<ProductFormProps> = ({ onAddProduct }) => {
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [units, setUnits] = useState(1);
  const [stock, setStock] = useState(1);
  const [category, setCategory] = useState<ProductCategory>(ProductCategory.GROCERIES);
  const [error, setError] = useState('');

  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode || !name) {
      setError('الرجاء تعبئة حقلي الباركود واسم الصنف.');
      return;
    }
    if (units <= 0 || stock <= 0 || price < 0) {
      setError('يجب أن تكون قيم الوحدات، الكمية، والسعر إيجابية.');
      return;
    }
    
    onAddProduct({ barcode, name, price: Number(price), units: Number(units), stock: Number(stock), category });

    setBarcode('');
    setName('');
    setPrice(0);
    setUnits(1);
    setStock(1);
    setCategory(ProductCategory.GROCERIES);
    setError('');
    barcodeRef.current?.focus();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
      <h2 className="text-xl font-bold mb-6 text-slate-700">إضافة منتج جديد</h2>
      {error && <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField label="باركود المنتج" id="barcode">
          <input
            ref={barcodeRef}
            id="barcode"
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="أدخل الباركود يدويًا أو عبر الماسح"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
          />
        </InputField>

        <InputField label="اسم الصنف" id="name">
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: حليب طويل الأجل"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
          />
        </InputField>
        
        <InputField label="السعر" id="price">
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
          />
        </InputField>

        <div className="grid grid-cols-2 gap-4">
            <InputField label="عدد الوحدات" id="units">
            <input
                id="units"
                type="number"
                min="1"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            />
            </InputField>
            <InputField label="الكمية المتاحة" id="stock">
            <input
                id="stock"
                type="number"
                min="1"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            />
            </InputField>
        </div>

        <InputField label="الفئة" id="category">
            <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 transition bg-white"
            >
                {Object.values(ProductCategory).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
        </InputField>

        <button
          type="submit"
          className="w-full bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors flex items-center justify-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>إضافة المنتج</span>
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
