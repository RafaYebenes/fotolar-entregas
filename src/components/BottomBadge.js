import { subscribe, getTotals } from '../state.js';
import { openOrderFormModal } from './OrderFormModal.js';

export function initBottomBadge() {
    const elBottomBadge = document.getElementById('bottom-badge');
    const elBadgeTotalCount = document.getElementById('badge-total-count');
    const elBadgeTotalPrice = document.getElementById('badge-total-price');
    const elBtnConfirm = document.getElementById('btn-confirm');

    if (!elBottomBadge || !elBadgeTotalCount || !elBadgeTotalPrice || !elBtnConfirm) return;

    // Acción al confirmar pedido
    elBtnConfirm.addEventListener('click', () => {
        openOrderFormModal();
    });

    // Suscribirse a cambios en el estado para actualizar totales y visibilidad
    subscribe((state) => {
        const hasFiles = state.files.length > 0;
        const hasCompletedOrder = state.orderCode !== '';

        if (hasFiles && !hasCompletedOrder) {
            elBottomBadge.classList.add('visible');
            
            // Obtener y pintar totales actualizados
            const { totalPhotos, totalCopies, totalPrice } = getTotals();
            elBadgeTotalCount.textContent = `${totalPhotos} fotos - ${totalCopies} copias`;
            elBadgeTotalPrice.textContent = `${totalPrice.toFixed(2).replace('.', ',')} €`;
            
            // Animación de pulso
            if (totalCopies > 0) {
                elBtnConfirm.classList.add('pulse');
            } else {
                elBtnConfirm.classList.remove('pulse');
            }
        } else {
            elBottomBadge.classList.remove('visible');
        }
    });
}
