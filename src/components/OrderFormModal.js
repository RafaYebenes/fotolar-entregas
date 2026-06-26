import { getState, setClientInfo, setOrderDetails, SIZE_LABELS, SIZE_PRICES } from '../state.js';
import { showLoader, updateLoaderProgress, hideLoader } from './LoaderOverlay.js';

let elContactModal = null;
let elBtnCloseModal = null;
let elOrderForm = null;
let elInputName = null;
let elInputPhone = null;
let elSummaryItemsList = null;
let elSummaryTotalPrice = null;

export function initOrderFormModal() {
    elContactModal = document.getElementById('contact-modal');
    elBtnCloseModal = document.getElementById('btn-close-modal');
    elOrderForm = document.getElementById('order-form');
    elInputName = document.getElementById('input-name');
    elInputPhone = document.getElementById('input-phone');
    elSummaryItemsList = document.getElementById('summary-items-list');
    elSummaryTotalPrice = document.getElementById('summary-total-price');

    if (!elContactModal || !elBtnCloseModal || !elOrderForm) return;

    elBtnCloseModal.addEventListener('click', closeOrderFormModal);
    elContactModal.addEventListener('click', (e) => {
        if (e.target === elContactModal) closeOrderFormModal();
    });

    elOrderForm.addEventListener('submit', handleOrderSubmit);
}

export function openOrderFormModal() {
    const state = getState();
    if (state.files.length === 0) return;

    const sizeGroups = {};
    let totalPrice = 0;

    state.files.forEach(item => {
        if (!sizeGroups[item.size]) sizeGroups[item.size] = { count: 0, price: 0 };
        sizeGroups[item.size].count += item.quantity;
        const unitPrice = SIZE_PRICES[item.size] || 0.30;
        const itemPrice = unitPrice * item.quantity;
        sizeGroups[item.size].price += itemPrice;
        totalPrice += itemPrice;
    });

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
    if (elContactModal) elContactModal.classList.remove('active');
}

async function handleOrderSubmit(e) {
    e.preventDefault();

    const clientName = elInputName.value.trim();
    const clientPhone = elInputPhone.value.trim();

    if (!clientName) { elInputName.focus(); return; }
    if (!clientPhone) { elInputPhone.focus(); return; }

    const state = getState();
    if (state.files.length === 0) return;

    setClientInfo({ name: clientName, phone: clientPhone });
    closeOrderFormModal();

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `FL-${randomNum}`;

    showLoader('Enviando fotos...', 'Preparando archivos para enviar por WhatsApp...', 5);

    // Construir FormData con todos los archivos
    const formData = new FormData();
    formData.append('orderCode', orderCode);
    formData.append('nota', `Pedido ${orderCode} — ${clientName} — Tel: ${clientPhone}`);
    for (const item of state.files) {
        for (let i = 0; i < item.quantity; i++) {
            formData.append('files', item.file, item.name);
        }
    }

    updateLoaderProgress(20, 'Subiendo fotos al servidor...');

    let data;
    try {
        const res = await fetch('/api/entregas/whatsapp', {
            method: 'POST',
            body: formData
        });
        try {
            data = await res.json();
        } catch {
            throw new Error('Respuesta inesperada del servidor');
        }
    } catch (err) {
        console.error('[WA] Error de red:', err);
        hideLoader();
        showLoader('Error de conexión', 'No se pudo contactar con el servidor. Comprueba que está activo.', 0);
        setTimeout(hideLoader, 4000);
        return;
    }

    if (!data.ok) {
        hideLoader();
        const mensaje = data.error === 'WA_SESSION_UNAVAILABLE'
            ? 'WhatsApp no está conectado. Contacta con el administrador.'
            : data.mensaje || 'Error al enviar. Inténtalo de nuevo.';
        showLoader('Error al enviar', mensaje, 0);
        setTimeout(hideLoader, 4000);
        return;
    }

    // Éxito
    const partes = data.partes > 1 ? ` (${data.partes} partes)` : '';
    updateLoaderProgress(100, `¡Fotos enviadas por WhatsApp${partes}!`);

    setTimeout(() => {
        hideLoader();
        setOrderDetails({
            orderCode,
            zipBlob: null,
            zipName: `fotolar-pedido-${orderCode}.zip`
        });
    }, 800);
}
