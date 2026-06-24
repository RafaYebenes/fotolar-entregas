import { addFiles, subscribe } from '../state.js';
import { generateDemoFiles } from '../utils/sampleGenerator.js';
import { showLoader, updateLoaderProgress, hideLoader } from './LoaderOverlay.js';

export function initUploadZone() {
    const elWelcomeSection = document.getElementById('welcome-section');
    const elDropZone = document.getElementById('drop-zone');
    const elFileInput = document.getElementById('file-input');
    const elBtnBrowse = document.getElementById('btn-browse');
    const elBtnDemo = document.getElementById('btn-demo');

    if (!elWelcomeSection || !elDropZone || !elFileInput || !elBtnBrowse || !elBtnDemo) return;

    // Abrir selector de archivos al pulsar botones
    elBtnBrowse.addEventListener('click', () => elFileInput.click());
    
    elFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            addFiles(e.target.files);
            // Reset del input para permitir subir el mismo archivo después
            elFileInput.value = '';
        }
    });

    // Drag & Drop listeners
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
            addFiles(e.dataTransfer.files);
        }
    });

    // Demo Mode Trigger
    elBtnDemo.addEventListener('click', () => {
        showLoader("Generando fotos de muestra...", "Creando imágenes optimizadas...", 30);
        
        generateDemoFiles(
            (percent, statusText) => {
                updateLoaderProgress(percent, statusText);
            },
            (generatedFiles) => {
                setTimeout(() => {
                    hideLoader();
                    // Añadimos los ficheros creados al estado con sus configuraciones
                    addFiles(generatedFiles);
                }, 400);
            }
        );
    });

    // Suscribirse a cambios en el estado para mostrar/ocultar esta sección
    subscribe((state) => {
        // Si hay fotos cargadas o si el pedido ha tenido éxito (ticket), ocultar bienvenida
        const hasFiles = state.files.length > 0;
        const hasCompletedOrder = state.orderCode !== '';

        if (hasFiles || hasCompletedOrder) {
            elWelcomeSection.style.display = 'none';
        } else {
            elWelcomeSection.style.display = 'block';
        }
    });
}
