document.addEventListener('DOMContentLoaded', () => {
    cargarGraficaTop();
    cargarGraficaLow();
});

async function cargarGraficaTop() {
    try {
        const response = await fetch('http://localhost:8080/api/productos/mas/top');
        const datos = await response.json();

        const ctx = document.getElementById('chartTop').getContext('2d');
        new Chart(ctx, {
            type: 'bar', // Gráfico de barras
            data: {
                labels: datos.map(item => item.nombre),
                datasets: [{
                    label: 'Unidades',
                    data: datos.map(item => item.total),
                    backgroundColor: '#4f46e5', // Color índigo elegante
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } }
            }
        });
    } catch (e) { console.error("Error cargando Top:", e); }
}

async function cargarGraficaLow() {
    try {
        const response = await fetch('http://localhost:8080/api/productos/menos/low');
        const datos = await response.json();

        const ctx = document.getElementById('chartLow').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: datos.map(item => item.nombre),
                datasets: [{
                    label: 'Unidades',
                    data: datos.map(item => item.total),
                    backgroundColor: '#f43f5e', // Color rosado/rojo para alertas
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } }
            }
        });
    } catch (e) { console.error("Error cargando Low:", e); }
}