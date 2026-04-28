// --- SISTEMA DINÁMICO GLOBAL (PERFIL, SESIÓN, ALERTAS Y MENÚ) ---

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosUsuario();           // Carga la foto y nombre
    cargarNotificacionesGlobales(); // Carga las alertas de la campana
    resaltarMenuActivo();           // Pinta la pestaña correcta en el menú
});

// ==========================================
// 1. LÓGICA DEL MENÚ AUTOMÁTICO
// ==========================================
function resaltarMenuActivo() {
    // Obtenemos el nombre del archivo actual (ej. 'lotes2.html')
    let rutaActual = window.location.pathname.split("/").pop();
    
    // Si la ruta está vacía (localhost:8080/), asumimos que es el inicio
    if (rutaActual === "" || rutaActual === "/") {
        rutaActual = "Index2.html";
    }

    // Buscamos todos los enlaces dentro de la etiqueta <nav>
    const enlacesMenu = document.querySelectorAll('nav a');

    enlacesMenu.forEach(enlace => {
        const href = enlace.getAttribute('href');

        if (href === rutaActual) {
            // Estilo ACTIVO (Letra oscura y línea dorada)
            enlace.className = "text-neutral-900 border-b-2 border-[#D4AF37] pb-1 font-semibold text-sm";
        } else {
            // Estilo INACTIVO (Letra gris clara)
            enlace.className = "text-neutral-500 hover:text-neutral-800 transition-colors text-sm";
        }
    });
}

// ==========================================
// 2. LÓGICA DE PERFIL Y SESIÓN
// ==========================================
function cargarDatosUsuario() {
    const usuarioStorage = localStorage.getItem('usuario');
    if (usuarioStorage) {
        try {
            const usuario = JSON.parse(usuarioStorage);
            const nombre = usuario.nombre || usuario.nombreUsuario || 'Admin';
            const rol = usuario.rol || 'Administrador';

            const txtNombre = document.getElementById('displayNombre');
            const txtRol = document.getElementById('displayRol');
            const imgAvatar = document.getElementById('displayAvatar');

            if(txtNombre) txtNombre.textContent = nombre;
            if(txtRol) txtRol.textContent = rol;
            if(imgAvatar) {
                // Genera el avatar con fondo negro y letra dorada
                imgAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=121212&color=D4AF37&bold=true`;
            }
        } catch (e) { console.error('Error:', e); }
    } else {
        // Si no hay sesión iniciada y no estamos en la página de login, te expulsa al login
        if (!window.location.pathname.includes('logIn.html')) {
            window.location.href = 'logIn.html';
        }
    }
}

window.toggleProfileMenu = function() {
    const menu = document.getElementById('profileDropdown');
    if(menu) menu.classList.toggle('hidden');
};

window.cerrarSesion = function() {
    localStorage.removeItem('usuario');
    window.location.href = 'logIn.html';
};


// ==========================================
// 3. LÓGICA DE NOTIFICACIONES (CAMPANA)
// ==========================================
window.toggleNotificacionesGlobales = function() {
    const dropdown = document.getElementById('global-notif-dropdown');
    if(dropdown) {
        if (dropdown.style.display === 'none' || dropdown.classList.contains('hidden')) {
            dropdown.style.display = 'block';
            dropdown.classList.remove('hidden');
        } else {
            dropdown.style.display = 'none';
            dropdown.classList.add('hidden');
        }
    }
};

async function cargarNotificacionesGlobales() {
    try {
        const response = await fetch("http://localhost:8080/api/lotes");
        if(!response.ok) return; 
        const lotes = await response.json();
        
        const lista = document.getElementById('global-notif-list');
        const badge = document.getElementById('global-notif-badge');
        
        if(!lista || !badge) return;

        lista.innerHTML = "";
        let countAvisos = 0;
        
        // Mantengo tu fecha de pruebas
        const hoy = new Date("2026-04-12"); 

        lotes.forEach(l => {
            const fechaCad = new Date(l.fechaCaducidad);
            const difTiempo = fechaCad - hoy;
            const difDias = Math.ceil(difTiempo / (1000 * 60 * 60 * 24));
            const stock = l.stockLote;

            // REGLA: Caducidad
            if (difDias <= 0) {
                agregarAvisoNavbar(lista, `El lote ${l.codigoLote} (${l.producto.nombre}) ya CADUCÓ.`, "danger", "warning");
                countAvisos++;
            } else if (difDias <= 7) {
                agregarAvisoNavbar(lista, `El lote ${l.codigoLote} (${l.producto.nombre}) vence en ${difDias} días.`, "warning", "schedule");
                countAvisos++;
            }

            // REGLA: Stock Bajo o Agotado
            if (stock === 0) {
                agregarAvisoNavbar(lista, `¡Agotado! El producto ${l.producto.nombre} (Lote: ${l.codigoLote}) se quedó en 0 uds.`, "danger", "inventory_2");
                countAvisos++;
            } else if (stock > 0 && stock <= 5) {
                agregarAvisoNavbar(lista, `¡Stock crítico! Solo quedan ${stock} uds de ${l.producto.nombre} (Lote: ${l.codigoLote}).`, "warning", "inventory");
                countAvisos++;
            }
        });

        if (countAvisos === 0) {
            lista.innerHTML = `<p style="font-size: 12px; color: #64748b; text-align: center; margin: 15px 0;">Todo en orden. No hay alertas.</p>`;
            badge.style.display = "none";
        } else {
            badge.innerText = countAvisos;
            badge.style.display = "flex"; 
        }

    } catch (error) {
        console.error("Error cargando notificaciones globales:", error);
    }
}

function agregarAvisoNavbar(contenedor, mensaje, tipo, iconoClass) {
    const color = tipo === 'danger' ? '#ba1a1a' : '#735c00'; 
    const bg = tipo === 'danger' ? '#fff1f0' : '#fffbeb';
    const borderColor = tipo === 'danger' ? '#ffdad6' : '#ffe088';

    const item = document.createElement('div');
    item.className = "flex items-start gap-3 p-3 mb-2 rounded-xl border transition-all hover:shadow-sm";
    item.style.cssText = `background: ${bg}; border-color: ${borderColor};`;

    item.innerHTML = `
        <span class="material-symbols-outlined" style="font-size: 20px; color: ${color};">
            ${iconoClass}
        </span>
        <div style="flex: 1;">
            <p style="margin: 0; font-size: 11px; font-weight: 600; color: #1b1c1c; line-height: 1.4;">
                ${mensaje}
            </p>
        </div>
    `;
    contenedor.appendChild(item);
}


// ==========================================
// 4. EVENTO PARA CERRAR MENÚS AL DAR CLIC FUERA
// ==========================================
window.addEventListener('click', function(e) {
    const navNotif = document.querySelector('.nav-notifications');
    const dropdownNotif = document.getElementById('global-notif-dropdown');
    if (navNotif && !navNotif.contains(e.target) && dropdownNotif) {
        dropdownNotif.style.display = 'none';
        dropdownNotif.classList.add('hidden');
    }

    const wrapperProfile = document.getElementById('userProfileWrapper');
    const menuProfile = document.getElementById('profileDropdown');
    if (wrapperProfile && menuProfile && !wrapperProfile.contains(e.target)) {
        menuProfile.classList.add('hidden');
    }
});

// ==========================================
// 5. TOAST GLOBALES
// ==========================================
window.mostrarToast = function(mensaje, tipo = 'info') {
    const toast = document.createElement('div');
    let bg = '#121212'; let icon = 'info';
    
    if (tipo === 'success') { bg = '#10b981'; icon = 'check_circle'; }
    if (tipo === 'error')   { bg = '#ef4444'; icon = 'error'; }
    if (tipo === 'warning') { bg = '#D4AF37'; icon = 'warning'; }

    toast.style.cssText = `position: fixed; bottom: 30px; right: 30px; background-color: ${bg}; color: white; padding: 16px 24px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 12px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; z-index: 9999; opacity: 0; transform: translateY(20px); transition: all 0.4s ease;`;
    toast.innerHTML = `<span class="material-symbols-outlined">${icon}</span> <span>${mensaje}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; }, 10);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(20px)'; setTimeout(() => toast.remove(), 400); }, 3500);
}