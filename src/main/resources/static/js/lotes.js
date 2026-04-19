document.addEventListener('DOMContentLoaded', () => {
    const API_LOTES = "http://localhost:8080/api/lotes"; 
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
                
                // Procesar alertas con los datos reales
                window.procesarAlertasReales(lotes);
                
                lotes.forEach(l => {
                    const fechaVenc = new Date(l.fechaCaducidad + "T00:00:00").toLocaleDateString();
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
                cargarLotes(); 
            } else {
                alert("Error al registrar lote");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        }
    });

    cargarLotes();
});

// --- FUNCIONES GLOBALES DE NOTIFICACIONES ---

window.toggleAlertas = function() {
    const panel = document.getElementById('notification-container');
    if (panel.style.display === "none" || panel.style.display === "") {
        panel.style.display = "block";
    } else {
        panel.style.display = "none";
    }
};

window.mostrarNotificacion = function(mensaje, tipo) {
    const contenedor = document.getElementById('notification-container');
    if(!contenedor) return;

    const icono = tipo === 'danger' ? 'ph-warning-octagon' : 'ph-bell-ringing';
    const color = tipo === 'danger' ? '#ef4444' : '#f59e0b';
    const bg = tipo === 'danger' ? '#fef2f2' : '#fffbeb';

    const alerta = document.createElement('div');
    alerta.style.cssText = `
        display: flex; 
        align-items: center; 
        gap: 12px; 
        padding: 10px; 
        margin-bottom: 8px; 
        border-radius: 8px; 
        background: ${bg}; 
        border-left: 4px solid ${color};
        animation: slideIn 0.3s ease-out;
    `;
    
    alerta.innerHTML = `
        <i class="ph-bold ${icono}" style="font-size: 1.2rem; color: ${color};"></i>
        <div style="flex: 1;">
            <p style="margin: 0; font-size: 12px; font-weight: 600; color: #1e293b;">Aviso de Sistema</p>
            <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.2;">${mensaje}</p>
        </div>
    `;
    contenedor.appendChild(alerta);
};

window.procesarAlertasReales = function(lotes) {
    const hoy = new Date("2026-04-12"); 
    const contenedor = document.getElementById('notification-container');
    if(!contenedor) return;
    
    contenedor.innerHTML = ""; 

    lotes.forEach(l => {
        const fechaCad = new Date(l.fechaCaducidad);
        const difTiempo = fechaCad - hoy;
        const difDias = Math.ceil(difTiempo / (1000 * 60 * 60 * 24));

        if (difDias <= 0) {
            window.mostrarNotificacion(`El lote ${l.codigoLote} (${l.producto.nombre}) ya CADUCÓ.`, "danger");
        } else if (difDias <= 7) {
            window.mostrarNotificacion(`El lote ${l.codigoLote} (${l.producto.nombre}) vence en ${difDias} días.`, "warning");
        }
    });
};


// --- FUNCIONES GLOBALES DE FILTRO Y BÚSQUEDA ---

async function filtrarPorFecha() {
    const fecha = document.getElementById("filtro-fecha").value;
    const tablaLotes = document.querySelector('.admin-table tbody');

    if (!fecha) {
        alert("Por favor, selecciona una fecha para filtrar.");
        return;
    }

    const URL_FILTRO = `http://localhost:8080/api/productos/lotes/filtrar?fecha=${fecha}`;

    try {
        const res = await fetch(URL_FILTRO);
        const lotes = await res.json();

        tablaLotes.innerHTML = ""; 

        if (lotes.length === 0) {
            tablaLotes.innerHTML = `<tr><td colspan="5" class="text-center">No hay lotes que venzan el ${fecha}</td></tr>`;
            return;
        }

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
} // <- ¡ESTA LLAVE ES LA QUE FALTABA!


// --- FUNCIÓN GLOBAL PARA ELIMINAR LOTE ---

window.eliminarLote = async function(idLote) {
    // 1. Mostrar mensaje de confirmación
    const confirmacion = confirm(`⚠️ ¿Estás seguro de que deseas eliminar TODO este lote (ID: ${idLote}) de la base de datos?\nEsta acción no se puede deshacer.`);
    
    if (confirmacion) {
        try {
            // 2. Hacer la petición DELETE a la API
            const response = await fetch(`http://localhost:8080/api/lotes/${idLote}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("✅ Lote eliminado correctamente.");
                
                // 3. Opción dinámica: recargar la página o recargar la tabla
                // La forma más fácil para que todo (gráficas y alertas) se actualice:
                location.reload(); 
                
                // (Si tuvieras la función cargarLotes() global, podrías llamarla aquí 
                // en lugar de location.reload() para no parpadear la página)
            } else {
                alert("❌ Error: No se pudo eliminar el lote. Verifica si tiene productos vendidos asociados.");
            }
        } catch (error) {
            console.error("Error al intentar eliminar:", error);
            alert("❌ Error de conexión con el servidor.");
        }
    }
};

// Búsqueda en tiempo real por código de lote
document.getElementById('buscador-lote').addEventListener('keyup', function() {
    const textoBusqueda = this.value.toLowerCase();
    const filasTabla = document.querySelectorAll('.admin-table tbody tr');

    filasTabla.forEach(fila => {
        const celdaLote = fila.querySelectorAll('td')[1]; 
        
        if (celdaLote) {
            const codigoLote = celdaLote.textContent.toLowerCase();
            if (codigoLote.includes(textoBusqueda)) {
                fila.style.display = '';
            } else {
                fila.style.display = 'none';
            }
        }
    });
});