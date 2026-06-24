import { subscribe, restartOrder, getTotals } from '../state.js';

export function initSuccessScreen() {
    const elSuccessSection = document.getElementById('success-section');
    const elTicketOrderCode = document.getElementById('ticket-order-code');
    const elTicketQR = document.getElementById('ticket-qr');
    const elTicketName = document.getElementById('ticket-name');
    const elTicketCopies = document.getElementById('ticket-copies');
    const elTicketPrice = document.getElementById('ticket-price');
    const elBtnSavePdf = document.getElementById('btn-save-pdf');
    const elBtnSendEmail = document.getElementById('btn-send-email');
    const elBtnRestart = document.getElementById('btn-restart');

    if (!elSuccessSection || !elTicketOrderCode || !elTicketQR || !elTicketName || 
        !elTicketCopies || !elTicketPrice || !elBtnSavePdf || !elBtnSendEmail || !elBtnRestart) {
        return;
    }

    // Configurar event listeners
    elBtnRestart.addEventListener('click', () => {
        restartOrder();
    });

    // Suscribirse a cambios en el estado
    subscribe((state) => {
        const hasCompletedOrder = state.orderCode !== '';

        if (hasCompletedOrder) {
            const { totalPhotos, totalCopies, totalPrice } = getTotals();
            
            // Configurar textos en el ticket
            elTicketOrderCode.textContent = state.orderCode;
            elTicketName.textContent = state.client.name;
            elTicketCopies.textContent = `${totalPhotos} fotos / ${totalCopies} copias`;
            elTicketPrice.textContent = `${totalPrice.toFixed(2).replace('.', ',')} €`;

            // Generar código QR dinámico
            const qrData = JSON.stringify({
                code: state.orderCode,
                client: state.client.name,
                tel: state.client.phone,
                email: state.client.email,
                copies: totalCopies,
                total: totalPrice.toFixed(2) + '€',
                src: state.source
            });
            elTicketQR.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrData)}`;

            // PDF Download
            elBtnSavePdf.onclick = () => {
                saveTicketAsPdf(state.orderCode);
            };

            // Email dispatch
            elBtnSendEmail.onclick = () => {
                sendTicketByEmail(
                    state.client.name,
                    state.client.email,
                    state.client.phone,
                    totalPhotos,
                    totalCopies,
                    totalPrice,
                    state.orderCode
                );
            };

            // Mostrar sección de éxito
            elSuccessSection.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            elSuccessSection.style.display = 'none';
        }
    });
}

function saveTicketAsPdf(orderCode) {
    const originalElement = document.getElementById('print-ticket');
    if (!originalElement) return;

    const html2pdf = window.html2pdf;
    if (!html2pdf) {
        alert("La librería html2pdf no está disponible.");
        return;
    }

    // 1. Guardar la posición de desplazamiento actual y hacer scroll a 0
    const currentScrollY = window.scrollY;
    window.scrollTo(0, 0);

    // 2. Clonar el elemento del ticket
    const clonedElement = originalElement.cloneNode(true);
    
    // 3. Estilizar el clon para un renderizado perfecto con colores estáticos (evitar variables CSS en html2canvas)
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '0';
    clonedElement.style.top = '0';
    clonedElement.style.zIndex = '-9999';
    clonedElement.style.width = '380px'; // Ancho fijo óptimo para legibilidad uniforme
    clonedElement.style.boxShadow = 'none';
    clonedElement.style.border = '1px solid #cbd5e1';
    clonedElement.style.margin = '0';
    clonedElement.style.backgroundColor = '#ffffff';
    clonedElement.style.color = '#0f172a';

    // 4. Añadir al DOM en la zona activa (pero oculta detrás de la app)
    document.body.appendChild(clonedElement);
    
    // Dar un breve tiempo para procesar en el DOM
    setTimeout(() => {
        const width = clonedElement.offsetWidth || 380;
        const height = clonedElement.offsetHeight || 600;
        
        const opt = {
            margin:       12, // Margen de seguridad en puntos
            filename:     `ticket-fotolar-${orderCode}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { 
                scale: 2.5, // Alta resolución para lectura de textos y QR
                useCORS: true, 
                scrollY: 0, 
                scrollX: 0,
                logging: false
            },
            jsPDF:        { 
                unit: 'pt', 
                format: [width + 24, height + 24], // Encaje perfecto sin recortes
                orientation: 'portrait' 
            }
        };
        
        // Generar PDF y restaurar el estado original al finalizar
        html2pdf().set(opt).from(clonedElement).save().then(() => {
            // Limpieza
            document.body.removeChild(clonedElement);
            window.scrollTo(0, currentScrollY);
        }).catch(err => {
            console.error("Error al generar PDF: ", err);
            if (document.body.contains(clonedElement)) {
                document.body.removeChild(clonedElement);
            }
            window.scrollTo(0, currentScrollY);
        });
    }, 100);
}



function sendTicketByEmail(name, email, phone, totalPhotos, totalCopies, totalPrice, orderCode) {
    const subject = `Reserva de Impresión Fotolar - Código: ${orderCode}`;
    
    const body = `==================================================
TICKET DE RESERVA - FOTOLAR CÓRDOBA
==================================================
Hola ${name},

Aquí tienes los detalles de tu reserva de impresión de fotos.

🏷️ Código de Reserva: ${orderCode}
👤 Cliente: ${name}
📞 Teléfono: ${phone}
📧 Correo electrónico: ${email}
📥 Total Fotos / Copias: ${totalPhotos} fotos / ${totalCopies} copias
💰 Importe Total: ${totalPrice.toFixed(2).replace('.', ',')} €

--------------------------------------------------
¿Qué debes hacer ahora?
Muestra este código de reserva o el código QR de tu ticket
en el mostrador de nuestra tienda (Calle Lope de Hoces nº16, Córdoba).
El dependiente escaneará el código, recuperará tus fotos
de forma automática, las imprimirá y te las entregará.

¡Gracias por confiar en Fotolar!
==================================================`;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
}
