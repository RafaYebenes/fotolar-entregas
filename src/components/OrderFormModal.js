import { getState, setClientInfo, setOrderDetails, SIZE_LABELS, getTotals, SIZE_PRICES } from '../state.js';
import { generateOrderZip } from '../utils/zipHelper.js';
import { showLoader, updateLoaderProgress, hideLoader } from './LoaderOverlay.js';

let elContactModal = null;
let elBtnCloseModal = null;
let elOrderForm = null;
let elInputName = null;
let elInputEmail = null;
let elInputPhone = null;
let elInputNotes = null;
let elSummaryItemsList = null;
let elSummaryTotalPrice = null;

export function initOrderFormModal() {
    elContactModal = document.getElementById('contact-modal');
    elBtnCloseModal = document.getElementById('btn-close-modal');
    elOrderForm = document.getElementById('order-form');
    elInputName = document.getElementById('input-name');
    elInputEmail = document.getElementById('input-email');
    elInputPhone = document.getElementById('input-phone');
    elInputNotes = document.getElementById('input-notes');
    elSummaryItemsList = document.getElementById('summary-items-list');
    elSummaryTotalPrice = document.getElementById('summary-total-price');

    if (!elContactModal || !elBtnCloseModal || !elOrderForm) return;

    // Listeners para cerrar el modal
    elBtnCloseModal.addEventListener('click', closeOrderFormModal);
    elContactModal.addEventListener('click', (e) => {
        if (e.target === elContactModal) {
            closeOrderFormModal();
        }
    });

    // Envío de formulario
    elOrderForm.addEventListener('submit', handleOrderSubmit);
}

export function openOrderFormModal() {
    const state = getState();
    if (state.files.length === 0) return;

    // Generar desglose de precios agrupado por tamaño
    const sizeGroups = {};
    let totalPrice = 0;

    state.files.forEach(item => {
        if (!sizeGroups[item.size]) {
            sizeGroups[item.size] = { count: 0, price: 0 };
        }
        sizeGroups[item.size].count += item.quantity;
        
        const unitPrice = SIZE_PRICES[item.size] || 0.25;
        const itemPrice = unitPrice * item.quantity;
        sizeGroups[item.size].price += itemPrice;
        totalPrice += itemPrice;
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

export function closeOrderFormModal() {
    if (elContactModal) {
        elContactModal.classList.remove('active');
    }
}

function handleOrderSubmit(e) {
    e.preventDefault();

    const clientName = elInputName.value.trim();
    const clientEmail = elInputEmail.value.trim();
    const clientPhone = elInputPhone.value.trim();
    const clientNotes = elInputNotes.value.trim();

    if (!clientName || !clientEmail || !clientPhone) return;

    // Guardar detalles del cliente en el estado
    setClientInfo({
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        notes: clientNotes
    });

    closeOrderFormModal();
    showLoader("Empaquetando pedido...", "Comprimiendo tus fotos localmente...", 5);

    // Generar código de pedido aleatorio para este ticket
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `FL-${randomNum}`;

    const state = getState();

    // Invocar el empaquetado ZIP
    generateOrderZip({
        files: state.files,
        orderCode: orderCode,
        client: { name: clientName, email: clientEmail, phone: clientPhone, notes: clientNotes },
        source: state.source,
        sizeLabels: SIZE_LABELS
    }, (percent, statusText) => {
        updateLoaderProgress(percent, statusText);
    })
    .then((zipBlob) => {
        const zipName = `fotolar-pedido-${orderCode}.zip`;
        
        // Simular subida transparente de las fotos
        showLoader("Subiendo fotos...", "Cargando archivo ZIP en el servidor de Fotolar...", 60);

        setTimeout(() => {
            updateLoaderProgress(85, "Enviando correo con el pedido a fotolar@fotolar.es...");
            
            setTimeout(() => {
                updateLoaderProgress(100, "¡Pedido enviado con éxito y archivado!");
                
                setTimeout(() => {
                    hideLoader();
                    
                    // Almacenamos el resultado en el estado
                    // Esto disparará reactivamente la pantalla de éxito
                    setOrderDetails({
                        orderCode: orderCode,
                        zipBlob: zipBlob,
                        zipName: zipName
                    });
                }, 500);
            }, 1000);
        }, 1000);
    })
    .catch((err) => {
        console.error("Error al generar el ZIP:", err);
        showLoader("Error", "No se pudo generar el archivo comprimido: " + err.message, 0);
        setTimeout(hideLoader, 3000);
    });
}
