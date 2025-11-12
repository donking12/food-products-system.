import React from 'react';
import { Product, User } from '../types';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import Toolbar from './Toolbar';
import { parseCSV, parseTXT } from '../services/fileHandlers';

interface ProductsPageProps {
    products: Product[];
    user: User;
    onAddProduct: (product: Omit<Product, 'id'>) => void;
    onDeleteProduct: (barcode: string) => void;
    onFileUpload: (file: File) => void;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ products, user, onAddProduct, onDeleteProduct, onFileUpload }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <ProductForm onAddProduct={onAddProduct} />
            </div>
            <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <Toolbar userRole={user.role} onFileUpload={onFileUpload} products={products} />
                    <ProductList userRole={user.role} products={products} onDeleteProduct={onDeleteProduct} />
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
