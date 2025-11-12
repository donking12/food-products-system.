import React, { useState } from 'react';
import { User } from '../types';
import { StoreIcon } from './icons';

interface LoginProps {
  onLogin: (username: string, password: string, rememberMe: boolean) => Promise<User>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDevLogin = async (user: 'admin' | 'user') => {
    setError('');
    setIsLoading(true);
    // Hardcoded credentials for development purposes, based on services/auth.ts
    const password = user === 'admin' ? 'admin123' : 'user123';
    try {
      await onLogin(user, password, true); // Keep user remembered for convenience
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-emerald-100 p-4 rounded-full mb-4">
                <StoreIcon className="w-12 h-12 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">تسجيل الدخول السريع</h1>
            <p className="text-slate-500 mt-1">(وضع المطور)</p>
          </div>

          {error && <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

          <div className="space-y-4">
            <button
              onClick={() => handleDevLogin('admin')}
              disabled={isLoading}
              className="w-full bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:bg-emerald-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جارِ الدخول...' : 'الدخول كـ (مدير)'}
            </button>
            <button
              onClick={() => handleDevLogin('user')}
              disabled={isLoading}
              className="w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جارِ الدخول...' : 'الدخول كـ (موظف مبيعات)'}
            </button>
          </div>
          <div className="text-center mt-6">
              <p className="text-xs text-slate-400">
                  تم إيقاف صفحة تسجيل الدخول العادية مؤقتًا.
              </p>
          </div>
        </div>
        <footer className="text-center p-4 text-slate-400 text-xs mt-4">
            <p>&copy; {new Date().getFullYear()} منظومة المبيعات. جميع الحقوق محفوظة.</p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
