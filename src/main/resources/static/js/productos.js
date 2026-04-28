const URL = "http://localhost:8080/api/productos";
const URL_CATEGORIAS = "http://localhost:8080/api/productos/categorias-unicas";

let productosGlobales = []; // Guardará los productos para que el buscador funcione rápido

document.addEventListener("DOMContentLoaded", () => {
    cargarCategorias();
    cargarProductos();
    
    // Conectamos los formularios
    const formRegistro = document.getElementById("form-producto");
    if(formRegistro) formRegistro.addEventListener("submit", guardarProducto); 
    
    const formEditar = document.getElementById("form-editar");
    if(formEditar) formEditar.addEventListener("submit", actualizarProductoDesdeModal); 

    // Conectamos el Buscador en Vivo
    const buscador = document.getElementById("buscador-producto");
    if(buscador) {
        buscador.addEventListener("input", (e) => {
            filtrarProductos(e.target.value);
        });
    }
});

// --- CARGAR CATEGORÍAS ---
async function cargarCategorias() {
    try {
        const res = await fetch(URL_CATEGORIAS);
        const categorias = await res.json(); 
        const selectRegistro = document.getElementById("categoria");
        const selectEditar = document.getElementById("edit_categoria");

        let html = '<option value="" disabled selected>Selecciona una categoría</option>';
        categorias.forEach(cat => { html += `<option value="${cat}">${cat}</option>`; });

        if (selectRegistro) selectRegistro.innerHTML = html;
        if (selectEditar) selectEditar.innerHTML = html;
    } catch (error) { 
        console.error("Error categorías:", error); 
    }
}

// --- LISTAR PRODUCTOS Y DIBUJAR TABLA ---
async function cargarProductos() {
    try {
        const res = await fetch(URL);
        productosGlobales = await res.json();
        renderizarTablaProductos(productosGlobales);
    } catch (error) { 
        console.error("Error tabla:", error); 
        if(typeof mostrarToast === 'function') mostrarToast("Error al cargar el catálogo de productos", "error");
    }
}

function renderizarTablaProductos(productos) {
    const tabla = document.getElementById("tabla-productos");
    if (!tabla) return; 
    
    tabla.innerHTML = "";
    
    if (productos.length === 0) {
        tabla.innerHTML = `<tr><td colspan="5" class="py-10 text-center text-neutral-400 italic">No se encontraron productos.</td></tr>`;
        return;
    }

    productos.forEach(p => {
        // Colores de las etiquetas de categoría
        let catColor = "bg-zinc-100 text-zinc-600 border border-zinc-200";
        if (p.categoria === 'Bebidas') catColor = "bg-secondary-container text-on-secondary-container";
        if (p.categoria === 'Lácteos') catColor = "bg-blue-100 text-blue-800 border-blue-200";

        // Asegurar que las variables coincidan con lo que manda Java
        const idProd = p.id_producto || p.idProducto;
        const precioVenta = p.precio_venta || p.precioVenta || 0;

        tabla.innerHTML += `
            <tr class="hover:bg-zinc-50 transition-colors group">
                <td class="px-8 py-5 text-sm text-zinc-400 font-mono">#${String(idProd).padStart(3, '0')}</td>
                <td class="px-8 py-5">
                    <div class="flex flex-col">
                        <span class="font-semibold text-primary">${p.nombre}</span>
                        <span class="text-xs text-outline">${p.marca} - ${p.capacidad}</span>
                    </div>
                </td>
                <td class="px-8 py-5"><span class="px-3 py-1 rounded-full ${catColor} text-[10px] font-bold uppercase">${p.categoria}</span></td>
                <td class="px-8 py-5 text-right font-bold text-primary">$${precioVenta.toFixed(2)}</td>
                <td class="px-8 py-5 text-center">
                    <div class="flex justify-center gap-2">
                        <button type="button" class="p-2 text-zinc-400 hover:text-secondary bg-white hover:bg-secondary-container/50 border border-zinc-100 shadow-sm rounded-lg transition-all" onclick="editarProd(${idProd})" title="Editar">
                            <span class="material-symbols-outlined text-[18px]">edit_square</span>
                        </button>
                        <button type="button" class="p-2 text-zinc-400 hover:text-error bg-white hover:bg-error-container/50 border border-zinc-100 shadow-sm rounded-lg transition-all" onclick="eliminarProd(${idProd})" title="Eliminar">
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>
                </td>
            </tr>`;
    });
}

// --- BUSCADOR EN VIVO ---
function filtrarProductos(texto) {
    texto = texto.toLowerCase();
    const filtrados = productosGlobales.filter(p => 
        p.nombre.toLowerCase().includes(texto) || 
        (p.marca && p.marca.toLowerCase().includes(texto)) ||
        (p.categoria && p.categoria.toLowerCase().includes(texto))
    );
    renderizarTablaProductos(filtrados);
}

// --- GUARDAR (POST) ---
async function guardarProducto(event) {
    event.preventDefault();
    
    if(typeof mostrarToast === 'function') mostrarToast("Guardando producto...", "info");

    const producto = {
        nombre: document.getElementById("nombre").value,
        marca: document.getElementById("marca").value,
        categoria: document.getElementById("categoria").value,
        capacidad: document.getElementById("capacidad").value,
        precio_compra: parseFloat(document.getElementById("precio_compra").value),
        precio_venta: parseFloat(document.getElementById("precio_venta").value),
        descripcion: document.getElementById("descripcion").value
    };

    try {
        const res = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto)
        });

        if (res.ok) {
            document.getElementById("form-producto").reset();
            cargarProductos();
            if(typeof mostrarToast === 'function') mostrarToast("¡Producto guardado exitosamente!", "success");
        } else {
            if(typeof mostrarToast === 'function') mostrarToast("Error al guardar el producto en el servidor", "error");
        }
    } catch (error) {
        if(typeof mostrarToast === 'function') mostrarToast("Error de red al conectar con Java", "error");
    }
}

// --- EDITAR (Cargar datos al Modal) ---
window.editarProd = async function(id) {
    try {
        const res = await fetch(`${URL}/${id}`);
        if (res.ok) {
            const p = await res.json();
            document.getElementById("edit_id_producto").value = p.id_producto || p.idProducto;
            document.getElementById("edit_nombre").value = p.nombre;
            document.getElementById("edit_marca").value = p.marca;
            document.getElementById("edit_categoria").value = p.categoria;
            document.getElementById("edit_capacidad").value = p.capacidad;
            document.getElementById("edit_precio_compra").value = p.precio_compra || p.precioCompra;
            document.getElementById("edit_precio_venta").value = p.precio_venta || p.precioVenta;
            document.getElementById("edit_descripcion").value = p.descripcion;

            const modal = document.getElementById("modal-editar");
            modal.classList.remove("hidden");
            modal.style.display = "flex";
        }
    } catch(error) {
        if(typeof mostrarToast === 'function') mostrarToast("Error al obtener los datos del producto", "error");
    }
}

// --- ACTUALIZAR (PUT) ---
async function actualizarProductoDesdeModal(event) {
    event.preventDefault();
    const id = document.getElementById("edit_id_producto").value;
    const producto = {
        nombre: document.getElementById("edit_nombre").value,
        marca: document.getElementById("edit_marca").value,
        categoria: document.getElementById("edit_categoria").value,
        capacidad: document.getElementById("edit_capacidad").value,
        precio_compra: parseFloat(document.getElementById("edit_precio_compra").value),
        precio_venta: parseFloat(document.getElementById("edit_precio_venta").value),
        descripcion: document.getElementById("edit_descripcion").value
    };

    if(typeof mostrarToast === 'function') mostrarToast("Actualizando...", "info");

    try {
        const res = await fetch(`${URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto)
        });

        if (res.ok) {
            cerrarModal();
            cargarProductos();
            if(typeof mostrarToast === 'function') mostrarToast("¡Producto actualizado con éxito!", "success");
        } else {
            if(typeof mostrarToast === 'function') mostrarToast("Error al actualizar el producto", "error");
        }
    } catch (error) {
        if(typeof mostrarToast === 'function') mostrarToast("Error de conexión", "error");
    }
}

// --- CERRAR MODAL ---
window.cerrarModal = function() {
    const modal = document.getElementById("modal-editar");
    modal.classList.add("hidden");
    modal.style.display = "none";
}

// --- ELIMINAR (DELETE) ---
window.eliminarProd = async function(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
        try {
            const res = await fetch(`${URL}/${id}`, { method: 'DELETE' });
            if(res.ok) {
                cargarProductos();
                if(typeof mostrarToast === 'function') mostrarToast("Producto eliminado correctamente", "success");
            } else {
                if(typeof mostrarToast === 'function') mostrarToast("No se pudo eliminar. Posiblemente esté asociado a un Lote o Venta.", "error");
            }
        } catch (error) {
            if(typeof mostrarToast === 'function') mostrarToast("Error de red", "error");
        }
    }
}