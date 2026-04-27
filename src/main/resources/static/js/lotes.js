let lotesCompletos = [];
let paginaActual = 1;
const filasPorPagina = 5;

document.addEventListener('DOMContentLoaded', () => {
    const API_LOTES = "http://localhost:8080/api/lotes";
    const API_PRODUCTOS = "http://localhost:8080/api/productos";
    
    const tablaLotesBody = document.getElementById('tablaLotesBody');
    const selectProducto = document.getElementById('producto');
    const formLote = document.querySelector('form');

    // 1. Cargar Productos en el Select
    fetch(API_PRODUCTOS)
        .then(res => res.json())
        .then(productos => {
            selectProducto.innerHTML = '<option value="">Seleccionar producto...</option>';
            productos.forEach(p => {
                // Ajustado a 'nombre_producto' según tu log de Hibernate
                const nombre = p.nombre_producto || p.nombre;
                selectProducto.innerHTML += `<option value="${p.id_producto}">${nombre} - ${p.marca}</option>`;
            });
        });

    // =========================================================
    // NUEVA PARTE: ESCUCHADOR PARA GUARDAR (POST)
    // =========================================================
    formLote.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Creamos el objeto exactamente como lo espera tu Map<String, Object> en Java
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
                alert("✅ Lote registrado con éxito");
                formLote.reset(); // Limpia el formulario
                cargarLotes();    // Refresca la tabla automáticamente
            } else {
                const errorMsg = await response.text();
                alert("❌ Error: " + errorMsg);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });
    // =========================================================

    // 2. Cargar Lotes
    window.cargarLotes = function() {
        fetch(API_LOTES)
            .then(res => res.json())
            .then(data => {
                lotesCompletos = data;
                renderizarTabla();
            });
    }

    // 3. Dibujar Tabla con diseño Premium
    window.renderizarTabla = function() {
        if (!tablaLotesBody) return;
        tablaLotesBody.innerHTML = "";

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const visibles = lotesCompletos.slice(inicio, fin);

        visibles.forEach(l => {
            // Manejo de nombres de campos según vengan del backend (camelCase o snake_case)
            const fCad = l.fechaCaducidad || l.fecha_caducidad;
            const fIng = l.fechaIngreso || l.fecha_ingreso;
            const stock = l.stockLote || l.stock_lote;
            const cod = l.codigoLote || l.codigo_lote;
            const id = l.idLote || l.id_lote;

            const fecha = new Date(fCad + "T00:00:00");
            const fechaFormateada = fecha.toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' }).toUpperCase();
            
            const hoy = new Date();
            const dif = (fecha - hoy) / (1000 * 60 * 60 * 24);
            let pillClase = "bg-neutral-100 text-neutral-600 border-neutral-200";
            
            if (dif < 0) pillClase = "bg-error-container text-on-error-container";
            else if (dif < 15) pillClase = "bg-secondary-container text-on-secondary-container";

            const loteData = btoa(JSON.stringify(l));

            tablaLotesBody.innerHTML += `
                <tr class="hover:bg-neutral-50 transition-colors group">
                    <td class="py-6 px-2">
                        <div class="flex items-center gap-3">
                            <div class="flex flex-col">
                                <span class="font-semibold text-primary">${l.producto.nombre_producto || l.producto.nombre}</span>
                                <small class="text-neutral-500">${l.producto.marca}</small>
                            </div>
                        </div>
                    </td>
                    <td class="py-6 px-2 font-mono text-sm text-outline">${cod}</td>
                    <td class="py-6 px-2">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${pillClase}">${fechaFormateada}</span>
                    </td>
                    <td class="py-6 px-2 font-semibold">${stock.toLocaleString()} uds</td>
                    <td class="py-6 px-2 text-right">
                        <div class="flex justify-end gap-2">
                            <button onclick="prepararEdicion('${loteData}')" class="text-outline hover:text-secondary transition-colors">
                                <span class="material-symbols-outlined">edit_square</span>
                            </button>
                            <button onclick="eliminarLote(${id})" class="text-outline hover:text-error transition-colors">
                                <span class="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </td>
                </tr>`;
        });
        actualizarPaginacion();
    };

    // Función para eliminar
    window.eliminarLote = async function(id) {
        if(confirm("¿Seguro que deseas eliminar este lote?")) {
            const res = await fetch(`${API_LOTES}/${id}`, { method: 'DELETE' });
            if(res.ok) cargarLotes();
        }
    }

    // Función para autocompletar al editar
    window.prepararEdicion = function(base64) {
        const lote = JSON.parse(atob(base64));
        const fCad = lote.fechaCaducidad || lote.fecha_caducidad;
        const fIng = lote.fechaIngreso || lote.fecha_ingreso;
        const stock = lote.stockLote || lote.stock_lote;
        const cod = lote.codigoLote || lote.codigo_lote;

        document.getElementById('producto').value = lote.producto.id_producto;
        document.getElementById('codigo_lote').value = cod;
        document.getElementById('fecha_ingreso').value = fIng;
        document.getElementById('fecha_caducidad').value = fCad;
        document.getElementById('stock_lote').value = stock;
        
        const btn = document.querySelector('form button[type="submit"]');
        btn.innerHTML = "Actualizar Entrada";
        btn.classList.replace('bg-primary', 'bg-secondary');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    cargarLotes();
});

// Función de búsqueda
document.addEventListener('keyup', (e) => {
    if (e.target.id === 'buscador-lote') {
        const texto = e.target.value.toLowerCase();
        const filas = document.querySelectorAll('#tablaLotesBody tr');
        filas.forEach(f => {
            const contenido = f.innerText.toLowerCase();
            f.style.display = contenido.includes(texto) ? '' : 'none';
        });
    }
});

function actualizarPaginacion() {
    const info = document.querySelector(".mt-auto p");
    if (info) info.textContent = `Mostrando ${lotesCompletos.length} lotes registrados`;
}