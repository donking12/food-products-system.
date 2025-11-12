import React from 'react';
import { ActiveView } from '../App';
import { CashIcon, ProductsIcon, InvoiceIcon } from './icons';

interface NavigationProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'sales', label: 'البيع', icon: CashIcon },
    { id: 'products', label: 'المنتجات', icon: ProductsIcon },
    { id: 'invoices', label: 'الفواتير', icon: InvoiceIcon },
  ];

  return (
    <div className="bg-white shadow-sm sticky top-0 z-20">
      <div className="container mx-auto px-4 md:px-8">
        <nav className="flex items-center gap-2">
          {navItems.map(item => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ActiveView)}
                className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-4 transition-all duration-200 ease-in-out
                  ${isActive 
                    ? 'border-emerald-500 text-emerald-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Navigation;
