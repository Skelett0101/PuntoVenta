document.addEventListener('DOMContentLoaded', () => {
    cargarGraficaTop();
    cargarGraficaLow();
    cargarGraficaFrecuenciaVentas();
    cargarGraficaIngresos();
});

// Variables globales para guardar las gráficas de forma segura
let chartTop, chartLow, chartVentas, chartIngresos;

// --- GRÁFICAS DE PRODUCTOS (BARRAS) ---
async function cargarGraficaTop() {
    try {
        const response = await fetch('http://localhost:8080/api/productos/mas/top');
        const datos = await response.json();
        const ctx = document.getElementById('chartTop').getContext('2d');
        chartTop = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: datos.map(item => item.nombre_producto || item.nombre || "Producto"),
                datasets: [{
                    label: 'Unidades',
                    data: datos.map(item => item.total || Object.values(item).pop()),
                    backgroundColor: '#4f46e5',
                    borderRadius: 5
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    } catch (e) { console.error("Error en Top:", e); }
}

async function cargarGraficaLow() {
    try {
        const response = await fetch('http://localhost:8080/api/productos/menos/low');
        const datos = await response.json();
        const ctx = document.getElementById('chartLow').getContext('2d');
        chartLow = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: datos.map(item => item.nombre_producto || item.nombre || "Producto"),
                datasets: [{
                    label: 'Unidades',
                    data: datos.map(item => item.total || Object.values(item).pop()),
                    backgroundColor: '#f43f5e',
                    borderRadius: 5
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    } catch (e) { console.error("Error en Low:", e); }
}

// --- GRÁFICAS DE VENTAS (PASTEL) ---
async function cargarGraficaFrecuenciaVentas() {
    try {
        const response = await fetch('http://localhost:8080/api/venta/frecuencia');
        const datos = await response.json();
        const ctx = document.getElementById('chartVentas').getContext('2d');
        chartVentas = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: datos.map(item => item.fecha || Object.values(item)[0]),
                datasets: [{
                    label: 'Tickets',
                    data: datos.map(item => item.cantidad || item.count || Object.values(item)[1] || 0),
                    backgroundColor: ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                    borderWidth: 2, borderColor: '#ffffff'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'right' } } }
        });
    } catch (e) { console.error("Error frecuencia:", e); }
}

async function cargarGraficaIngresos() {
    try {
        const response = await fetch('http://localhost:8080/api/venta/ingresos');
        const datos = await response.json();
        const ctx = document.getElementById('chartIngresos').getContext('2d');
        chartIngresos = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: datos.map(item => item.fecha || Object.values(item)[0]),
                datasets: [{
                    label: 'Ingresos ($)',
                    data: datos.map(item => item.total || item.monto || Object.values(item)[1] || 0),
                    backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'],
                    borderWidth: 2, borderColor: '#ffffff'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'right' } } }
        });
    } catch (e) { console.error("Error ingresos:", e); }
}

// --- SISTEMA DINÁMICO DE NOTIFICACIONES (TOAST) ---
function mostrarToast(mensaje, tipo = 'info') {
    const toast = document.createElement('div');
    
    // Configurar colores e iconos según el tipo de aviso
    let bg = '#3b82f6'; // Azul por defecto
    let icon = 'ph-info';
    if (tipo === 'success') { bg = '#10b981'; icon = 'ph-check-circle'; }
    if (tipo === 'error')   { bg = '#ef4444'; icon = 'ph-warning-circle'; }
    if (tipo === 'warning') { bg = '#f59e0b'; icon = 'ph-warning'; }

    // Estilos para que se vea flotante, moderno y animado
    toast.style.cssText = `
        position: fixed; bottom: 30px; right: 30px;
        background-color: ${bg}; color: white;
        padding: 16px 24px; border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        display: flex; align-items: center; gap: 12px;
        font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 600;
        z-index: 9999; opacity: 0; transform: translateY(20px);
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;

    toast.innerHTML = `<i class="ph-bold ${icon}" style="font-size: 1.5rem;"></i> <span>${mensaje}</span>`;
    document.body.appendChild(toast);

    // Animación de entrada
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    // Animación de salida después de 3.5 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 400); // Eliminar del HTML
    }, 3500);
}

// --- GENERAR PDF REPORTE DESDE SPRING BOOT ---
window.descargarReporte = async function() {
    try {
        if (!chartTop || !chartLow || !chartVentas || !chartIngresos) {
            mostrarToast("Espera un momento a que las gráficas carguen...", "warning");
            return;
        }

        // Mostrar la nueva notificación elegante
        mostrarToast("Conectando con el servidor... Generando PDF", "info");

        // 1. Extraemos las imágenes de Chart.js
        const imgTop = chartTop.toBase64Image();
        const imgLow = chartLow.toBase64Image();
        const imgVentas = chartVentas.toBase64Image();
        const imgIngresos = chartIngresos.toBase64Image();
        
        // 2. Obtener el usuario correctamente
        let usuarioLogeado = "Admin";
        try {
            const usuarioStorage = localStorage.getItem("usuario");
            if (usuarioStorage) {
                const userObj = JSON.parse(usuarioStorage);
                usuarioLogeado = userObj.nombre || userObj.nombreUsuario || userObj.username || "Admin";
            } else {
                const spansPerfil = document.querySelectorAll('.user-profile span');
                spansPerfil.forEach(span => {
                    const texto = span.innerText.trim();
                    if (isNaN(texto) && texto.length > 1) usuarioLogeado = texto;
                });
            }
        } catch (e) { console.warn("Usando 'Admin' por defecto."); }

        // 3. Enviamos los datos al controlador de Spring Boot
        const response = await fetch("http://localhost:8080/api/reportes/generar-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                imgTop: imgTop, imgLow: imgLow, imgVentas: imgVentas, imgIngresos: imgIngresos, usuario: usuarioLogeado
            })
        });

        if (!response.ok) throw new Error("Error en el servidor.");

        // 4. Éxito: Mostrar notificación verde y abrir PDF
        mostrarToast("¡Reporte generado con éxito!", "success");
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Damos 1 segundito para que el usuario lea la notificación de éxito antes de saltar de pestaña
        setTimeout(() => {
            window.open(url, "_blank");
        }, 1000);

    } catch (err) {
        console.error(err);
        mostrarToast("Ocurrió un error al generar el reporte.", "error");
    }
};