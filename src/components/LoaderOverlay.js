let elLoaderOverlay = null;
let elLoaderTitle = null;
let elLoaderDesc = null;
let elProgressBarFill = null;
let elProgressPercent = null;
let elLoaderFilesList = null;

export function initLoaderOverlay() {
    elLoaderOverlay = document.getElementById('loader-overlay');
    elLoaderTitle = document.getElementById('loader-title');
    elLoaderDesc = document.getElementById('loader-desc');
    elProgressBarFill = document.getElementById('progress-bar-fill');
    elProgressPercent = document.getElementById('progress-percent');
    elLoaderFilesList = document.getElementById('loader-files-list');
}

export function showLoader(title, desc, percent) {
    if (!elLoaderOverlay) return;
    elLoaderTitle.textContent = title;
    elLoaderDesc.textContent = desc;
    elProgressBarFill.style.width = percent + '%';
    elProgressPercent.textContent = percent + '%';
    elLoaderOverlay.classList.add('active');
}

export function updateLoaderProgress(percent, descText = null) {
    if (!elLoaderOverlay) return;
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

export function hideLoader() {
    if (!elLoaderOverlay) return;
    elLoaderOverlay.classList.remove('active');
    // Limpiar logs del loader
    elLoaderFilesList.innerHTML = 'Iniciando compresión...';
}
