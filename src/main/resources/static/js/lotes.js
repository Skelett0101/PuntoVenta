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
				procesarAlertasReales(lotes);
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

	// Función para mostrar/ocultar el panel de alertas
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

	// Mantenemos tus funciones de alertas pero conectadas al contenedor
	function mostrarNotificacion(mensaje, tipo) {
	    const contenedor = document.getElementById('notification-container');
	    const icono = tipo === 'danger' ? 'ph-warning-octagon' : 'ph-bell-ringing';
	    
	    const alerta = document.createElement('div');
	    alerta.className = `kpi-card alert-${tipo}`;
	    alerta.style.cssText = "display:flex; align-items:center; gap:15px; padding:15px; margin-bottom:10px; border-radius:8px;";
	    
	    alerta.innerHTML = `
	        <div class="kpi-icon"><i class="ph-bold ${icono}"></i></div>
	        <div class="kpi-info">
	            <h4 style="margin:0; font-size:14px;">Aviso de Sistema</h4>
	            <p style="margin:0; font-size:13px;">${mensaje}</p>
	        </div>
	    `;
	    contenedor.appendChild(alerta);
	}

	function procesarAlertasReales(lotes) {
	    const hoy = new Date("2026-04-12"); 
	    const contenedor = document.getElementById('notification-container');
	    contenedor.innerHTML = ""; 

	    lotes.forEach(l => {
	        const fechaCad = new Date(l.fechaCaducidad);
	        const difTiempo = fechaCad - hoy;
	        const difDias = Math.ceil(difTiempo / (1000 * 60 * 60 * 24));

	        if (difDias <= 0) {
	            mostrarNotificacion(`El lote ${l.codigoLote} (${l.producto.nombre}) ya CADUCÓ.`, "danger");
	        } else if (difDias <= 7) {
	            mostrarNotificacion(`El lote ${l.codigoLote} (${l.producto.nombre}) vence en ${difDias} días.`, "warning");
	        }
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