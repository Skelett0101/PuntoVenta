let chartIngresos, chartFrecuencia, chartLow;
let imgTopBase64 = null; // Guardará la foto de alta calidad para el PDF

document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('chartIngresos')) {
        cargarIngresos();
        cargarTopProductos();
        cargarFrecuencia();
        cargarLowStock();
    }
});

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
                    borderColor: '#D4AF37', backgroundColor: 'rgba(212, 175, 55, 0.1)', fill: true, tension: 0.4, borderWidth: 3
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    } catch (e) { console.error("Error ingresos:", e); }
}

async function cargarTopProductos() {
    const cont = document.getElementById('lista-top-productos');
    try {
        const res = await fetch('http://localhost:8080/api/productos/mas/top');
        const datos = await res.json();
        
        // 1. DIBUJAMOS LA LISTA ELEGANTE EN PANTALLA (Esta parte se queda igual de bonita)
        if (cont && datos.length > 0) {
            const maxVentas = datos[0].total || Object.values(datos[0]).pop() || 1;
            
            cont.innerHTML = datos.slice(0, 5).map((p, index) => {
                const nombre = p.nombre_producto || p.nombre || "Producto";
                const total = p.total || Object.values(p).pop() || 0;
                const porcentaje = (total / maxVentas) * 100; 
                const inicial = nombre.charAt(0).toUpperCase();

                return `
                <div class="relative group cursor-default p-3 rounded-xl transition-all duration-500 hover:bg-white/[0.03]">
                    <div class="flex items-center gap-4 relative z-10">
                        <div class="text-lg font-black text-white/10 group-hover:text-[#D4AF37]/40 transition-colors italic">0${index + 1}</div>
                        <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 flex-shrink-0 border border-white/10 flex items-center justify-center shadow-xl">
                            <span class="text-xl font-black text-[#D4AF37]">${inicial}</span>
                        </div>
                        <div class="flex-grow">
                            <p class="text-sm font-bold text-gray-100">${nombre}</p>
                            <p class="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest">${total} unidades</p>
                            <div class="w-full h-[3px] bg-white/5 rounded-full mt-2 overflow-hidden">
                                <div class="bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37] h-full" style="width: ${porcentaje}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }

        // 2. CREAMOS LA GRÁFICA VIRTUAL (Arreglada: Proporciones correctas y Fondo Blanco)
        const hiddenDiv = document.createElement('div');
        hiddenDiv.style.position = 'absolute';
        hiddenDiv.style.visibility = 'hidden'; // Oculto pero físicamente en la página
        hiddenDiv.style.width = '800px';  // Más ancho para evitar que se vea "chaparra"
        hiddenDiv.style.height = '450px'; // Altura perfecta
        hiddenDiv.style.zIndex = '-1';
        document.body.appendChild(hiddenDiv);

        const canvasVirtual = document.createElement('canvas');
        hiddenDiv.appendChild(canvasVirtual);

        // Plugin personalizado para pintar un fondo blanco puro
        const pluginFondoBlanco = {
            id: 'fondoBlanco',
            beforeDraw: (chart) => {
                const ctx = chart.canvas.getContext('2d');
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = '#ffffff'; // Fondo blanco para el PDF
                ctx.fillRect(0, 0, chart.width, chart.height);
                ctx.restore();
            }
        };

        const chartVirtual = new Chart(canvasVirtual.getContext('2d'), {
            type: 'bar',
            data: {
                labels: datos.slice(0, 5).map(p => p.nombre_producto || p.nombre || "Producto"),
                datasets: [{ 
                    data: datos.slice(0, 5).map(p => p.total || Object.values(p).pop() || 0), 
                    backgroundColor: '#D4AF37', 
                    borderRadius: 6 
                }]
            },
            plugins: [pluginFondoBlanco], // Aplicamos el fondo blanco
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                animation: false, 
                plugins: { legend: { display: false } },
                scales: {
                    x: { 
                        ticks: { color: '#1a1a1a', font: { size: 14, weight: 'bold' } }, // Letras grandes y oscuras
                        grid: { display: false } 
                    },
                    y: { 
                        ticks: { color: '#1a1a1a', font: { size: 14 } }, 
                        grid: { color: '#e5e5e5' } 
                    }
                }
            }
        });
        
        // 3. TOMAMOS LA FOTO (Usando PNG, que no falla en Java) y limpiamos
        setTimeout(() => { 
            imgTopBase64 = chartVirtual.toBase64Image(); // Formato PNG nativo
            chartVirtual.destroy();
            document.body.removeChild(hiddenDiv);
        }, 600);

    } catch (e) { console.error("Error Top 5:", e); }
}

async function cargarFrecuencia() {
    try {
        const res = await fetch('http://localhost:8080/api/venta/frecuencia');
        const datos = await res.json();
        const ctx = document.getElementById('chartFrecuencia').getContext('2d');
        chartFrecuencia = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: datos.map(d => d.fecha || Object.values(d)[0]),
                datasets: [{ data: datos.map(d => d.cantidad || Object.values(d)[1]), backgroundColor: '#121212', borderRadius: 8 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    } catch (e) { console.error(e); }
}

async function cargarLowStock() {
    try {
        const res = await fetch('http://localhost:8080/api/productos/menos/low');
        const datos = await res.json();
        
        const contenedorLista = document.getElementById('lista-low-productos');
        if(contenedorLista) {
            contenedorLista.innerHTML = datos.slice(0, 4).map(p => {
                const nombre = p.nombre_producto || p.nombre || "Producto";
                const stock = p.total || p.stock || Object.values(p).pop() || 0;
                return `
                    <div class="flex justify-between items-center p-3 bg-red-50/50 rounded-xl border border-red-100/50">
                        <span class="text-sm font-bold text-neutral-800">${nombre}</span>
                        <span class="text-xs font-black text-red-600 bg-white px-3 py-1 rounded-full shadow-sm">${stock} uds</span>
                    </div>`;
            }).join('');
        }

        const ctx = document.getElementById('chartLow').getContext('2d');
        chartLow = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: datos.slice(0, 5).map(p => p.nombre_producto || p.nombre || "S/N"),
                datasets: [{ data: datos.slice(0, 5).map(p => p.total || p.stock || Object.values(p).pop() || 0), backgroundColor: ['#121212', '#D4AF37', '#E5E5E5', '#ba1a1a', '#747878'], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { size: 10, family: 'Inter', weight: '600' } } } } }
        });
    } catch (e) { console.error(e); }
}

// 5. GENERAR EL PDF
window.descargarReporte = async function() {
    if (!chartIngresos || !chartFrecuencia || !chartLow || !imgTopBase64) {
        if(typeof mostrarToast === 'function') mostrarToast("Aún hay gráficas cargando, por favor intenta en un segundo.", "warning");
        return;
    }
    
    if(typeof mostrarToast === 'function') mostrarToast("Conectando con el servidor...", "info");
    
    let usuarioLogeado = "Admin";
    try {
        const usuarioStorage = localStorage.getItem("usuario");
        if (usuarioStorage) { usuarioLogeado = JSON.parse(usuarioStorage).nombre || "Admin"; }
    } catch (e) {}

    // Formato base nativo sin compresiones extrañas para evitar fallos en Java
    const payload = {
        imgTop: imgTopBase64, 
        imgIngresos: chartIngresos.toBase64Image(),
        imgVentas: chartFrecuencia.toBase64Image(),
        imgLow: chartLow.toBase64Image(),
        usuario: usuarioLogeado
    };

    try {
        const res = await fetch("http://localhost:8080/api/reportes/generar-pdf", {
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            if(typeof mostrarToast === 'function') mostrarToast("¡Reporte generado con éxito!", "success");
            const blob = await res.blob();
            setTimeout(() => { window.open(window.URL.createObjectURL(blob), "_blank"); }, 1000);
        } else { 
            if(typeof mostrarToast === 'function') mostrarToast("Error interno en el servidor Java", "error"); 
        }
    } catch (e) { 
        if(typeof mostrarToast === 'function') mostrarToast("Error de red al conectar con Java", "error"); 
    }
};