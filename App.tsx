import React, { useState, useCallback, useEffect } from 'react';
import { Product, ProductCategory, User, UserRole, UserAuth, Invoice } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import Login from './components/Login';
import { INITIAL_USERS } from './services/auth';
import Navigation from './components/Navigation';
import SalesPage from './components/SalesPage';
import ProductsPage from './components/ProductsPage';
import InvoicesPage from './components/InvoicesPage';
import { parseCSV, parseTXT, downloadFile } from './services/fileHandlers';

export type ActiveView = 'sales' | 'products' | 'invoices';

const LOCKOUT_DURATION_MINUTES = 2;
const MAX_LOGIN_ATTEMPTS = 3;

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<UserAuth[]>([]);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('sales');
  
  // Load state from localStorage on initial render
  useEffect(() => {
    const savedStateJSON = localStorage.getItem('appState');
    if (savedStateJSON) {
      try {
        const savedState = JSON.parse(savedStateJSON);
        if (savedState.products && Array.isArray(savedState.products)) {
          setProducts(savedState.products);
        }
        if (savedState.invoices && Array.isArray(savedState.invoices)) {
          setInvoices(savedState.invoices);
        }
      } catch (error) {
        console.error("Failed to parse state from localStorage", error);
        // If parsing fails, load initial data
        setProducts(INITIAL_PRODUCTS);
      }
    } else {
        // If no saved state, load initial data
        setProducts(INITIAL_PRODUCTS);
    }

    const initialUsersWithAuth = INITIAL_USERS.map(user => ({
      ...user,
      loginAttempts: 0,
      lockoutUntil: null,
    }));
    setUsers(initialUsersWithAuth);

    const rememberedUsername = localStorage.getItem('rememberedUser');
    if (rememberedUsername) {
      const rememberedUser = initialUsersWithAuth.find(u => u.username === rememberedUsername);
      if (rememberedUser) {
        setCurrentUser({ username: rememberedUser.username, role: rememberedUser.role });
      }
    }
  }, []);

  // Save state to localStorage whenever products or invoices change
  useEffect(() => {
    try {
      const appState = { products, invoices };
      localStorage.setItem('appState', JSON.stringify(appState));
    } catch (error) {
      console.error("Failed to save state to localStorage", error);
    }
  }, [products, invoices]);

  const addProduct = useCallback((product: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...product, id: product.barcode };
    setProducts(prevProducts => {
      const existingProductIndex = prevProducts.findIndex(p => p.barcode === newProduct.barcode);
      if (existingProductIndex > -1) {
        return prevProducts.map((p, index) => {
          if (index === existingProductIndex) {
            return {
              ...p,
              stock: p.stock + newProduct.stock,
              units: newProduct.units,
              name: newProduct.name,
              price: newProduct.price,
              category: newProduct.category
            };
          }
          return p;
        });
      } else {
        return [...prevProducts, newProduct];
      }
    });
  }, []);

  const deleteProduct = useCallback((barcode: string) => {
    setProducts(prevProducts => prevProducts.filter(p => p.barcode !== barcode));
  }, []);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;
      
      let newProducts: Product[] = [];
      try {
        if (file.type === 'text/csv') {
          newProducts = parseCSV(content);
        } else if (file.type === 'text/plain') {
          newProducts = parseTXT(content);
        } else {
          alert('نوع الملف غير مدعوم. يرجى استخدام ملفات CSV أو TXT.');
          return;
        }

        setProducts(prevProducts => {
            const productMap = new Map(prevProducts.map(p => [p.barcode, p]));
            newProducts.forEach(np => {
                productMap.set(np.barcode, np);
            });
            return Array.from(productMap.values());
        });

      } catch (error) {
        alert('حدث خطأ أثناء معالجة الملف. تأكد من أن التنسيق صحيح.');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };
  
  const handleSale = useCallback((cartItems: { product: Product; quantity: number }[]) => {
    setProducts(currentProducts => {
      const cartMap = new Map(cartItems.map(item => [item.product.id, item.quantity]));
      
      return currentProducts.map(product => {
        const soldQuantity = cartMap.get(product.id);
        if (soldQuantity) {
          return {
            ...product,
            stock: product.stock - soldQuantity
          };
        }
        return product;
      });
    });
  }, []);

  const handleSaveInvoice = (invoice: Invoice) => {
    setInvoices(prevInvoices => [...prevInvoices, invoice]);
    alert(`تم حفظ الفاتورة رقم ${invoice.invoiceNumber}`);
  };

  const handleExportDatabase = () => {
    const appState = {
      products,
      invoices,
    };
    const jsonString = JSON.stringify(appState, null, 2);
    downloadFile('database.json', jsonString, 'application/json;charset=utf-8;');
    alert('تم تصدير قاعدة البيانات بنجاح!');
  };

  const handleImportDatabase = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const loadedState = JSON.parse(content);
        
        // Basic validation
        const hasProducts = loadedState.products && Array.isArray(loadedState.products);
        const hasInvoices = loadedState.invoices && Array.isArray(loadedState.invoices);

        if (hasProducts || hasInvoices) {
            if (window.confirm('هل أنت متأكد من أنك تريد استبدال البيانات الحالية بالبيانات الموجودة في الملف؟')) {
                setProducts(loadedState.products || []);
                setInvoices(loadedState.invoices || []);
                alert('تم استيراد قاعدة البيانات بنجاح!');
            }
        } else {
            throw new Error('الملف غير صالح أو لا يحتوي على البيانات المطلوبة.');
        }

      } catch (error) {
        alert(`فشل استيراد قاعدة البيانات. قد يكون الملف تالفًا. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error(error);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleLogin = useCallback((username: string, password: string, rememberMe: boolean): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        setUsers(currentUsers => {
          const userIndex = currentUsers.findIndex(u => u.username === username);
          if (userIndex === -1) {
            reject(new Error('اسم المستخدم أو كلمة المرور غير صحيحة.'));
            return currentUsers;
          }

          const updatedUsers = [...currentUsers];
          const userAuth = updatedUsers[userIndex];

          if (userAuth.lockoutUntil && userAuth.lockoutUntil > Date.now()) {
            const remainingSeconds = Math.ceil((userAuth.lockoutUntil - Date.now()) / 1000);
            reject(new Error(`تم حظر الحساب مؤقتاً. الرجاء المحاولة مرة أخرى بعد ${remainingSeconds} ثانية.`));
            return updatedUsers;
          }

          if (userAuth.password_plaintext === password) {
            userAuth.loginAttempts = 0;
            userAuth.lockoutUntil = null;
            const user: User = { username: userAuth.username, role: userAuth.role };
            
            if (rememberMe) {
              localStorage.setItem('rememberedUser', user.username);
            } else {
              localStorage.removeItem('rememberedUser');
            }
            
            setCurrentUser(user);
            resolve(user);
            return updatedUsers;
          } else {
            userAuth.loginAttempts += 1;
            if (userAuth.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
              userAuth.lockoutUntil = Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000;
              reject(new Error(`لقد تجاوزت الحد الأقصى لمحاولات تسجيل الدخول. تم حظر الحساب لمدة ${LOCKOUT_DURATION_MINUTES} دقائق.`));
            } else {
              const attemptsLeft = MAX_LOGIN_ATTEMPTS - userAuth.loginAttempts;
              reject(new Error(`كلمة المرور غير صحيحة. (${attemptsLeft} محاولة متبقية)`));
            }
            return updatedUsers;
          }
        });
      }, 500);
    });
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('sales');
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col">
      <Header 
        user={currentUser} 
        onLogout={handleLogout}
        onExportDatabase={handleExportDatabase}
        onImportDatabase={handleImportDatabase}
      />
      <Navigation activeView={activeView} setActiveView={setActiveView} />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        {activeView === 'sales' && <SalesPage products={products} onSaleComplete={handleSale} />}
        {activeView === 'products' && 
            <ProductsPage 
                products={products} 
                onAddProduct={addProduct}
                onDeleteProduct={deleteProduct}
                onFileUpload={handleFileUpload}
                user={currentUser}
            />
        }
        {activeView === 'invoices' && <InvoicesPage onSaveInvoice={handleSaveInvoice} invoices={invoices} products={products} />}
      </main>
      <Footer />
    </div>
  );
};

const INITIAL_PRODUCTS: Product[] = [
    // Basic Materials -> GROCERIES
    { id: '6221234567011', barcode: '6221234567011', name: 'مكرونة', price: 15.50, units: 1, stock: 180, category: ProductCategory.GROCERIES },
    { id: '6221234567028', barcode: '6221234567028', name: 'أرز مصري', price: 25.00, units: 1, stock: 250, category: ProductCategory.GROCERIES },
    { id: '6221234567035', barcode: '6221234567035', name: 'طماطم معلبة', price: 8.75, units: 1, stock: 120, category: ProductCategory.GROCERIES },
    { id: '6221234567042', barcode: '6221234567042', name: 'عدس أصفر', price: 30.25, units: 1, stock: 90, category: ProductCategory.GROCERIES },
    { id: '6221234567059', barcode: '6221234567059', name: 'فاصوليا بيضاء', price: 35.00, units: 1, stock: 110, category: ProductCategory.GROCERIES },
    { id: '6221234567066', barcode: '6221234567066', name: 'زيت زيتون', price: 120.00, units: 1, stock: 75, category: ProductCategory.GROCERIES },
    { id: '6221234567073', barcode: '6221234567073', name: 'سكر', price: 18.50, units: 1, stock: 300, category: ProductCategory.GROCERIES },
    { id: '6221234567080', barcode: '6221234567080', name: 'ملح', price: 5.00, units: 1, stock: 220, category: ProductCategory.GROCERIES },
  
    // Dairy -> DAIRY
    { id: '6291003810015', barcode: '6291003810015', name: 'حليب كامل الدسم', price: 22.00, units: 1, stock: 150, category: ProductCategory.DAIRY },
    { id: '6291003810022', barcode: '6291003810022', name: 'زبادي', price: 5.50, units: 1, stock: 200, category: ProductCategory.DAIRY },
    { id: '6291003810039', barcode: '6291003810039', name: 'جبن أبيض', price: 45.00, units: 1, stock: 80, category: ProductCategory.DAIRY },
  
    // Beverages -> BEVERAGES
    { id: '5449000000996', barcode: '5449000000996', name: 'مشروب غازي كولا', price: 7.50, units: 1, stock: 350, category: ProductCategory.BEVERAGES },
    { id: '5449000001009', barcode: '5449000001009', name: 'عصير برتقال', price: 12.00, units: 1, stock: 140, category: ProductCategory.BEVERAGES },
    { id: '5449000001016', barcode: '5449000001016', name: 'عصير تفاح', price: 12.00, units: 1, stock: 130, category: ProductCategory.BEVERAGES },
  
    // Bakery -> BAKERY
    { id: '8901030650918', barcode: '8901030650918', name: 'خبز عربي', price: 2.00, units: 1, stock: 95, category: ProductCategory.BAKERY },
    { id: '8901030650925', barcode: '8901030650925', name: 'خبز توست أبيض', price: 15.00, units: 1, stock: 70, category: ProductCategory.BAKERY },
    
    // Sweets & Snacks -> OTHER
    { id: '8901030650932', barcode: '8901030650932', name: 'بسكويت شاي', price: 10.00, units: 1, stock: 280, category: ProductCategory.OTHER },
    { id: '8901030650949', barcode: '8901030650949', name: 'شوكولاتة بالحليب', price: 18.00, units: 1, stock: 400, category: ProductCategory.OTHER },
  ];

export default App;