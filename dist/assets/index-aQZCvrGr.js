(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const l of r)if(l.type==="childList")for(const i of l.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function n(r){const l={};return r.integrity&&(l.integrity=r.integrity),r.referrerPolicy&&(l.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?l.credentials="include":r.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function o(r){if(r.ep)return;r.ep=!0;const l=n(r);fetch(r.href,l)}})();const q={"10x15":.25,"13x18":.35,"15x20":.45,"20x30":.95},_={"10x15":"10x15 cm","13x18":"13x18 cm","15x20":"15x20 cm","20x30":"20x30 cm"},D={files:[],orderCode:"",source:"QR Entrada",kiosk:"",zipBlob:null,zipName:"",client:{name:"",email:"",phone:"",notes:""}};let d={...D,files:[],client:{...D.client}};const w=new Set;function v(e){return w.add(e),()=>w.delete(e)}function p(){w.forEach(e=>e({...d}))}function G(){return{...d}}function $(e){let t=0;for(let n=0;n<e.length;n++){const o=e[n];let r,l="10x15",i=1,a="brillo";if(o instanceof File)r=o;else if(o&&o.file instanceof File)r=o.file,o.size&&(l=o.size),o.quantity&&(i=o.quantity),o.paper&&(a=o.paper);else continue;if(!r.type.startsWith("image/"))continue;const c=Date.now()+"-"+Math.random().toString(36).substr(2,9),s=URL.createObjectURL(r);d.files.push({id:c,file:r,previewUrl:s,name:r.name,size:l,quantity:i,paper:a}),t++}t>0&&p()}function X(e){const t=d.files.find(n=>n.id===e);t&&t.previewUrl.startsWith("blob:")&&URL.revokeObjectURL(t.previewUrl),d.files=d.files.filter(n=>n.id!==e),p()}function Y(e,t){const n=d.files.find(o=>o.id===e);n&&(n.size=t,p())}function ee(e,t){const n=d.files.find(o=>o.id===e);n&&(n.paper=t,p())}function U(e,t){const n=d.files.find(o=>o.id===e);if(n){const o=n.quantity+t;o>=1&&o<=99&&(n.quantity=o,p())}}function te({source:e,kiosk:t}){e&&(d.source=e),t&&(d.kiosk=t),p()}function oe(e){d.client={...d.client,...e},p()}function ne({orderCode:e,zipBlob:t,zipName:n}){d.orderCode=e,d.zipBlob=t,d.zipName=n,p()}function ie(){d.files.forEach(e=>{e.previewUrl.startsWith("blob:")&&URL.revokeObjectURL(e.previewUrl)}),d.files=[],d.orderCode="",d.zipBlob=null,d.zipName="",d.client={name:"",email:"",phone:"",notes:""},p()}function Z(){let e=d.files.length,t=0,n=0;return d.files.forEach(o=>{t+=o.quantity;const r=q[o.size]||.25;n+=r*o.quantity}),{totalPhotos:e,totalCopies:t,totalPrice:n}}function le(){const e=document.getElementById("conn-badge"),t=document.getElementById("conn-source");!e||!t||v(n=>{let o="";n.kiosk?o="Mostrador "+n.kiosk:n.source&&(o=n.source),o&&n.files.length===0&&n.orderCode===""||o?(t.textContent=o,e.style.display="flex"):e.style.display="none"})}let g=null,H=null,M=null,R=null,N=null,b=null;function re(){g=document.getElementById("loader-overlay"),H=document.getElementById("loader-title"),M=document.getElementById("loader-desc"),R=document.getElementById("progress-bar-fill"),N=document.getElementById("progress-percent"),b=document.getElementById("loader-files-list")}function L(e,t,n){g&&(H.textContent=e,M.textContent=t,R.style.width=n+"%",N.textContent=n+"%",g.classList.add("active"))}function x(e,t=null){if(g&&(R.style.width=e+"%",N.textContent=e+"%",t)){M.textContent=t;const n=document.createElement("div");n.textContent=`[${new Date().toLocaleTimeString("es-ES")}] ${t}`,b.appendChild(n),b.scrollTop=b.scrollHeight}}function z(){g&&(g.classList.remove("active"),b.innerHTML="Iniciando compresión...")}function se(e,t,n,o,r){const l=document.createElement("canvas");l.width=800,l.height=600;const i=l.getContext("2d"),a=i.createLinearGradient(0,0,800,600);a.addColorStop(0,n),a.addColorStop(1,o),i.fillStyle=a,i.fillRect(0,0,800,600),i.strokeStyle="rgba(255, 255, 255, 0.15)",i.lineWidth=2,i.beginPath(),i.arc(400,300,200,0,Math.PI*2),i.stroke(),i.beginPath(),i.arc(400,300,100,0,Math.PI*2),i.stroke(),i.fillStyle="rgba(255, 255, 255, 0.8)",i.beginPath(),i.roundRect(320,250,160,100,12),i.fill(),i.fillStyle=o,i.beginPath(),i.arc(400,300,35,0,Math.PI*2),i.fill(),i.fillStyle="rgba(255, 255, 255, 0.9)",i.beginPath(),i.arc(385,285,10,0,Math.PI*2),i.fill(),i.fillStyle="rgba(255, 255, 255, 0.8)",i.beginPath(),i.roundRect(340,235,40,15,4),i.fill(),i.fillStyle="#ffffff",i.textAlign="center",i.shadowColor="rgba(0, 0, 0, 0.2)",i.shadowBlur=8,i.font="bold 36px Georgia, serif",i.fillText("Fotolar Córdoba",400,120),i.font="500 24px -apple-system, sans-serif",i.fillText(t,400,480),i.font="300 16px -apple-system, sans-serif",i.fillText("Imagen de Prueba para Impresión",400,515),l.toBlob(c=>{const s=new File([c],e,{type:"image/jpeg"});r(s)},"image/jpeg",.85)}function ae(e,t){const n=[{name:"fotolar_boda_ejemplo.jpg",text:"Enlace Boda",color1:"#fda4af",color2:"#f43f5e"},{name:"fotolar_comunion_ejemplo.jpg",text:"Comunión María",color1:"#bfdbfe",color2:"#3b82f6"},{name:"fotolar_paisaje_ejemplo.jpg",text:"Atardecer Córdoba",color1:"#fed7aa",color2:"#ea580c"}];let o=0;const r=[];n.forEach((l,i)=>{setTimeout(()=>{se(l.name,l.text,l.color1,l.color2,a=>{r.push({file:a,name:l.name,size:"10x15",quantity:1+i,paper:i===1?"mate":"brillo"}),o++;const c=Math.round(o/n.length*100);e&&e(c,`Creada ${l.name}`),o===n.length&&t&&t(r)})},i*200)})}function ce(){const e=document.getElementById("welcome-section"),t=document.getElementById("drop-zone"),n=document.getElementById("file-input"),o=document.getElementById("btn-browse"),r=document.getElementById("btn-demo");!e||!t||!n||!o||!r||(o.addEventListener("click",()=>n.click()),n.addEventListener("change",l=>{l.target.files.length>0&&($(l.target.files),n.value="")}),t.addEventListener("dragover",l=>{l.preventDefault(),t.classList.add("dragover")}),t.addEventListener("dragleave",()=>{t.classList.remove("dragover")}),t.addEventListener("drop",l=>{l.preventDefault(),t.classList.remove("dragover"),l.dataTransfer.files.length>0&&$(l.dataTransfer.files)}),r.addEventListener("click",()=>{L("Generando fotos de muestra...","Creando imágenes optimizadas...",30),ae((l,i)=>{x(l,i)},l=>{setTimeout(()=>{z(),$(l)},400)})}),v(l=>{const i=l.files.length>0,a=l.orderCode!=="";i||a?e.style.display="none":e.style.display="block"}))}function de(e){const t=document.createElement("div");t.className="photo-card",t.setAttribute("data-id",e.id);const o=(q[e.size]||.25)*e.quantity;return t.innerHTML=`
        <div class="photo-preview-container">
            <img src="${e.previewUrl}" alt="${e.name}" class="photo-preview">
        </div>
        <div class="photo-config">
            <div class="photo-meta">
                <span class="photo-name" title="${e.name}">${e.name}</span>
                <button type="button" class="btn-delete-photo" title="Eliminar foto">×</button>
            </div>
            <div class="config-rows">
                <div class="select-wrapper">
                    <label>Tamaño</label>
                    <select class="select-input size-select">
                        <option value="10x15" ${e.size==="10x15"?"selected":""}>10x15 cm (0.25€)</option>
                        <option value="13x18" ${e.size==="13x18"?"selected":""}>13x18 cm (0.35€)</option>
                        <option value="15x20" ${e.size==="15x20"?"selected":""}>15x20 cm (0.45€)</option>
                        <option value="20x30" ${e.size==="20x30"?"selected":""}>20x30 cm (0.95€)</option>
                    </select>
                </div>
                <div class="select-wrapper">
                    <label>Papel</label>
                    <select class="select-input paper-select">
                        <option value="brillo" ${e.paper==="brillo"?"selected":""}>Brillo</option>
                        <option value="mate" ${e.paper==="mate"?"selected":""}>Mate</option>
                    </select>
                </div>
            </div>
            <div class="quantity-section">
                <span class="item-price">${o.toFixed(2)} €</span>
                <div class="quantity-controls">
                    <button type="button" class="btn-qty btn-qty-minus">-</button>
                    <span class="qty-val">${e.quantity}</span>
                    <button type="button" class="btn-qty btn-qty-plus">+</button>
                </div>
            </div>
        </div>
    `,t.querySelector(".btn-delete-photo").addEventListener("click",()=>{X(e.id)}),t.querySelector(".size-select").addEventListener("change",s=>{Y(e.id,s.target.value)}),t.querySelector(".paper-select").addEventListener("change",s=>{ee(e.id,s.target.value)}),t.querySelector(".btn-qty-minus").addEventListener("click",()=>{U(e.id,-1)}),t.querySelector(".btn-qty-plus").addEventListener("click",()=>{U(e.id,1)}),t}function ue(){const e=document.getElementById("gallery-section"),t=document.getElementById("photos-grid"),n=document.getElementById("gallery-count"),o=document.getElementById("btn-add-more"),r=document.getElementById("file-input");!e||!t||!n||!o||(o.addEventListener("click",()=>{r&&r.click()}),v(l=>{const i=l.files.length>0,a=l.orderCode!=="";i&&!a?(e.style.display="block",n.textContent=l.files.length,t.innerHTML="",l.files.forEach(c=>{const s=de(c);t.appendChild(s)})):(e.style.display="none",t.innerHTML="")}))}function pe({files:e,orderCode:t,client:n,source:o,sizeLabels:r},l){return new Promise((i,a)=>{const c=window.JSZip;if(!c){a(new Error("JSZip library not loaded"));return}const s=new c;let E=`==================================================
PEDIDO DE IMPRESIÓN - FOTOLAR CÓRDOBA
==================================================
Código de Pedido: ${t}
Fecha: ${new Date().toLocaleString("es-ES")}
Origen Acceso: ${o}
--------------------------------------------------
DATOS DEL CLIENTE:
Nombre: ${n.name}
Teléfono/WhatsApp: ${n.phone}
Notas Adicionales: ${n.notes||"Ninguna"}

--------------------------------------------------
DESGLOSE DE IMPRESIÓN POR ARCHIVO:
`,y=0;const h=e.map((u,m)=>{y+=u.quantity;const A=u.name.replace(/\s+/g,"_").replace(/[^a-zA-Z0-9_\.-]/g,""),B=`${(m+1).toString().padStart(2,"0")}_[${u.size}]_[${u.paper}]_[x${u.quantity}]_${A}`;return E+=`
[Foto ${m+1}]
Archivo original: ${u.name}
Archivo en ZIP: ${B}
Tamaño: ${r[u.size]||u.size}
Cantidad: ${u.quantity} copias
Acabado Papel: ${u.paper.toUpperCase()}
`,new Promise((C,I)=>{const P=new FileReader;P.onload=function(S){s.file(B,S.target.result),C()},P.onerror=function(S){I(S)},P.readAsArrayBuffer(u.file)})});Promise.all(h).then(()=>{E+=`
--------------------------------------------------
RESUMEN GLOBAL:
Total fotos diferentes: ${e.length}
Total copias a imprimir: ${y}

Gracias por confiar en Fotolar Córdoba.
Muestra el código QR del ticket en el mostrador para proceder.
==================================================`,s.file("info_pedido.txt",E),l&&l(40,"Generando archivo ZIP de envío..."),s.generateAsync({type:"blob",mimeType:"application/zip"},function(m){const C=40+Math.round(m.percent*.6);let I="Comprimiendo archivos...";C>90&&(I="Finalizando compresión de imágenes..."),l&&l(C,I)}).then(function(u){i(u)}).catch(u=>{a(u)})}).catch(u=>{a(u)})})}let f=null,k=null,T=null,Q=null,W=null,J=null,V=null,F=null,K=null;function fe(){f=document.getElementById("contact-modal"),k=document.getElementById("btn-close-modal"),T=document.getElementById("order-form"),Q=document.getElementById("input-name"),W=document.getElementById("input-email"),J=document.getElementById("input-phone"),V=document.getElementById("input-notes"),F=document.getElementById("summary-items-list"),K=document.getElementById("summary-total-price"),!(!f||!k||!T)&&(k.addEventListener("click",O),f.addEventListener("click",e=>{e.target===f&&O()}),T.addEventListener("submit",ge))}function me(){const e=G();if(e.files.length===0)return;const t={};let n=0;e.files.forEach(o=>{t[o.size]||(t[o.size]={count:0,price:0}),t[o.size].count+=o.quantity;const l=(q[o.size]||.25)*o.quantity;t[o.size].price+=l,n+=l}),F.innerHTML="";for(const o in t){const r=document.createElement("div");r.className="summary-row",r.innerHTML=`
            <span>Copias ${_[o]} (x${t[o].count}):</span>
            <span>${t[o].price.toFixed(2).replace(".",",")} €</span>
        `,F.appendChild(r)}K.textContent=`${n.toFixed(2).replace(".",",")} €`,f.classList.add("active")}function O(){f&&f.classList.remove("active")}function ge(e){e.preventDefault();const t=Q.value.trim(),n=W.value.trim(),o=J.value.trim(),r=V.value.trim();if(!t||!n||!o)return;oe({name:t,email:n,phone:o,notes:r}),O(),L("Empaquetando pedido...","Comprimiendo tus fotos localmente...",5);const i=`FL-${Math.floor(1e3+Math.random()*9e3)}`,a=G();pe({files:a.files,orderCode:i,client:{name:t,phone:o,notes:r},source:a.source,sizeLabels:_},(c,s)=>{x(c,s)}).then(c=>{const s=`fotolar-pedido-${i}.zip`;L("Subiendo fotos...","Cargando archivo ZIP en el servidor de Fotolar...",60),setTimeout(()=>{x(85,"Enviando correo con el pedido a fotolar@fotolar.es..."),setTimeout(()=>{x(100,"¡Pedido enviado con éxito y archivado!"),setTimeout(()=>{z(),ne({orderCode:i,zipBlob:c,zipName:s})},500)},1e3)},1e3)}).catch(c=>{console.error("Error al generar el ZIP:",c),L("Error","No se pudo generar el archivo comprimido: "+c.message,0),setTimeout(z,3e3)})}function ye(){const e=document.getElementById("bottom-badge"),t=document.getElementById("badge-total-count"),n=document.getElementById("badge-total-price"),o=document.getElementById("btn-confirm");!e||!t||!n||!o||(o.addEventListener("click",()=>{me()}),v(r=>{const l=r.files.length>0,i=r.orderCode!=="";if(l&&!i){e.classList.add("visible");const{totalPhotos:a,totalCopies:c,totalPrice:s}=Z();t.textContent=`${a} fotos - ${c} copias`,n.textContent=`${s.toFixed(2).replace(".",",")} €`,c>0?o.classList.add("pulse"):o.classList.remove("pulse")}else e.classList.remove("visible")}))}function he(){const e=document.getElementById("success-section"),t=document.getElementById("ticket-order-code"),n=document.getElementById("ticket-qr"),o=document.getElementById("ticket-name"),r=document.getElementById("ticket-copies"),l=document.getElementById("ticket-price"),i=document.getElementById("btn-save-pdf"),a=document.getElementById("btn-send-email"),c=document.getElementById("btn-restart");!e||!t||!n||!o||!r||!l||!i||!a||!c||(c.addEventListener("click",()=>{ie()}),v(s=>{if(s.orderCode!==""){const{totalPhotos:y,totalCopies:h,totalPrice:u}=Z();t.textContent=s.orderCode,o.textContent=s.client.name,r.textContent=`${y} fotos / ${h} copias`,l.textContent=`${u.toFixed(2).replace(".",",")} €`;const m=JSON.stringify({code:s.orderCode,client:s.client.name,tel:s.client.phone,email:s.client.email,copies:h,total:u.toFixed(2)+"€",src:s.source});n.src=`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(m)}`,i.onclick=()=>{be(s.orderCode)},a.onclick=()=>{ve(s.client.name,s.client.email,s.client.phone,y,h,u,s.orderCode)},e.style.display="block",window.scrollTo({top:0,behavior:"smooth"})}else e.style.display="none"}))}function be(e){const t=document.getElementById("print-ticket");if(!t)return;const n=window.html2pdf;if(!n){alert("La librería html2pdf no está disponible.");return}const o=t.cloneNode(!0);o.style.position="absolute",o.style.left="-9999px",o.style.top="0",o.style.width="380px",o.style.boxShadow="none",o.style.border="1px solid #cbd5e1",o.style.margin="0",o.style.backgroundColor="#ffffff",o.style.color="#0f172a",document.body.appendChild(o),setTimeout(()=>{const r=o.offsetWidth,l=o.offsetHeight,i={margin:12,filename:`ticket-fotolar-${e}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2.5,useCORS:!0,scrollY:0,scrollX:0,logging:!1},jsPDF:{unit:"pt",format:[r+24,l+24],orientation:"portrait"}};n().set(i).from(o).save().then(()=>{document.body.removeChild(o)}).catch(a=>{console.error("Error al generar PDF: ",a),document.body.contains(o)&&document.body.removeChild(o)})},50)}function ve(e,t,n,o,r,l,i){const a=`Reserva de Impresión Fotolar - Código: ${i}`,c=`==================================================
TICKET DE RESERVA - FOTOLAR CÓRDOBA
==================================================
Hola ${e},

Aquí tienes los detalles de tu reserva de impresión de fotos.

🏷️ Código de Reserva: ${i}
👤 Cliente: ${e}
📞 Teléfono: ${n}
📧 Correo electrónico: ${t}
📥 Total Fotos / Copias: ${o} fotos / ${r} copias
💰 Importe Total: ${l.toFixed(2).replace(".",",")} €

--------------------------------------------------
¿Qué debes hacer ahora?
Muestra este código de reserva o el código QR de tu ticket
en el mostrador de nuestra tienda (Calle Lope de Hoces nº16, Córdoba).
El dependiente escaneará el código, recuperará tus fotos
de forma automática, las imprimirá y te las entregará.

¡Gracias por confiar en Fotolar!
==================================================`,s=`mailto:${t}?subject=${encodeURIComponent(a)}&body=${encodeURIComponent(c)}`;window.open(s,"_blank")}function j(){le(),re(),ce(),ue(),ye(),fe(),he();const e=new URLSearchParams(window.location.search);let t="",n="";e.has("nfc")&&(t="NFC "),e.has("kiosk")?(n=e.get("kiosk"),t+="Mostrador "+n):e.has("mesa")?t+="Mesa "+e.get("mesa"):e.has("source")&&(t+=e.get("source")),t?te({source:t,kiosk:n}):p()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",j):j();
