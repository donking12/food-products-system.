import React, { useRef } from 'react';
import { StoreIcon, LogoutIcon, DatabaseIcon, UploadIcon } from './icons';
import { User } from '../types';

interface HeaderProps {
    user: User;
    onLogout: () => void;
    onExportDatabase: () => void;
    onImportDatabase: (file: File) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onExportDatabase, onImportDatabase }) => {
    const importInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImportDatabase(file);
        }
        // Reset file input to allow re-uploading the same file
        if (importInputRef.current) {
            importInputRef.current.value = "";
        }
    };

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-3 md:px-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="text-emerald-500">
                        <StoreIcon className="w-10 h-10"/>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">منظومة مبيعات المواد الغذائية</h1>
                        <p className="text-slate-500 text-sm md:text-base">إدارة المخزون والمبيعات بكفاءة وسهولة</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <input
                        type="file"
                        ref={importInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".json"
                    />
                    <button 
                        onClick={handleImportClick}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                        aria-label="استيراد قاعدة البيانات"
                    >
                       <UploadIcon className="w-5 h-5" />
                       <span className="hidden md:inline">استيراد</span>
                    </button>
                    <button 
                        onClick={onExportDatabase}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                        aria-label="تصدير قاعدة البيانات"
                    >
                       <DatabaseIcon className="w-5 h-5" />
                       <span className="hidden md:inline">تصدير</span>
                    </button>
                    <div className="border-l border-slate-200 h-8 mx-2"></div>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-slate-700 hidden sm:block">مرحباً، {user.username}</p>
                        <p className="text-xs text-slate-500 hidden sm:block">الدور: {user.role}</p>
                    </div>
                     <button 
                        onClick={onLogout}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
                        aria-label="تسجيل الخروج"
                    >
                       <LogoutIcon className="w-5 h-5" />
                       <span className="hidden md:inline">خروج</span>
                    </button>
                </div>
            </div>
        </header>
    );
};