// Configuración de Precios de Impresión (en Euros por unidad)
export const SIZE_PRICES = {
    '10x15': 0.25,
    '13x18': 0.35,
    '15x20': 0.45,
    '20x30': 0.95
};

// Nombres descriptivos de tamaños
export const SIZE_LABELS = {
    '10x15': '10x15 cm',
    '13x18': '13x18 cm',
    '15x20': '15x20 cm',
    '20x30': '20x30 cm'
};

// Estado inicial de la aplicación
const initialState = {
    files: [], // Array de objetos { id, file, previewUrl, name, size, quantity, paper }
    orderCode: '',
    source: '', // Origen por defecto vacío
    kiosk: '',
    zipBlob: null,
    zipName: '',
    client: {
        name: '',
        email: '',
        phone: '',
        notes: ''
    }
};

// Clon profundo básico del estado inicial para el reinicio
let appState = { ...initialState, files: [], client: { ...initialState.client } };

const listeners = new Set();

// Suscribirse a los cambios del estado
export function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

// Notificar a todos los suscriptores
export function notify() {
    listeners.forEach(listener => listener({ ...appState }));
}

// Obtener el estado actual (copia de sólo lectura)
export function getState() {
    return { ...appState };
}

// Acciones para modificar el estado

export function addFiles(fileList) {
    let filesAdded = 0;
    
    for (let i = 0; i < fileList.length; i++) {
        const item = fileList[i];
        
        let file, size = '10x15', quantity = 1, paper = 'brillo';
        
        if (item instanceof File) {
            file = item;
        } else if (item && item.file instanceof File) {
            file = item.file;
            if (item.size) size = item.size;
            if (item.quantity) quantity = item.quantity;
            if (item.paper) paper = item.paper;
        } else {
            continue;
        }
        
        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) continue;
        
        // Crear objeto local
        const id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const previewUrl = URL.createObjectURL(file);
        
        appState.files.push({
            id: id,
            file: file,
            previewUrl: previewUrl,
            name: file.name,
            size: size,
            quantity: quantity,
            paper: paper
        });
        filesAdded++;
    }

    if (filesAdded > 0) {
        notify();
    }
}

export function deleteFile(id) {
    const fileObj = appState.files.find(f => f.id === id);
    if (fileObj && fileObj.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileObj.previewUrl);
    }
    
    appState.files = appState.files.filter(f => f.id !== id);
    notify();
}

export function updateFileSize(id, newSize) {
    const fileObj = appState.files.find(f => f.id === id);
    if (fileObj) {
        fileObj.size = newSize;
        notify();
    }
}

export function updateFilePaper(id, newPaper) {
    const fileObj = appState.files.find(f => f.id === id);
    if (fileObj) {
        fileObj.paper = newPaper;
        notify();
    }
}

export function updateFileQuantity(id, change) {
    const fileObj = appState.files.find(f => f.id === id);
    if (fileObj) {
        const newQty = fileObj.quantity + change;
        if (newQty >= 1 && newQty <= 99) {
            fileObj.quantity = newQty;
            notify();
        }
    }
}

export function setConnectionInfo({ source, kiosk }) {
    if (source) appState.source = source;
    if (kiosk) appState.kiosk = kiosk;
    notify();
}

export function setClientInfo(clientData) {
    appState.client = { ...appState.client, ...clientData };
    notify();
}

export function setOrderDetails({ orderCode, zipBlob, zipName }) {
    appState.orderCode = orderCode;
    appState.zipBlob = zipBlob;
    appState.zipName = zipName;
    notify();
}

export function restartOrder() {
    // Revocar preview URLs para evitar fugas de memoria
    appState.files.forEach(item => {
        if (item.previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(item.previewUrl);
        }
    });
    
    appState.files = [];
    appState.orderCode = '';
    appState.zipBlob = null;
    appState.zipName = '';
    appState.client = {
        name: '',
        email: '',
        phone: '',
        notes: ''
    };
    
    notify();
}

// selectores de conveniencia

export function getTotals() {
    let totalPhotos = appState.files.length;
    let totalCopies = 0;
    let totalPrice = 0;
    
    appState.files.forEach(item => {
        totalCopies += item.quantity;
        const unitPrice = SIZE_PRICES[item.size] || 0.25;
        totalPrice += unitPrice * item.quantity;
    });
    
    return { totalPhotos, totalCopies, totalPrice };
}
