
import React, { useRef, useState } from 'react';
import { Product, UserRole } from '../types';
import { exportToCSV, exportToPDF, exportToTXT } from '../services/fileHandlers';
import { UploadIcon, DownloadIcon, SettingsIcon, CSVIcon, TXTIcon, PDFIcon } from './icons';

interface ToolbarProps {
  onFileUpload: (file: File) => void;
  products: Product[];
  userRole: UserRole;
}

const Toolbar: React.FC<ToolbarProps> = ({ onFileUpload, products, userRole }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const isAdmin = userRole === UserRole.ADMIN;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleExport = (format: 'csv' | 'txt' | 'pdf') => {
    switch (format) {
      case 'csv':
        exportToCSV(products);
        break;
      case 'txt':
        exportToTXT(products);
        break;
      case 'pdf':
        exportToPDF(products);
        break;
    }
    setIsExportMenuOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <h2 className="text-xl font-bold text-slate-700">قائمة المنتجات</h2>
        {isAdmin && (
            <div className="flex items-center gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".csv, .txt"
                />
                <button
                    onClick={handleUploadClick}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    <UploadIcon className="w-4 h-4" />
                    <span>تحميل ملف</span>
                </button>

                <div className="relative">
                    <button
                        onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        <span>تصدير البيانات</span>
                    </button>
                    {isExportMenuOpen && (
                        <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-10">
                            <a onClick={() => handleExport('csv')} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer">
                                <CSVIcon className="w-5 h-5 text-green-600"/>
                                <span>تصدير كـ CSV</span>
                            </a>
                            <a onClick={() => handleExport('txt')} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer">
                                <TXTIcon className="w-5 h-5 text-blue-600"/>
                                <span>تصدير كـ TXT</span>
                            </a>
                            <a onClick={() => handleExport('pdf')} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer">
                                <PDFIcon className="w-5 h-5 text-red-600"/>
                                <span>تصدير كـ PDF</span>
                            </a>
                        </div>
                    )}
                </div>

                <button className="p-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                    <SettingsIcon className="w-5 h-5" />
                </button>
            </div>
        )}
    </div>
  );
};

export default Toolbar;
