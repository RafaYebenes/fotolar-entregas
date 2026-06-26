import { SIZE_PRICES, deleteFile, updateFileSize, updateFileQuantity } from '../state.js';

export function createPhotoCard(item) {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.setAttribute('data-id', item.id);
    
    const unitPrice = SIZE_PRICES[item.size] || 0.25;
    const price = unitPrice * item.quantity;
    
    card.innerHTML = `
        <div class="photo-preview-container">
            <img src="${item.previewUrl}" alt="${item.name}" class="photo-preview">
        </div>
        <div class="photo-config">
            <div class="photo-meta">
                <span class="photo-name" title="${item.name}">${item.name}</span>
                <button type="button" class="btn-delete-photo" title="Eliminar foto">×</button>
            </div>
            <div class="config-rows">
                <div class="select-wrapper">
                    <label>Tamaño</label>
                    <select class="select-input size-select">
                        <option value="9x13"  ${item.size === '9x13'  ? 'selected' : ''}>9x13 cm (0,28€)</option>
                        <option value="10x15" ${item.size === '10x15' ? 'selected' : ''}>10x15 cm (0,30€)</option>
                        <option value="13x18" ${item.size === '13x18' ? 'selected' : ''}>13x18 cm (0,80€)</option>
                        <option value="15x20" ${item.size === '15x20' ? 'selected' : ''}>15x20 cm (0,88€)</option>
                        <option value="20x20" ${item.size === '20x20' ? 'selected' : ''}>20x20 cm (1,50€)</option>
                        <option value="20x25" ${item.size === '20x25' ? 'selected' : ''}>20x25 cm (2,50€)</option>
                        <option value="20x30" ${item.size === '20x30' ? 'selected' : ''}>20x30 cm (3,00€)</option>
                        <option value="30x30" ${item.size === '30x30' ? 'selected' : ''}>30x30 cm (4,00€)</option>
                        <option value="30x40" ${item.size === '30x40' ? 'selected' : ''}>30x40 cm (4,99€)</option>
                    </select>
                </div>
            </div>
            <div class="quantity-section">
                <span class="item-price">${price.toFixed(2)} €</span>
                <div class="quantity-controls">
                    <button type="button" class="btn-qty btn-qty-minus">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button type="button" class="btn-qty btn-qty-plus">+</button>
                </div>
            </div>
        </div>
    `;

    // Asignación de event listeners de forma programática
    const btnDelete = card.querySelector('.btn-delete-photo');
    btnDelete.addEventListener('click', () => {
        deleteFile(item.id);
    });

    const selectSize = card.querySelector('.size-select');
    selectSize.addEventListener('change', (e) => {
        updateFileSize(item.id, e.target.value);
    });

    const btnMinus = card.querySelector('.btn-qty-minus');
    btnMinus.addEventListener('click', () => {
        updateFileQuantity(item.id, -1);
    });

    const btnPlus = card.querySelector('.btn-qty-plus');
    btnPlus.addEventListener('click', () => {
        updateFileQuantity(item.id, 1);
    });

    return card;
}
