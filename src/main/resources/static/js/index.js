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
            type: 'line', 
            data: {
                labels: datos.map(item => item.fecha || Object.values(item)[0]),
                datasets: [{
                    label: 'Tickets',
                    data: datos.map(item => item.cantidad || item.count || Object.values(item)[1] || 0),
                    borderColor: '#2563eb', // Azul
                    backgroundColor: 'rgba(37, 99, 235, 0.1)', // Sombreado azul transparente
                    fill: true,
                    tension: 0.4, // Curva suave
                    pointRadius: 4, // Tamaño de los puntos
                    pointBackgroundColor: '#2563eb'
                }]
            },
            options: { 
                responsive: true, 
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
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
            type: 'line', // Cambiado explícitamente a línea
            data: {
                labels: datos.map(item => item.fecha || Object.values(item)[0]),
                datasets: [{
                    label: 'Ingresos ($)',
                    data: datos.map(item => item.total || item.monto || Object.values(item)[1] || 0),
                    borderColor: '#10b981', // Verde
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Sombreado verde transparente
                    fill: true,
                    tension: 0.4, // Misma suavidad que la de arriba
                    pointRadius: 4, // Mismos puntos
                    pointBackgroundColor: '#10b981'
                }]
            },
            options: { 
                responsive: true, 
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
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