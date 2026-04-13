document.addEventListener('DOMContentLoaded', () => {
    const API_LOTES = "http://localhost:8080/api/lotes"; // Ajusta a tu endpoint
    const API_PRODUCTOS = "http://localhost:8080/api/productos"; 
    
    const formLote = document.getElementById('form-lote');
    const selectProducto = document.getElementById('producto');
    const tablaLotes = document.querySelector('.admin-table tbody');

    // 1. Cargar lista de productos para el select
    fetch(API_PRODUCTOS)
        .then(res => res.json())
        .then(productos => {
            selectProducto.innerHTML = '<option value="">Seleccionar producto...</option>';
            productos.forEach(p => {
                selectProducto.innerHTML += `<option value="${p.id_producto}">${p.nombre} - ${p.marca}</option>`;
            });
        });

    // 2. Cargar tabla de lotes existentes
    function cargarLotes() {
        fetch(API_LOTES)
            .then(res => res.json())
            .then(lotes => {
                tablaLotes.innerHTML = "";
                lotes.forEach(l => {
                    const fechaVenc = new Date(l.fechaCaducidad).toLocaleDateString();
                    const statusClass = l.stock_lote <= 0 ? 'danger' : (l.stock_lote < 10 ? 'warning' : 'success');
                    
                    tablaLotes.innerHTML += `
                        <tr>
                            <td>
                                <div class="prod-info">
                                    <span class="name">${l.producto.nombre}</span>
                                    <span class="brand">${l.producto.marca}</span>
                                </div>
                            </td>
                            <td><code class="lote-tag">${l.codigoLote}</code></td>
                            <td><span class="status-pill ${statusClass}">${fechaVenc}</span></td>
                            <td><b>${l.stockLote} Unidades</b></td>
                            <td class="text-right">
                                <div class="action-btns">
                                    <button class="btn-action delete" onclick="eliminarLote(${l.idLote})"><i class="ph ph-trash"></i></button>
                                </div>
                            </td>
                        </tr>`;
                });
            });
    }

    // 3. Registrar nuevo lote
    formLote.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nuevoLote = {
            id_producto: parseInt(selectProducto.value),
            codigo_lote: document.getElementById('codigo_lote').value,
            fecha_ingreso: document.getElementById('fecha_ingreso').value,
            fecha_caducidad: document.getElementById('fecha_caducidad').value,
            stock_lote: parseInt(document.getElementById('stock_lote').value)
        };

        try {
            const response = await fetch(API_LOTES, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoLote)
            });

            if (response.ok) {
                alert("¡Lote registrado con éxito!");
                formLote.reset();
                cargarLotes(); // Recargar tabla
            } else {
                alert("Error al registrar lote");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        }
    });

    cargarLotes();
});

// 🔹 NUEVA FUNCIÓN: Filtrar lotes por fecha
async function filtrarPorFecha() {
    const fecha = document.getElementById("filtro-fecha").value;
    const tablaLotes = document.querySelector('.admin-table tbody');

    if (!fecha) {
        alert("Por favor, selecciona una fecha para filtrar.");
        return;
    }

    // Usamos el endpoint que creamos en ProductoController
    const URL_FILTRO = `http://localhost:8080/api/productos/lotes/filtrar?fecha=${fecha}`;

    try {
        const res = await fetch(URL_FILTRO);
        const lotes = await res.json();

        tablaLotes.innerHTML = ""; // Limpiar tabla

        if (lotes.length === 0) {
            tablaLotes.innerHTML = `<tr><td colspan="5" class="text-center">No hay lotes que venzan el ${fecha}</td></tr>`;
            return;
        }

        // Pintamos los resultados (usando tu misma lógica de diseño)
        lotes.forEach(l => {
            const fechaVenc = new Date(l.fechaCaducidad).toLocaleDateString();
            const statusClass = l.stockLote <= 0 ? 'danger' : (l.stockLote < 10 ? 'warning' : 'success');
            
            tablaLotes.innerHTML += `
                <tr>
                    <td>
                        <div class="prod-info">
                            <span class="name">${l.producto.nombre}</span>
                            <span class="brand">${l.producto.marca}</span>
                        </div>
                    </td>
                    <td><code class="lote-tag">${l.codigoLote}</code></td>
                    <td><span class="status-pill ${statusClass}">${fechaVenc}</span></td>
                    <td><b>${l.stockLote} Unidades</b></td>
                    <td class="text-right">
                        <div class="action-btns">
                            <button class="btn-action delete" onclick="eliminarLote(${l.idLote})">
                                <i class="ph ph-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
        });
    } catch (error) {
        console.error("Error al filtrar:", error);
        alert("Error de conexión con el servidor.");
    }
}