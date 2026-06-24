import { setConnectionInfo, notify } from './state.js';
import { initHeader } from './components/Header.js';
import { initLoaderOverlay } from './components/LoaderOverlay.js';
import { initUploadZone } from './components/UploadZone.js';
import { initPhotosGrid } from './components/PhotosGrid.js';
import { initBottomBadge } from './components/BottomBadge.js';
import { initOrderFormModal } from './components/OrderFormModal.js';
import { initSuccessScreen } from './components/SuccessScreen.js';

function init() {
    // Inicializar todos los componentes de la interfaz
    initHeader();
    initLoaderOverlay();
    initUploadZone();
    initPhotosGrid();
    initBottomBadge();
    initOrderFormModal();
    initSuccessScreen();

    // Detección de parámetros URL (QR / NFC / Mostrador)
    const params = new URLSearchParams(window.location.search);
    let sourceText = '';
    let kioskVal = '';

    if (params.has('nfc')) {
        sourceText = 'NFC ';
    }

    if (params.has('kiosk')) {
        kioskVal = params.get('kiosk');
        sourceText += 'Mostrador ' + kioskVal;
    } else if (params.has('mesa')) {
        sourceText += 'Mesa ' + params.get('mesa');
    } else if (params.has('source')) {
        sourceText += params.get('source');
    }

    if (sourceText) {
        setConnectionInfo({ source: sourceText, kiosk: kioskVal });
    } else {
        // Disparar renderizado inicial para que los suscriptores se coordinen
        notify();
    }
}

// Iniciar aplicación al estar listo el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
