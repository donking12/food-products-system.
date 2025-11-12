import { Product, ProductCategory } from '../types';

// Type assertion for jsPDF libraries loaded from CDN
declare const jspdf: any;

export const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), content], { type: mimeType }); // Add BOM for UTF-8
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- EXPORT FUNCTIONS ---

export const exportToCSV = (products: Product[]) => {
    const headers = ['barcode', 'name', 'price', 'units', 'stock', 'category'];
    const csvRows = [
        headers.join(','),
        ...products.map(p => headers.map(h => `"${p[h as keyof Product]}"`).join(','))
    ];
    downloadFile('products.csv', csvRows.join('\n'), 'text/csv;charset=utf-8;');
};

export const exportToTXT = (products: Product[]) => {
    const txtContent = products.map(p => 
        `Barcode: ${p.barcode}, Name: ${p.name}, Price: ${p.price}, Units: ${p.units}, Stock: ${p.stock}, Category: ${p.category}`
    ).join('\n');
    downloadFile('products.txt', txtContent, 'text/plain;charset=utf-8;');
};

export const exportToPDF = (products: Product[]) => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    doc.addFont('https://fonts.gstatic.com/s/cairo/v14/SLXLc1nY6Hkvalrub76M.ttf', 'Cairo', 'normal');
    doc.setFont('Cairo');
    
    doc.autoTable({
        head: [['الفئة', 'المخزون', 'الوحدات', 'السعر', 'اسم الصنف', 'الباركود']],
        body: products.map(p => [p.category, p.stock, p.units, p.price.toFixed(2), p.name, p.barcode]),
        styles: {
            font: 'Cairo',
            halign: 'right'
        },
        headStyles: {
            fillColor: [34, 197, 94] // emerald-500
        }
    });

    doc.save('products.pdf');
};


// --- IMPORT FUNCTIONS ---

const isValidCategory = (value: string): value is ProductCategory => {
    return Object.values(ProductCategory).includes(value as ProductCategory);
};

export const parseCSV = (content: string): Product[] => {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const requiredHeaders = ['barcode', 'name', 'price', 'units', 'stock', 'category'];
    if(!requiredHeaders.every(h => headers.includes(h))) {
        throw new Error('CSV file is missing required headers: ' + requiredHeaders.join(', '));
    }

    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const entry: {[key: string]: string} = {};
        headers.forEach((header, index) => {
            entry[header] = values[index];
        });
        
        const category = isValidCategory(entry.category) ? entry.category : ProductCategory.OTHER;
        const price = parseFloat(entry.price);
        const units = parseInt(entry.units, 10);
        const stock = parseInt(entry.stock, 10);

        if (!entry.barcode || !entry.name || isNaN(price) || isNaN(units) || isNaN(stock)) {
            throw new Error(`Invalid data found in CSV row: ${line}`);
        }

        return {
            id: entry.barcode,
            barcode: entry.barcode,
            name: entry.name,
            price,
            units,
            stock,
            category
        };
    });
};

export const parseTXT = (content: string): Product[] => {
    // Expects format: barcode,name,price,units,stock,category per line
    const lines = content.split('\n').filter(line => line.trim() !== '');
    return lines.map(line => {
        const [barcode, name, priceStr, unitsStr, stockStr, categoryStr] = line.split(',').map(v => v.trim());
        
        const price = parseFloat(priceStr);
        const units = parseInt(unitsStr, 10);
        const stock = parseInt(stockStr, 10);
        const category = isValidCategory(categoryStr) ? categoryStr : ProductCategory.OTHER;
        
        if (!barcode || !name || isNaN(price) || isNaN(units) || isNaN(stock)) {
            console.warn(`Skipping invalid line in TXT file: ${line}`);
            return null;
        }

        return {
            id: barcode,
            barcode,
            name,
            price,
            units,
            stock,
            category
        };
    }).filter((p): p is Product => p !== null);
};