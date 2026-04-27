let chartIngresos, chartFrecuencia, chartLow;

document.addEventListener('DOMContentLoaded', () => {
    cargarIngresos();
    cargarTopProductos();
    cargarFrecuencia();
    cargarLowStock();
});

// 1. Gráfica de Ingresos (Línea elegante)
async function cargarIngresos() {
    try {
        const res = await fetch('http://localhost:8080/api/venta/ingresos');
        const datos = await res.json();
        const ctx = document.getElementById('chartIngresos').getContext('2d');
        
        chartIngresos = new Chart(ctx, {
            type: 'line',
            data: {
                labels: datos.map(d => new Date(d.fecha || Object.values(d)[0]).toLocaleDateString('es-ES', {weekday:'short'})),
                datasets: [{
                    label: 'Ventas ($)',
                    data: datos.map(d => d.total || Object.values(d)[1]),
                    borderColor: '#D4AF37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: '#121212'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    } catch (e) { console.error(e); }
}

// 2. Lista de Más Vendidos (HTML Dinámico)
async function cargarTopProductos() {
    const cont = document.getElementById('lista-top-productos');
    try {
        const res = await fetch('http://localhost:8080/api/productos/mas/top');
        const datos = await res.json();
        
        // Tomamos el total del primero para calcular las barras relativas
        const maxVentas = datos.length > 0 ? (datos[0].total || 1) : 1;

        cont.innerHTML = datos.slice(0, 5).map((p, index) => {
            const nombre = p.nombre_producto || p.nombre;
            const total = p.total || 0;
            const porcentaje = (total / maxVentas) * 100; // Barra de progreso relativa

            // Dentro de tu .map(...)
const inicial = nombre.charAt(0).toUpperCase();

return `
<div class="relative group cursor-default p-3 rounded-xl transition-all duration-500 hover:bg-white/[0.03]">
    <div class="flex items-center gap-4 relative z-10">
        <div class="text-lg font-black text-white/10 group-hover:text-[#D4AF37]/40 transition-colors duration-500 italic">
            0${index + 1}
        </div>

        <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 flex-shrink-0 border border-white/10 group-hover:border-[#D4AF37]/50 flex items-center justify-center transition-all duration-500 shadow-2xl">
            <span class="text-xl font-black text-[#D4AF37] group-hover:scale-110 transition-transform duration-500">
                ${inicial}
            </span>
        </div>

        <div class="flex-grow">
            <div class="flex justify-between items-end mb-2">
                <div>
                    <p class="text-sm font-bold text-gray-100 leading-tight group-hover:text-white">${nombre}</p>
                    <p class="text-[10px] text-[#D4AF37] font-black uppercase tracking-tighter opacity-80">${total} unidades</p>
                </div>
                <span class="material-symbols-outlined text-[16px] text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">trending_up</span>
            </div>
            
            <div class="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
                <div class="bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37] h-full transition-all duration-1000 ease-out" 
                     style="width: 0%;" 
                     data-width="${porcentaje}%">
                </div>
            </div>
        </div>
    </div>
</div>
`;
        }).join('');

        // Animación de las barras después de inyectar el HTML
        setTimeout(() => {
            cont.querySelectorAll('[data-width]').forEach(bar => {
                bar.style.width = bar.getAttribute('data-width');
            });
        }, 100);

    } catch (e) { 
        cont.innerHTML = `<p class="text-white/20 text-xs text-center py-10 italic">No se pudieron cargar los datos</p>`; 
    }
}

// 3. Frecuencia de Ventas (Barras)
async function cargarFrecuencia() {
    try {
        const res = await fetch('http://localhost:8080/api/venta/frecuencia');
        const datos = await res.json();
        const ctx = document.getElementById('chartFrecuencia').getContext('2d');
        
        chartFrecuencia = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: datos.map(d => d.fecha || Object.values(d)[0]),
                datasets: [{
                    data: datos.map(d => d.cantidad || Object.values(d)[1]),
                    backgroundColor: '#121212',
                    borderRadius: 8
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    } catch (e) { console.error(e); }
}

// 4. Low Stock (Doughnut)
async function cargarLowStock() {
    try {
        const res = await fetch('http://localhost:8080/api/productos/menos/low');
        const datos = await res.json();
        
        // 1. Renderizar la Lista con estilo limpio
        const contenedorLista = document.getElementById('lista-low-productos');
        contenedorLista.innerHTML = datos.slice(0, 4).map(p => {
            // Buscamos el nombre sin importar si es .nombre o .nombre_producto
            const nombre = p.nombre_producto || p.nombre || "Producto";
            const stock = p.total || p.stock || 0;
            
            return `
                <div class="flex justify-between items-center p-3 bg-red-50/50 rounded-xl border border-red-100/50">
                    <span class="text-sm font-bold text-neutral-800">${nombre}</span>
                    <span class="text-xs font-black text-red-600 bg-white px-3 py-1 rounded-full shadow-sm">${stock} uds</span>
                </div>
            `;
        }).join('');

        // 2. Renderizar la Gráfica de Dona
        const ctx = document.getElementById('chartLow').getContext('2d');
        
        // Destruir gráfica previa si existe para evitar solapamiento
        if (chartLow) chartLow.destroy();

        chartLow = new Chart(ctx, {
            type: 'doughnut',
            data: {
                // Fix: Asegurar que el label no sea undefined
                labels: datos.slice(0, 5).map(p => p.nombre_producto || p.nombre || "S/N"),
                datasets: [{
                    data: datos.slice(0, 5).map(p => p.total || p.stock || 0),
                    backgroundColor: [
                        '#121212', // Negro Premium
                        '#D4AF37', // Dorado
                        '#E5E5E5', // Gris claro
                        '#ba1a1a', // Rojo error
                        '#747878'  // Gris neutro
                    ],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%', // Hace el círculo más delgado y elegante
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: { size: 10, family: 'Inter', weight: '600' },
                            color: '#444'
                        }
                    }
                }
            }
        });
    } catch (e) { 
        console.error("Error en Alertas de Stock:", e); 
    }
}

// 5. REPORTE PDF (Arreglado)
window.descargarReporte = async function() {
    if (!chartIngresos || !chartFrecuencia || !chartLow) {
        mostrarToast("Cargando gráficas...", "warning");
        return;
    }

    mostrarToast("Generando reporte...", "info");
    
    const payload = {
        imgIngresos: chartIngresos.toBase64Image(),
        imgVentas: chartFrecuencia.toBase64Image(),
        imgLow: chartLow.toBase64Image(),
        usuario: "Ejecutivo Elite"
    };

    try {
        const res = await fetch("http://localhost:8080/api/reportes/generar-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank");
            mostrarToast("Reporte descargado", "success");
        }
    } catch (e) { mostrarToast("Error al generar PDF", "error"); }
};

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


