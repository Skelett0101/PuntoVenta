document.addEventListener('DOMContentLoaded', () => {
    cargarGraficaTop();
    cargarGraficaLow();
    cargarGraficaFrecuenciaVentas();
    cargarGraficaIngresos();
});

// --- TUS GRÁFICAS DE VENTAS ---

async function cargarGraficaFrecuenciaVentas() {
    try {
        const response = await fetch('http://localhost:8080/api/venta/frecuencia');
        if (!response.ok) throw new Error("Error en la red");
        const datos = await response.json();
        
        const ctx = document.getElementById('chartVentas').getContext('2d');
        new Chart(ctx, {
            type: 'pie', // Cambiado a gráfica de pastel
            data: {
                labels: datos.map(item => item.fecha || Object.values(item)[0]),
                datasets: [{
                    label: 'Tickets',
                    data: datos.map(item => item.cantidad || item.count || Object.values(item)[1] || 0),
                    // Paleta de colores para cada rebanada del pastel
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
                        '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#6366f1'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff' // Borde blanco para separar las rebanadas
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                    legend: { 
                        display: true, 
                        position: 'right' // Mueve la leyenda a la derecha
                    } 
                }
                // Se eliminaron las opciones de "scales" (ejes Y/X) porque no aplican aquí
            }
        });
    } catch (e) { console.error("No se pudo cargar la frecuencia:", e); }
}

async function cargarGraficaIngresos() {
    try {
        const response = await fetch('http://localhost:8080/api/venta/ingresos');
        if (!response.ok) throw new Error("Error en la red");
        const datos = await response.json();

        const ctx = document.getElementById('chartIngresos').getContext('2d');
        new Chart(ctx, {
            type: 'pie', // Cambiado a gráfica de pastel
            data: {
                labels: datos.map(item => item.fecha || Object.values(item)[0]),
                datasets: [{
                    label: 'Ingresos ($)',
                    data: datos.map(item => item.total || item.monto || Object.values(item)[1] || 0),
                    // Paleta de colores (ligeramente distinta para diferenciar)
                    backgroundColor: [
                        '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
                        '#ef4444', '#06b6d4', '#14b8a6', '#f97316', '#6366f1'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                    legend: { 
                        display: true, 
                        position: 'right' 
                    } 
                }
            }
        });
    } catch (e) { console.error("No se pudieron cargar los ingresos:", e); }
}

// --- GRÁFICAS DE PRODUCTOS (Lógica de tus compañeros corregida) ---

async function cargarGraficaTop() {
    try {
        const response = await fetch('http://localhost:8080/api/productos/mas/top');
        const datos = await response.json();
        const ctx = document.getElementById('chartTop').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                // Usamos nombre_producto porque así sale en tu log de Hibernate
                labels: datos.map(item => item.nombre_producto || item.nombre || "Producto"),
                datasets: [{
                    label: 'Unidades',
                    data: datos.map(item => item.total || Object.values(item).pop()),
                    backgroundColor: '#4f46e5',
                    borderRadius: 5
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    } catch (e) { console.error("Error en Top:", e); }
}

async function cargarGraficaLow() {
    try {
        const response = await fetch('http://localhost:8080/api/productos/menos/low');
        const datos = await response.json();
        const ctx = document.getElementById('chartLow').getContext('2d');
        new Chart(ctx, {
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
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    } catch (e) { console.error("Error en Low:", e); }
}