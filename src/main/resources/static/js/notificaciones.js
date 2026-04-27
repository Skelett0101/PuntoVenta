document.addEventListener('DOMContentLoaded', () => {
    cargarNotificacionesGlobales();
});

// Función para abrir/cerrar la campana
window.toggleNotificacionesGlobales = function() {
    const dropdown = document.getElementById('global-notif-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
};

// Cerrar el panel si haces clic en cualquier otra parte de la pantalla
window.addEventListener('click', function(e) {
    const navNotif = document.querySelector('.nav-notifications');
    const dropdown = document.getElementById('global-notif-dropdown');
    if (navNotif && !navNotif.contains(e.target) && dropdown) {
        dropdown.style.display = 'none';
    }
});

// Función central que lee la base de datos
async function cargarNotificacionesGlobales() {
    try {
        const response = await fetch("http://localhost:8080/api/lotes");
        const lotes = await response.json();
        
        const lista = document.getElementById('global-notif-list');
        const badge = document.getElementById('global-notif-badge');
        
        if(!lista || !badge) return;

        lista.innerHTML = "";
        let countAvisos = 0;
        
        // Mantengo tu fecha de pruebas (Cuando el sistema sea real, cámbialo a: new Date())
        const hoy = new Date("2026-04-12"); 

        lotes.forEach(l => {
            const fechaCad = new Date(l.fechaCaducidad);
            const difTiempo = fechaCad - hoy;
            const difDias = Math.ceil(difTiempo / (1000 * 60 * 60 * 24));
            const stock = l.stockLote;

            // 1. REGLA: Caducidad (7 días o menos)
            if (difDias <= 0) {
                agregarAvisoNavbar(lista, `El lote ${l.codigoLote} (${l.producto.nombre}) ya CADUCÓ.`, "danger", "ph-warning-octagon");
                countAvisos++;
            } else if (difDias <= 7) {
                agregarAvisoNavbar(lista, `El lote ${l.codigoLote} (${l.producto.nombre}) vence en ${difDias} días.`, "warning", "ph-clock");
                countAvisos++;
            }

            // 2. REGLA: Stock Bajo (5 unidades o menos)
            // Filtramos stock <= 5, pero ignoramos los que tienen 0 porque ya no hay nada que vender
			// 2. REGLA: Stock Bajo o Agotado (5 unidades o menos)
			            if (stock === 0) {
			                // Aviso de Agotado (Rojo)
			                agregarAvisoNavbar(lista, `¡Agotado! El producto ${l.producto.nombre} (Lote: ${l.codigoLote}) se quedó en 0 unidades.`, "danger", "ph-empty");
			                countAvisos++;
			            } else if (stock > 0 && stock <= 5) {
			                // Aviso de Poco Stock (Amarillo)
			                agregarAvisoNavbar(lista, `¡Stock crítico! Solo quedan ${stock} unidades de ${l.producto.nombre} (Lote: ${l.codigoLote}).`, "warning", "ph-package");
			                countAvisos++;
			            }
        });

        // Actualizar el numerito de la campana
        if (countAvisos === 0) {
            lista.innerHTML = `<p style="font-size: 12px; color: #64748b; text-align: center; margin: 15px 0;">Todo en orden. No hay alertas.</p>`;
            badge.style.display = "none";
        } else {
            badge.innerText = countAvisos;
            badge.style.display = "block";
        }

    } catch (error) {
        console.error("Error cargando notificaciones globales:", error);
    }
}

function agregarAvisoNavbar(contenedor, mensaje, tipo, icono) {
    // Colores según el diseño "Elite"
    const color = tipo === 'danger' ? '#ba1a1a' : '#735c00'; // error y secondary de tu config
    const bg = tipo === 'danger' ? '#fff1f0' : '#fffbeb';
    const borderColor = tipo === 'danger' ? '#ffdad6' : '#ffe088';

    const item = document.createElement('div');
    item.className = "flex items-start gap-3 p-3 mb-2 rounded-xl border transition-all hover:shadow-sm";
    item.style.cssText = `
        background: ${bg}; 
        border-color: ${borderColor};
    `;

    item.innerHTML = `
        <span class="material-symbols-outlined" style="font-size: 20px; color: ${color};">
            ${tipo === 'danger' ? 'warning' : 'info'}
        </span>
        <div style="flex: 1;">
            <p style="margin: 0; font-size: 11px; font-weight: 500; color: #1b1c1c; line-height: 1.4;">
                ${mensaje}
            </p>
        </div>
    `;
    contenedor.appendChild(item);
}

