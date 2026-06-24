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

// Genera archivos de fotos de muestra usando Canvas
export function generateDemoFiles(onProgress, onComplete) {
    const samples = [
        { name: 'fotolar_boda_ejemplo.jpg', text: 'Enlace Boda', color1: '#fda4af', color2: '#f43f5e' },
        { name: 'fotolar_comunion_ejemplo.jpg', text: 'Comunión María', color1: '#bfdbfe', color2: '#3b82f6' },
        { name: 'fotolar_paisaje_ejemplo.jpg', text: 'Atardecer Córdoba', color1: '#fed7aa', color2: '#ea580c' }
    ];

    let loadedCount = 0;
    const generatedFiles = [];
    
    samples.forEach((sample, index) => {
        setTimeout(() => {
            createSampleImageFile(sample.name, sample.text, sample.color1, sample.color2, (file) => {
                generatedFiles.push({
                    file: file,
                    name: sample.name,
                    size: '10x15',
                    quantity: 1 + index, // Variar cantidades para test
                    paper: index === 1 ? 'mate' : 'brillo'
                });
                
                loadedCount++;
                
                // Actualizar progreso
                const percent = Math.round((loadedCount / samples.length) * 100);
                if (onProgress) {
                    onProgress(percent, `Creada ${sample.name}`);
                }
                
                if (loadedCount === samples.length) {
                    if (onComplete) {
                        onComplete(generatedFiles);
                    }
                }
            });
        }, index * 200);
    });
}
