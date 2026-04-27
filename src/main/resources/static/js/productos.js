const URL = "http://localhost:8080/api/productos";
const URL_CATEGORIAS = "http://localhost:8080/api/productos/categorias-unicas";

document.addEventListener("DOMContentLoaded", () => {
    cargarCategorias();
    cargarProductos();
    
    document.getElementById("form-producto").addEventListener("submit", guardarProducto); 
    document.getElementById("form-editar").addEventListener("submit", actualizarProductoDesdeModal); 
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
    } catch (error) { console.error("Error categorías:", error); }
}

// --- LISTAR PRODUCTOS ---
async function cargarProductos() {
    const tabla = document.getElementById("tabla-productos");
    if (!tabla) return; 

    try {
        const res = await fetch(URL);
        const productos = await res.json();
        tabla.innerHTML = "";

        productos.forEach(p => {
            let catColor = "bg-zinc-100 text-zinc-600";
            if (p.categoria === 'Bebidas') catColor = "bg-secondary-container text-on-secondary-container";
            if (p.categoria === 'Lácteos') catColor = "bg-primary-fixed text-on-primary-fixed";

            tabla.innerHTML += `
                <tr class="hover:bg-zinc-50 transition-colors group">
                    <td class="px-8 py-5 text-sm text-zinc-400">#${String(p.id_producto).padStart(3, '0')}</td>
                    <td class="px-8 py-5">
                        <div class="flex flex-col">
                            <span class="font-semibold">${p.nombre}</span>
                            <span class="text-xs text-outline">${p.marca} - ${p.capacidad}</span>
                        </div>
                    </td>
                    <td class="px-8 py-5"><span class="px-3 py-1 rounded-full ${catColor} text-[10px] font-bold uppercase">${p.categoria}</span></td>
                    <td class="px-8 py-5 text-right font-semibold">$${p.precio_venta.toFixed(2)}</td>
                    <td class="px-8 py-5 text-center">
                        <div class="flex justify-center gap-2">
                            <button type="button" class="p-2 text-zinc-400 hover:text-secondary" onclick="editarProd(${p.id_producto})">
                                <span class="material-symbols-outlined">edit</span>
                            </button>
                            <button type="button" class="p-2 text-zinc-400 hover:text-error" onclick="eliminarProd(${p.id_producto})">
                                <span class="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </td>
                </tr>`;
        });
    } catch (error) { console.error("Error tabla:", error); }
}

// --- GUARDAR (POST) ---
async function guardarProducto(event) {
    event.preventDefault();
    const producto = {
        nombre: document.getElementById("nombre").value,
        marca: document.getElementById("marca").value,
        categoria: document.getElementById("categoria").value,
        capacidad: document.getElementById("capacidad").value,
        precio_compra: parseFloat(document.getElementById("precio_compra").value),
        precio_venta: parseFloat(document.getElementById("precio_venta").value),
        descripcion: document.getElementById("descripcion").value
    };

    const res = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto)
    });

    if (res.ok) {
        document.getElementById("form-producto").reset();
        cargarProductos();
        alert("¡Producto guardado!");
    }
}

// --- EDITAR (Cargar datos al Modal) ---
async function editarProd(id) {
    const res = await fetch(`${URL}/${id}`);
    if (res.ok) {
        const p = await res.json();
        document.getElementById("edit_id_producto").value = p.id_producto;
        document.getElementById("edit_nombre").value = p.nombre;
        document.getElementById("edit_marca").value = p.marca;
        document.getElementById("edit_categoria").value = p.categoria;
        document.getElementById("edit_capacidad").value = p.capacidad;
        document.getElementById("edit_precio_compra").value = p.precio_compra;
        document.getElementById("edit_precio_venta").value = p.precio_venta;
        document.getElementById("edit_descripcion").value = p.descripcion;

        const modal = document.getElementById("modal-editar");
        modal.classList.remove("hidden");
        modal.style.display = "flex";
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

    const res = await fetch(`${URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto)
    });

    if (res.ok) {
        cerrarModal();
        cargarProductos();
        alert("¡Actualizado!");
    }
}

function cerrarModal() {
    const modal = document.getElementById("modal-editar");
    modal.classList.add("hidden");
    modal.style.display = "none";
}

async function eliminarProd(id) {
    if (confirm("¿Eliminar?")) {
        await fetch(`${URL}/${id}`, { method: 'DELETE' });
        cargarProductos();
    }
}