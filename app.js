// ==========================================================================
// FOTOLAR - LÓGICA DE LA WEBAPP (REDIRECCIÓN A WHATSAPP WEB CON ARCHIVO ZIP)
// ==========================================================================

// Configuración de Precios de Impresión (en Euros por unidad)
const SIZE_PRICES = {
    '10x15': 0.25,
    '13x18': 0.35,
    '15x20': 0.45,
    '20x30': 0.95
};

// Nombres descriptivos de tamaños
const SIZE_LABELS = {
    '10x15': '10x15 cm',
    '13x18': '13x18 cm',
    '15x20': '15x20 cm',
    '20x30': '20x30 cm'
};

// Estado de la Aplicación
let appState = {
    files: [], // Array de objetos { id, file, previewUrl, name, size, quantity, paper }
    orderCode: '',
    source: 'QR Entrada', // Origen por defecto
    kiosk: '',
    zipBlob: null,
    zipName: ''
};

// Elementos del DOM
const elWelcomeSection = document.getElementById('welcome-section');
const elGallerySection = document.getElementById('gallery-section');
const elSuccessSection = document.getElementById('success-section');
const elDropZone = document.getElementById('drop-zone');
const elFileInput = document.getElementById('file-input');
const elBtnBrowse = document.getElementById('btn-browse');
const elBtnDemo = document.getElementById('btn-demo');
const elBtnAddMore = document.getElementById('btn-add-more');
const elPhotosGrid = document.getElementById('photos-grid');
const elGalleryCount = document.getElementById('gallery-count');

// Badge inferior
const elBottomBadge = document.getElementById('bottom-badge');
const elBadgeTotalCount = document.getElementById('badge-total-count');
const elBadgeTotalPrice = document.getElementById('badge-total-price');
const elBtnConfirm = document.getElementById('btn-confirm');

// Modal
const elContactModal = document.getElementById('contact-modal');
const elBtnCloseModal = document.getElementById('btn-close-modal');
const elOrderForm = document.getElementById('order-form');
const elInputName = document.getElementById('input-name');
const elInputEmail = document.getElementById('input-email');
const elInputPhone = document.getElementById('input-phone');
const elInputNotes = document.getElementById('input-notes');
const elSummaryItemsList = document.getElementById('summary-items-list');
const elSummaryTotalPrice = document.getElementById('summary-total-price');

// Loader
const elLoaderOverlay = document.getElementById('loader-overlay');
const elLoaderTitle = document.getElementById('loader-title');
const elLoaderDesc = document.getElementById('loader-desc');
const elProgressBarFill = document.getElementById('progress-bar-fill');
const elProgressPercent = document.getElementById('progress-percent');
const elLoaderFilesList = document.getElementById('loader-files-list');

// Ticket de Éxito
const elTicketOrderCode = document.getElementById('ticket-order-code');
const elTicketQR = document.getElementById('ticket-qr');
const elTicketName = document.getElementById('ticket-name');
const elTicketCopies = document.getElementById('ticket-copies');
const elTicketPrice = document.getElementById('ticket-price');
const elBtnSavePdf = document.getElementById('btn-save-pdf');
const elBtnSendEmail = document.getElementById('btn-send-email');
const elBtnRestart = document.getElementById('btn-restart');
const elConnBadge = document.getElementById('conn-badge');
const elConnSource = document.getElementById('conn-source');


/* ==========================================================================
   Inicialización y Detección de Parámetros URL (QR / NFC)
   ========================================================================== */
function init() {
    const params = new URLSearchParams(window.location.search);
    
    // Simular escaneo de QR o NFC
    let sourceText = '';
    
    if (params.has('nfc')) {
        sourceText = 'NFC ';
    }
    
    if (params.has('kiosk')) {
        appState.kiosk = params.get('kiosk');
        sourceText += 'Mostrador ' + appState.kiosk;
    } else if (params.has('mesa')) {
        sourceText += 'Mesa ' + params.get('mesa');
    } else if (params.has('source')) {
        sourceText += params.get('source');
    }
    
    if (sourceText) {
        appState.source = sourceText;
        elConnSource.textContent = sourceText;
        elConnBadge.style.display = 'flex';
    }

    // Configurar Event Listeners
    setupEventListeners();
}

/* ==========================================================================
   Event Listeners
   ========================================================================== */
function setupEventListeners() {
    // Selección de archivos
    elBtnBrowse.addEventListener('click', () => elFileInput.click());
    elFileInput.addEventListener('change', handleFileSelect);
    elBtnAddMore.addEventListener('click', () => elFileInput.click());
    
    // Drag & Drop
    elDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elDropZone.classList.add('dragover');
    });
    elDropZone.addEventListener('dragleave', () => {
        elDropZone.classList.remove('dragover');
    });
    elDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elDropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            addImages(e.dataTransfer.files);
        }
    });

    // Demo Mode
    elBtnDemo.addEventListener('click', loadDemoPhotos);

    // Controles del Modal de contacto
    elBtnConfirm.addEventListener('click', openContactModal);
    elBtnCloseModal.addEventListener('click', closeContactModal);
    elContactModal.addEventListener('click', (e) => {
        if (e.target === elContactModal) closeContactModal();
    });

    // Formulario de Pedido
    elOrderForm.addEventListener('submit', handleOrderSubmit);
    
    // Reiniciar
    elBtnRestart.addEventListener('click', restartOrder);
}

/* ==========================================================================
   Manejo de Archivos y Fotos
   ========================================================================== */
function handleFileSelect(e) {
    if (e.target.files.length > 0) {
        addImages(e.target.files);
        // Reset del input para permitir subir el mismo archivo después
        elFileInput.value = '';
    }
}

// Añade las imágenes al estado global
function addImages(fileList) {
    let filesAdded = 0;
    
    for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        
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
            size: '10x15', // tamaño por defecto
            quantity: 1,  // cantidad por defecto
            paper: 'brillo' // acabado por defecto
        });
        filesAdded++;
    }

    if (filesAdded > 0) {
        updateUI();
    }
}

// Genera archivos de fotos de muestra usando Canvas
function loadDemoPhotos() {
    showLoader("Generando fotos de muestra...", "Creando imágenes optimizadas...", 30);
    
    const samples = [
        { name: 'fotolar_boda_ejemplo.jpg', text: 'Enlace Boda', color1: '#fda4af', color2: '#f43f5e' },
        { name: 'fotolar_comunion_ejemplo.jpg', text: 'Comunión María', color1: '#bfdbfe', color2: '#3b82f6' },
        { name: 'fotolar_paisaje_ejemplo.jpg', text: 'Atardecer Córdoba', color1: '#fed7aa', color2: '#ea580c' }
    ];

    let loadedCount = 0;
    
    samples.forEach((sample, index) => {
        setTimeout(() => {
            createSampleImageFile(sample.name, sample.text, sample.color1, sample.color2, (file) => {
                const id = 'demo-' + index + '-' + Date.now();
                const previewUrl = URL.createObjectURL(file);
                
                appState.files.push({
                    id: id,
                    file: file,
                    previewUrl: previewUrl,
                    name: sample.name,
                    size: '10x15',
                    quantity: 1 + index, // Variar cantidades para test
                    paper: index === 1 ? 'mate' : 'brillo'
                });
                
                loadedCount++;
                
                // Actualizar barra de progreso del cargador
                const percent = Math.round((loadedCount / samples.length) * 100);
                updateLoaderProgress(percent, `Creada ${sample.name}`);
                
                if (loadedCount === samples.length) {
                    setTimeout(() => {
                        hideLoader();
                        updateUI();
                    }, 400);
                }
            });
        }, index * 200);
    });
}

// Crea una imagen simulada pintando en un canvas para no requerir red
function createSampleImageFile(name, labelText, color1, color2, callback) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Gradiente de fondo
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Patrón decorativo (Círculos concéntricos)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(400, 300, 200, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(400, 300, 100, 0, Math.PI * 2);
    ctx.stroke();

    // Dibujar icono de cámara de fotos
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.roundRect(320, 250, 160, 100, 12);
    ctx.fill();
    // Lente de la cámara
    ctx.fillStyle = color2;
    ctx.beginPath();
    ctx.arc(400, 300, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(385, 285, 10, 0, Math.PI * 2);
    ctx.fill();
    // Flash de la cámara
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.roundRect(340, 235, 40, 15, 4);
    ctx.fill();

    // Textos
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 8;
    
    // Título marca de agua
    ctx.font = 'bold 36px Georgia, serif';
    ctx.fillText('Fotolar Córdoba', 400, 120);

    // Texto de la muestra
    ctx.font = '500 24px -apple-system, sans-serif';
    ctx.fillText(labelText, 400, 480);
    
    // Subtexto descriptivo
    ctx.font = '300 16px -apple-system, sans-serif';
    ctx.fillText('Imagen de Prueba para Impresión', 400, 515);

    // Convertir canvas a Blob
    canvas.toBlob((blob) => {
        const file = new File([blob], name, { type: 'image/jpeg' });
        callback(file);
    }, 'image/jpeg', 0.85);
}

// Elimina una foto seleccionada
function deletePhoto(id) {
    // Liberar memoria del object URL
    const fileObj = appState.files.find(f => f.id === id);
    if (fileObj && fileObj.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileObj.previewUrl);
    }
    
    appState.files = appState.files.filter(f => f.id !== id);
    updateUI();
}

// Cambia el tamaño de impresión de una foto
function updatePhotoSize(id, newSize) {
    const fileObj = appState.files.find(f => f.id === id);
    if (fileObj) {
        fileObj.size = newSize;
        updateTotals();
    }
}

// Cambia el acabado del papel
function updatePhotoPaper(id, newPaper) {
    const fileObj = appState.files.find(f => f.id === id);
    if (fileObj) {
        fileObj.paper = newPaper;
    }
}

// Cambia la cantidad de copias
function updatePhotoQty(id, change) {
    const fileObj = appState.files.find(f => f.id === id);
    if (fileObj) {
        const newQty = fileObj.quantity + change;
        if (newQty >= 1 && newQty <= 99) {
            fileObj.quantity = newQty;
            const card = document.querySelector(`.photo-card[data-id="${id}"]`);
            if (card) {
                card.querySelector('.qty-val').textContent = newQty;
                card.querySelector('.item-price').textContent = calculateItemPrice(fileObj).toFixed(2) + ' €';
            }
            updateTotals();
        }
    }
}

// Calcula el precio de una tarjeta de foto individual
function calculateItemPrice(item) {
    const unitPrice = SIZE_PRICES[item.size] || 0.25;
    return unitPrice * item.quantity;
}


/* ==========================================================================
   Actualización de la Interfaz (UI)
   ========================================================================== */
function updateUI() {
    const hasFiles = appState.files.length > 0;
    
    if (hasFiles) {
        elWelcomeSection.style.display = 'none';
        elGallerySection.style.display = 'block';
        elBottomBadge.classList.add('visible');
        elGalleryCount.textContent = appState.files.length;
        renderPhotosGrid();
    } else {
        elWelcomeSection.style.display = 'block';
        elGallerySection.style.display = 'none';
        elBottomBadge.classList.remove('visible');
    }
    
    updateTotals();
}

// Renderiza las fotos cargadas en el grid
function renderPhotosGrid() {
    elPhotosGrid.innerHTML = '';
    
    appState.files.forEach(item => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.setAttribute('data-id', item.id);
        
        const price = calculateItemPrice(item);
        
        card.innerHTML = `
            <div class="photo-preview-container">
                <img src="${item.previewUrl}" alt="${item.name}" class="photo-preview">
            </div>
            <div class="photo-config">
                <div class="photo-meta">
                    <span class="photo-name" title="${item.name}">${item.name}</span>
                    <button type="button" class="btn-delete-photo" onclick="deletePhoto('${item.id}')" title="Eliminar foto">×</button>
                </div>
                <div class="config-rows">
                    <div class="select-wrapper">
                        <label>Tamaño</label>
                        <select class="select-input size-select" onchange="updatePhotoSize('${item.id}', this.value)">
                            <option value="10x15" ${item.size === '10x15' ? 'selected' : ''}>10x15 cm (0.25€)</option>
                            <option value="13x18" ${item.size === '13x18' ? 'selected' : ''}>13x18 cm (0.35€)</option>
                            <option value="15x20" ${item.size === '15x20' ? 'selected' : ''}>15x20 cm (0.45€)</option>
                            <option value="20x30" ${item.size === '20x30' ? 'selected' : ''}>20x30 cm (0.95€)</option>
                        </select>
                    </div>
                    <div class="select-wrapper">
                        <label>Papel</label>
                        <select class="select-input paper-select" onchange="updatePhotoPaper('${item.id}', this.value)">
                            <option value="brillo" ${item.paper === 'brillo' ? 'selected' : ''}>Brillo</option>
                            <option value="mate" ${item.paper === 'mate' ? 'selected' : ''}>Mate</option>
                        </select>
                    </div>
                </div>
                <div class="quantity-section">
                    <span class="item-price">${price.toFixed(2)} €</span>
                    <div class="quantity-controls">
                        <button type="button" class="btn-qty" onclick="updatePhotoQty('${item.id}', -1)">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button type="button" class="btn-qty" onclick="updatePhotoQty('${item.id}', 1)">+</button>
                    </div>
                </div>
            </div>
        `;
        elPhotosGrid.appendChild(card);
    });
}

// Calcula y actualiza contadores y precios totales
function updateTotals() {
    let totalPhotos = appState.files.length;
    let totalCopies = 0;
    let totalPrice = 0;
    
    appState.files.forEach(item => {
        totalCopies += item.quantity;
        totalPrice += calculateItemPrice(item);
    });
    
    // Actualizar barra flotante inferior
    elBadgeTotalCount.textContent = `${totalPhotos} fotos - ${totalCopies} copias`;
    elBadgeTotalPrice.textContent = `${totalPrice.toFixed(2).replace('.', ',')} €`;
    
    // Animación de pulso si hay elementos
    if (totalCopies > 0) {
        elBtnConfirm.classList.add('pulse');
    } else {
        elBtnConfirm.classList.remove('pulse');
    }
}


/* ==========================================================================
   Gestión del Modal de Formulario de Contacto
   ========================================================================== */
function openContactModal() {
    if (appState.files.length === 0) return;
    
    // Generar resumen de copias agrupadas por tamaño
    const sizeGroups = {};
    let totalCopies = 0;
    let totalPrice = 0;
    
    appState.files.forEach(item => {
        if (!sizeGroups[item.size]) {
            sizeGroups[item.size] = { count: 0, price: 0 };
        }
        sizeGroups[item.size].count += item.quantity;
        sizeGroups[item.size].price += calculateItemPrice(item);
        totalCopies += item.quantity;
        totalPrice += calculateItemPrice(item);
    });
    
    // Renderizar desglose
    elSummaryItemsList.innerHTML = '';
    for (const size in sizeGroups) {
        const row = document.createElement('div');
        row.className = 'summary-row';
        row.innerHTML = `
            <span>Copias ${SIZE_LABELS[size]} (x${sizeGroups[size].count}):</span>
            <span>${sizeGroups[size].price.toFixed(2).replace('.', ',')} €</span>
        `;
        elSummaryItemsList.appendChild(row);
    }
    
    elSummaryTotalPrice.textContent = `${totalPrice.toFixed(2).replace('.', ',')} €`;
    elContactModal.classList.add('active');
}

function closeContactModal() {
    elContactModal.classList.remove('active');
}


/* ==========================================================================
   Generación de ZIP y Procesamiento del Pedido
   ========================================================================== */
function handleOrderSubmit(e) {
    e.preventDefault();
    
    const clientName = elInputName.value.trim();
    const clientEmail = elInputEmail.value.trim();
    const clientPhone = elInputPhone.value.trim();
    const clientNotes = elInputNotes.value.trim();
    
    if (!clientName || !clientEmail || !clientPhone) return;
    
    closeContactModal();
    showLoader("Empaquetando pedido...", "Comprimiendo tus fotos localmente...", 5);

    // Generar código de pedido aleatorio para este ticket
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    appState.orderCode = `FL-${randomNum}`;
    
    // Instanciar JSZip
    const zip = new JSZip();
    
    // Crear archivo info.txt con el detalle del pedido
    let infoTxt = `==================================================
PEDIDO DE IMPRESIÓN - FOTOLAR CÓRDOBA
==================================================
Código de Pedido: ${appState.orderCode}
Fecha: ${new Date().toLocaleString('es-ES')}
Origen Acceso: ${appState.source}
--------------------------------------------------
DATOS DEL CLIENTE:
Nombre: ${clientName}
Teléfono/WhatsApp: ${clientPhone}
Notas Adicionales: ${clientNotes || 'Ninguna'}

--------------------------------------------------
DESGLOSE DE IMPRESIÓN POR ARCHIVO:
`;

    let totalCopies = 0;
    let totalPrice = 0;
    
    // Agrupar promesas para añadir cada fichero al ZIP
    const filePromises = appState.files.map((item, index) => {
        totalCopies += item.quantity;
        totalPrice += calculateItemPrice(item);
        
        // Generar nombre descriptivo para el archivo dentro del ZIP que incluya la configuración
        // Ejemplo: 01_10x15_mate_x3_foto1.jpg
        const fileExt = item.file.name.substring(item.file.name.lastIndexOf('.'));
        const cleanName = item.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\.-]/g, '');
        const zipFileName = `${(index+1).toString().padStart(2, '0')}_[${item.size}]_[${item.paper}]_[x${item.quantity}]_${cleanName}`;
        
        infoTxt += `
[Foto ${index+1}]
Archivo original: ${item.name}
Archivo en ZIP: ${zipFileName}
Tamaño: ${SIZE_LABELS[item.size]}
Cantidad: ${item.quantity} copias
Acabado Papel: ${item.paper.toUpperCase()}
`;
        
        // Retornar promesa para leer el archivo e insertarlo en el ZIP
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                zip.file(zipFileName, e.target.result);
                resolve();
            };
            reader.readAsArrayBuffer(item.file);
        });
    });

    infoTxt += `
--------------------------------------------------
RESUMEN GLOBAL:
Total fotos diferentes: ${appState.files.length}
Total copias a imprimir: ${totalCopies}
Precio total estimado: ${totalPrice.toFixed(2)} €

Gracias por confiar en Fotolar Córdoba.
Muestra el código QR del ticket en el mostrador para proceder.
==================================================`;

    // Resolver todas las lecturas de ficheros y generar el ZIP
    Promise.all(filePromises).then(() => {
        // Añadir el archivo de metadatos info.txt
        zip.file("info_pedido.txt", infoTxt);
        
        updateLoaderProgress(40, "Generando archivo ZIP de envío...");
        
        // Generar el archivo Blob ZIP de forma asíncrona especificando el MIME type correcto
        zip.generateAsync({ type: "blob", mimeType: "application/zip" }, function updateCallback(metadata) {
            // Callback de progreso de la compresión
            const basePercent = 40;
            const zipPercent = Math.round(metadata.percent * 0.6); // Escalar al 60% restante
            const totalPercent = basePercent + zipPercent;
            
            let statusText = "Comprimiendo archivos...";
            if (totalPercent > 90) statusText = "Finalizando compresión de imágenes...";
            
            updateLoaderProgress(totalPercent, statusText);
        }).then(function(content) {
            // Nombre del archivo ZIP
            const zipName = `fotolar-pedido-${appState.orderCode}.zip`;
            
            // Guardar en el estado (por si acaso, aunque ya no se descarga automáticamente)
            appState.zipBlob = content;
            appState.zipName = zipName;
            
            // Simular subida transparente de las fotos
            showLoader("Subiendo fotos...", "Cargando archivo ZIP en el servidor de Fotolar...", 60);
            
            setTimeout(() => {
                updateLoaderProgress(85, "Enviando correo con el pedido a fotolar@fotolar.es...");
                
                setTimeout(() => {
                    updateLoaderProgress(100, "¡Pedido enviado con éxito y archivado!");
                    
                    setTimeout(() => {
                        hideLoader();
                        // Mostrar pantalla de éxito
                        showSuccessScreen(clientName, clientEmail, clientPhone, totalCopies, totalPrice, zipName);
                    }, 500);
                }, 1000); // Darle un segundo para simular el envío del email a la tienda
            }, 1000); // Un segundo para simular la subida del ZIP
        });
    });
}

/* ==========================================================================
   Pantalla de Éxito y Redirección a WhatsApp
   ========================================================================== */
function showSuccessScreen(name, email, phone, totalCopies, totalPrice, zipName) {
    elWelcomeSection.style.display = 'none';
    elGallerySection.style.display = 'none';
    elBottomBadge.classList.remove('visible');
    
    // Configurar ticket
    elTicketOrderCode.textContent = appState.orderCode;
    elTicketName.textContent = name;
    elTicketCopies.textContent = `${appState.files.length} fotos / ${totalCopies} copias`;
    elTicketPrice.textContent = `${totalPrice.toFixed(2).replace('.', ',')} €`;
    
    // Generar código QR dinámico con la API de QRServer
    // Codificar información relevante para que el personal en mostrador la escanee
    const qrData = JSON.stringify({
        code: appState.orderCode,
        client: name,
        tel: phone,
        email: email,
        copies: totalCopies,
        total: totalPrice.toFixed(2) + '€',
        src: appState.source
    });
    
    elTicketQR.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrData)}`;
    
    // Configurar descargar PDF al hacer clic
    elBtnSavePdf.onclick = () => {
        saveTicketAsPdf();
    };
    
    // Configurar recibir ticket por email
    elBtnSendEmail.onclick = () => {
        sendTicketByEmail(name, email, phone, totalCopies, totalPrice);
    };
    
    elSuccessSection.style.display = 'block';
    
    // Scroll arriba para ver el éxito
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Genera un archivo PDF del ticket y lo descarga
function saveTicketAsPdf() {
    const originalElement = document.getElementById('print-ticket');
    
    // 1. Clonar el elemento del ticket
    const clonedElement = originalElement.cloneNode(true);
    
    // 2. Estilizar el clon para un renderizado perfecto
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '0';
    clonedElement.style.width = '380px'; // Ancho fijo óptimo para legibilidad uniforme
    clonedElement.style.boxShadow = 'none';
    clonedElement.style.border = '1px solid #cbd5e1';
    clonedElement.style.margin = '0';
    clonedElement.style.backgroundColor = '#ffffff';
    clonedElement.style.color = '#0f172a';
    
    // 3. Añadir al DOM
    document.body.appendChild(clonedElement);
    
    // Dar un breve tiempo para procesar en el DOM
    setTimeout(() => {
        const width = clonedElement.offsetWidth;
        const height = clonedElement.offsetHeight;
        
        const opt = {
            margin:       12, // Margen de seguridad en puntos
            filename:     `ticket-fotolar-${appState.orderCode}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { 
                scale: 2.5, // Alta resolución para lectura de textos y QR
                useCORS: true, 
                scrollY: 0, 
                scrollX: 0,
                logging: false
            },
            jsPDF:        { 
                unit: 'pt', 
                format: [width + 24, height + 24], // Encaje perfecto sin recortes
                orientation: 'portrait' 
            }
        };
        
        // Generar PDF
        html2pdf().set(opt).from(clonedElement).save().then(() => {
            // Eliminar clon
            document.body.removeChild(clonedElement);
        }).catch(err => {
            console.error("Error al generar PDF: ", err);
            if (document.body.contains(clonedElement)) {
                document.body.removeChild(clonedElement);
            }
        });
    }, 50);
}

// Abre el gestor de correo local con el ticket pre-rellenado para el cliente
function sendTicketByEmail(name, email, phone, totalCopies, totalPrice) {
    const subject = `Reserva de Impresión Fotolar - Código: ${appState.orderCode}`;
    
    const body = `==================================================
TICKET DE RESERVA - FOTOLAR CÓRDOBA
==================================================
Hola ${name},

Aquí tienes los detalles de tu reserva de impresión de fotos.

🏷️ Código de Reserva: ${appState.orderCode}
👤 Cliente: ${name}
📞 Teléfono: ${phone}
📧 Correo electrónico: ${email}
📥 Total Fotos / Copias: ${appState.files.length} fotos / ${totalCopies} copias
💰 Importe Total: ${totalPrice.toFixed(2).replace('.', ',')} €

--------------------------------------------------
¿Qué debes hacer ahora?
Muestra este código de reserva o el código QR de tu ticket
en el mostrador de nuestra tienda (Calle Lope de Hoces nº16, Córdoba).
El dependiente escaneará el código, recuperará tus fotos
de forma automática, las imprimirá y te las entregará.

¡Gracias por confiar en Fotolar!
==================================================`;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
}



// Reinicia la aplicación para hacer un nuevo pedido
function restartOrder() {
    // Revocar preview URLs para evitar fugas de memoria
    appState.files.forEach(item => {
        if (item.previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(item.previewUrl);
        }
    });
    
    appState.files = [];
    appState.orderCode = '';
    
    // Reset inputs
    elInputNotes.value = '';
    
    elSuccessSection.style.display = 'none';
    updateUI();
}


/* ==========================================================================
   Funciones Auxiliares de Carga (Loader UI)
   ========================================================================== */
function showLoader(title, desc, percent) {
    elLoaderTitle.textContent = title;
    elLoaderDesc.textContent = desc;
    elProgressBarFill.style.width = percent + '%';
    elProgressPercent.textContent = percent + '%';
    elLoaderOverlay.classList.add('active');
}

function updateLoaderProgress(percent, descText = null) {
    elProgressBarFill.style.width = percent + '%';
    elProgressPercent.textContent = percent + '%';
    
    if (descText) {
        elLoaderDesc.textContent = descText;
        const logItem = document.createElement('div');
        logItem.textContent = `[${new Date().toLocaleTimeString('es-ES')}] ${descText}`;
        elLoaderFilesList.appendChild(logItem);
        elLoaderFilesList.scrollTop = elLoaderFilesList.scrollHeight;
    }
}

function hideLoader() {
    elLoaderOverlay.classList.remove('active');
    // Limpiar logs del loader
    elLoaderFilesList.innerHTML = 'Iniciando compresión...';
}

// Iniciar aplicación
document.addEventListener('DOMContentLoaded', init);

// Descarga el archivo ZIP en el dispositivo utilizando FileSaver.js
function triggerZipDownload() {
    if (!appState.zipBlob) return;
    saveAs(appState.zipBlob, appState.zipName);
}

// Exponer funciones globales necesarias para eventos en línea
window.deletePhoto = deletePhoto;
window.updatePhotoSize = updatePhotoSize;
window.updatePhotoPaper = updatePhotoPaper;
window.updatePhotoQty = updatePhotoQty;
window.loadDemoPhotos = loadDemoPhotos;
window.triggerZipDownload = triggerZipDownload;
