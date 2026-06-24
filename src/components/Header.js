import { subscribe } from '../state.js';

export function initHeader() {
    const elConnBadge = document.getElementById('conn-badge');
    const elConnSource = document.getElementById('conn-source');

    if (!elConnBadge || !elConnSource) return;

    // Suscribirse a cambios en el estado para actualizar el badge de conexión
    subscribe((state) => {
        let sourceText = '';
        
        if (state.kiosk) {
            sourceText = 'Mostrador ' + state.kiosk;
        } else if (state.source) {
            sourceText = state.source;
        }

        if (sourceText && state.files.length === 0 && state.orderCode === '') {
            // El badge de conexión suele mostrarse al inicio si hay origen detectado
            elConnSource.textContent = sourceText;
            elConnBadge.style.display = 'flex';
        } else if (sourceText) {
            // Seguir mostrando si hay origen y está en la galería
            elConnSource.textContent = sourceText;
            elConnBadge.style.display = 'flex';
        } else {
            elConnBadge.style.display = 'none';
        }
    });
}
