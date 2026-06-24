export function generateOrderZip({ files, orderCode, client, source, sizeLabels }, onProgress) {
    return new Promise((resolve, reject) => {
        const JSZip = window.JSZip;
        if (!JSZip) {
            reject(new Error("JSZip library not loaded"));
            return;
        }
        
        const zip = new JSZip();
        
        // Crear archivo info.txt con el detalle del pedido
        let infoTxt = `==================================================
PEDIDO DE IMPRESIÓN - FOTOLAR CÓRDOBA
==================================================
Código de Pedido: ${orderCode}
Fecha: ${new Date().toLocaleString('es-ES')}
Origen Acceso: ${source}
--------------------------------------------------
DATOS DEL CLIENTE:
Nombre: ${client.name}
Teléfono/WhatsApp: ${client.phone}
Notas Adicionales: ${client.notes || 'Ninguna'}

--------------------------------------------------
DESGLOSE DE IMPRESIÓN POR ARCHIVO:
`;

        let totalCopies = 0;
        
        // Agrupar promesas para añadir cada fichero al ZIP
        const filePromises = files.map((item, index) => {
            totalCopies += item.quantity;
            
            // Generar nombre descriptivo para el archivo dentro del ZIP que incluya la configuración
            const cleanName = item.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\.-]/g, '');
            const zipFileName = `${(index+1).toString().padStart(2, '0')}_[${item.size}]_[${item.paper}]_[x${item.quantity}]_${cleanName}`;
            
            infoTxt += `
[Foto ${index+1}]
Archivo original: ${item.name}
Archivo en ZIP: ${zipFileName}
Tamaño: ${sizeLabels[item.size] || item.size}
Cantidad: ${item.quantity} copias
Acabado Papel: ${item.paper.toUpperCase()}
`;
            
            // Retornar promesa para leer el archivo e insertarlo en el ZIP
            return new Promise((resolveFile, rejectFile) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    zip.file(zipFileName, e.target.result);
                    resolveFile();
                };
                reader.onerror = function(err) {
                    rejectFile(err);
                };
                reader.readAsArrayBuffer(item.file);
            });
        });

        // Resolver todas las lecturas de ficheros y generar el ZIP
        Promise.all(filePromises).then(() => {
            // Añadir el archivo de metadatos info.txt
            infoTxt += `
--------------------------------------------------
RESUMEN GLOBAL:
Total fotos diferentes: ${files.length}
Total copias a imprimir: ${totalCopies}

Gracias por confiar en Fotolar Córdoba.
Muestra el código QR del ticket en el mostrador para proceder.
==================================================`;

            zip.file("info_pedido.txt", infoTxt);
            
            if (onProgress) {
                onProgress(40, "Generando archivo ZIP de envío...");
            }
            
            // Generar el archivo Blob ZIP de forma asíncrona especificando el MIME type correcto
            zip.generateAsync({ type: "blob", mimeType: "application/zip" }, function updateCallback(metadata) {
                const basePercent = 40;
                const zipPercent = Math.round(metadata.percent * 0.6); // Escalar al 60% restante
                const totalPercent = basePercent + zipPercent;
                
                let statusText = "Comprimiendo archivos...";
                if (totalPercent > 90) statusText = "Finalizando compresión de imágenes...";
                
                if (onProgress) {
                    onProgress(totalPercent, statusText);
                }
            }).then(function(content) {
                resolve(content);
            }).catch(err => {
                reject(err);
            });
        }).catch(err => {
            reject(err);
        });
    });
}
