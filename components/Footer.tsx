
import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="text-center p-4 text-slate-500 text-sm mt-8">
            <p>&copy; {new Date().getFullYear()} منظومة المبيعات. جميع الحقوق محفوظة.</p>
        </footer>
    );
};
