import { subscribe } from '../state.js';
import { createPhotoCard } from './PhotoCard.js';

export function initPhotosGrid() {
    const elGallerySection = document.getElementById('gallery-section');
    const elPhotosGrid = document.getElementById('photos-grid');
    const elGalleryCount = document.getElementById('gallery-count');
    const elBtnAddMore = document.getElementById('btn-add-more');
    const elFileInput = document.getElementById('file-input');

    if (!elGallerySection || !elPhotosGrid || !elGalleryCount || !elBtnAddMore) return;

    // Conectar el botón "Añadir más" al input de ficheros
    elBtnAddMore.addEventListener('click', () => {
        if (elFileInput) {
            elFileInput.click();
        }
    });

    // Suscribirse a cambios en el estado para repintar la cuadrícula
    subscribe((state) => {
        const hasFiles = state.files.length > 0;
        const hasCompletedOrder = state.orderCode !== '';

        // Si tenemos fotos y NO se ha completado el pedido, mostramos la galería
        if (hasFiles && !hasCompletedOrder) {
            elGallerySection.style.display = 'block';
            elGalleryCount.textContent = state.files.length;
            
            // Vaciar grid y renderizar componentes PhotoCard
            elPhotosGrid.innerHTML = '';
            state.files.forEach(item => {
                const card = createPhotoCard(item);
                elPhotosGrid.appendChild(card);
            });
        } else {
            elGallerySection.style.display = 'none';
            elPhotosGrid.innerHTML = '';
        }
    });
}
