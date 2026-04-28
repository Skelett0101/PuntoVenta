let lotesCompletos = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarProductosSelect();
    cargarLotes();

    // Evento para guardar Lote (POST)
    const formLote = document.querySelector('form');
    if (formLote) {
        formLote.addEventListener('submit', guardarLote);
    }

    // Filtros de búsqueda
    const buscador = document.getElementById('buscador-lote');
    if (buscador) buscador.addEventListener('input', filtrarTabla);

    const filtroFecha = document.getElementById('filtro-fecha');
    if (filtroFecha) filtroFecha.addEventListener('change', filtrarTabla);
});

// ==========================================
// 1. CARGAR PRODUCTOS EN EL SELECT
// ==========================================
async function cargarProductosSelect() {
    try {
        const res = await fetch("http://localhost:8080/api/productos");
        const productos = await res.json();
        const select = document.getElementById('producto');
        
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccionar producto...</option>';
        productos.forEach(p => {
            const nombre = p.nombre_producto || p.nombre || "Sin Nombre";
            const marca = p.marca || "S/M";
            const id = p.id_producto || p.idProducto; 
            
            select.innerHTML += `<option value="${id}">${nombre} (${marca})</option>`;
        });
    } catch (e) {
        console.error("Error al cargar productos:", e);
    }
}

// ==========================================
// 2. CARGAR Y DIBUJAR LOS LOTES EN LA TABLA
// ==========================================
window.cargarLotes = async function() {
    try {
        const res = await fetch("http://localhost:8080/api/lotes");
        lotesCompletos = await res.json();
        renderizarTabla(lotesCompletos);
    } catch (e) {
        console.error("Error cargando lotes:", e);
    }
}

window.renderizarTabla = function(listaLotes) {
    const tbody = document.getElementById('tablaLotesBody');
    if (!tbody) return;

    tbody.innerHTML = "";
    
    const datos = listaLotes || lotesCompletos;

    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-neutral-400 italic">No hay lotes registrados o coincidiendo con la búsqueda.</td></tr>`;
        return;
    }

    datos.forEach(lote => {
        const idLote = lote.idLote || lote.id_lote;
        const codLote = lote.codigoLote || lote.codigo_lote || "S/C";
        const stock = lote.stockLote || lote.stock_lote || 0;
        const fechaCad = lote.fechaCaducidad || lote.fecha_caducidad;
        
        const producto = lote.producto || {};
        const nombreProd = producto.nombre_producto || producto.nombre || "Desconocido";
        const marcaProd = producto.marca || "Generico";

        // Formateo de Fecha
        const fechaObj = new Date(fechaCad + "T00:00:00");
        const caducidadStr = fechaObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

        // Lógica de colores para Vencimiento
        const hoy = new Date();
        const difDias = Math.ceil((fechaObj - hoy) / (1000 * 60 * 60 * 24));
        
        let pillClass = "bg-surface-container-high text-on-surface-variant border border-outline-variant/50";
        if (difDias <= 0) {
            pillClass = "bg-error-container text-on-error-container border border-error/20 font-black";
        } else if (difDias <= 15) {
            pillClass = "bg-secondary-container text-on-secondary-container border border-secondary/20 font-bold";
        }

        const tr = document.createElement('tr');
        tr.className = "border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors";
        
        tr.innerHTML = `
            <td class="py-4 px-2">
                <div class="flex flex-col">
                    <span class="text-sm font-bold text-neutral-900">${nombreProd}</span>
                    <span class="text-[11px] text-neutral-400">${marcaProd}</span>
                </div>
            </td>
            <td class="py-4 px-2">
                <span class="font-mono text-[11px] tracking-wider text-neutral-500 bg-surface-container-high px-2 py-1 rounded-md border border-neutral-200">
                    ${codLote}
                </span>
            </td>
            <td class="py-4 px-2">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${pillClass}">
                    ${caducidadStr}
                </span>
            </td>
            <td class="py-4 px-2">
                <span class="text-sm font-bold text-neutral-900">${stock} uds</span>
            </td>
            <td class="py-4 px-2 text-right">
                <div class="flex justify-end gap-2">
                    <button onclick="eliminarLote(${idLote})" class="p-1.5 text-neutral-400 hover:text-error hover:bg-error-container/50 rounded-lg transition-all" title="Eliminar Lote">
                        <span class="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================
// 3. REGISTRAR UN NUEVO LOTE (POST)
// ==========================================
async function guardarLote(e) {
    e.preventDefault();

    const idProductoSelect = document.getElementById('producto').value;
    if (!idProductoSelect) {
        if(typeof mostrarToast === 'function') mostrarToast("Debes seleccionar un producto", "warning");
        return;
    }

    // PAYLOAD UNIVERSAL
    const payload = {
        id_producto: parseInt(idProductoSelect),
        codigo_lote: document.getElementById('codigo_lote').value.trim(),
        fecha_ingreso: document.getElementById('fecha_ingreso').value,
        fecha_caducidad: document.getElementById('fecha_caducidad').value,
        stock_lote: parseInt(document.getElementById('stock_lote').value),

        producto: { id_producto: parseInt(idProductoSelect), idProducto: parseInt(idProductoSelect) }, 
        codigoLote: document.getElementById('codigo_lote').value.trim(),
        fechaIngreso: document.getElementById('fecha_ingreso').value,
        fechaCaducidad: document.getElementById('fecha_caducidad').value,
        stockLote: parseInt(document.getElementById('stock_lote').value)
    };

    try {
        const response = await fetch("http://localhost:8080/api/lotes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            if(typeof mostrarToast === 'function') mostrarToast("Lote registrado con éxito", "success");
            document.querySelector('form').reset();
            cargarLotes(); 
            if(typeof cargarNotificacionesGlobales === 'function') cargarNotificacionesGlobales();
        } else {
            const errorTxt = await response.text();
            if(typeof mostrarToast === 'function') mostrarToast("Error al registrar: " + errorTxt, "error");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

// ==========================================
// 4. ELIMINAR LOTE (DELETE)
// ==========================================
window.eliminarLote = async function(idLote) {
    if (confirm("¿Estás seguro de que deseas eliminar este lote del sistema?")) {
        try {
            const res = await fetch(`http://localhost:8080/api/lotes/${idLote}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                if(typeof mostrarToast === 'function') mostrarToast("Lote eliminado", "success");
                cargarLotes();
                if(typeof cargarNotificacionesGlobales === 'function') cargarNotificacionesGlobales();
            } else {
                if(typeof mostrarToast === 'function') mostrarToast("No se pudo eliminar el lote", "error");
            }
        } catch (e) {
            console.error("Error al eliminar:", e);
        }
    }
};

// ==========================================
// 5. BUSCADOR Y FILTRO DE FECHAS
// ==========================================
window.filtrarTabla = function() {
    const textoBuscador = document.getElementById('buscador-lote')?.value.toLowerCase() || "";
    const fechaFiltro = document.getElementById('filtro-fecha')?.value || "";

    const lotesFiltrados = lotesCompletos.filter(l => {
        const nombre = (l.producto?.nombre_producto || l.producto?.nombre || "").toLowerCase();
        const codigo = (l.codigoLote || l.codigo_lote || "").toLowerCase();
        const caducidad = l.fechaCaducidad || l.fecha_caducidad || "";

        const pasaTexto = nombre.includes(textoBuscador) || codigo.includes(textoBuscador);
        const pasaFecha = fechaFiltro === "" || caducidad === fechaFiltro;

        return pasaTexto && pasaFecha;
    });

    renderizarTabla(lotesFiltrados);
};