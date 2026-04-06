const URL = "http://localhost:8080/api/productos";

// 🚀 INICIAR LA PÁGINA Y ESCUCHAR BOTONES
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    
    // Escucha el formulario de la izquierda (SOLO PARA REGISTRAR NUEVOS)
    document.getElementById("form-producto").addEventListener("submit", guardarProducto); 
    
    // Escucha el formulario de la ventana emergente (SOLO PARA ACTUALIZAR)
    document.getElementById("form-editar").addEventListener("submit", actualizarProductoDesdeModal); 
});

// --- OBTENER TODOS LOS PRODUCTOS ---
async function cargarProductos() {
    const tabla = document.getElementById("tabla-productos");

    try {
        const res = await fetch(URL);
        const productos = await res.json();

        tabla.innerHTML = "";

        productos.forEach(p => {
            tabla.innerHTML += `
                <tr>
                    <td>${p.id_producto}</td>
                    <td>
                        <div class="prod-info">
                            <span class="name">${p.nombre}</span>
                            <span class="brand">${p.marca} - ${p.capacidad}</span>
                        </div>
                    </td>
                    <td>${p.categoria}</td>
                    <td><span class="badge-price">$${p.precio_venta.toFixed(2)}</span></td>
                    <td class="text-right">
                        <div class="action-btns">
                            <button type="button" class="btn-action edit" onclick="editarProd(${p.id_producto})">
                                <i class="ph ph-pencil-simple"></i>
                            </button>
                            <button type="button" class="btn-action delete" onclick="eliminarProd(${p.id_producto})">
                                <i class="ph ph-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

// --- GUARDAR PRODUCTO NUEVO (Desde el panel izquierdo) ---
async function guardarProducto(event) {
    event.preventDefault(); // Evita que la página se recargue

    // Recolectar datos del formulario
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
            limpiarFormulario();
            cargarProductos();
            alert("Producto guardado exitosamente");
        } else {
            alert("Error al guardar el producto");
        }
    } catch (error) {
        console.error("Error en la petición:", error);
    }
}

// --- EDITAR PRODUCTO (Abrir Modal y cargar datos) ---
async function editarProd(id) {
    try {
        const res = await fetch(`${URL}/${id}`);
        
        if (res.ok) {
            const producto = await res.json();

            // Llenar los campos del MODAL 
            document.getElementById("edit_id_producto").value = producto.id_producto;
            document.getElementById("edit_nombre").value = producto.nombre;
            document.getElementById("edit_marca").value = producto.marca;
            document.getElementById("edit_categoria").value = producto.categoria;
            document.getElementById("edit_capacidad").value = producto.capacidad;
            document.getElementById("edit_precio_compra").value = producto.precio_compra;
            document.getElementById("edit_precio_venta").value = producto.precio_venta;
            document.getElementById("edit_descripcion").value = producto.descripcion;

            // Mostrar la ventana emergente
            document.getElementById("modal-editar").style.display = "flex";
        } else {
            // Si el backend responde, pero el producto no existe (ej. Error 404)
            alert("El servidor respondió, pero no se encontró el producto con ID: " + id);
        }
    } catch (error) {
        // Si el backend está apagado o hay problema de CORS
        console.error("Error obteniendo el producto:", error);
        alert("¡Error de conexión! Revisa que Spring Boot esté encendido en el puerto 8080.");
    }
}
// --- CERRAR EL MODAL ---
function cerrarModal() {
    document.getElementById("modal-editar").style.display = "none";
}

// --- ACTUALIZAR PRODUCTO (Desde la ventana emergente) ---
async function actualizarProductoDesdeModal(event) {
    event.preventDefault();

    const id = document.getElementById("edit_id_producto").value;
    const productoActualizado = {
        nombre: document.getElementById("edit_nombre").value,
        marca: document.getElementById("edit_marca").value,
        categoria: document.getElementById("edit_categoria").value,
        capacidad: document.getElementById("edit_capacidad").value,
        precio_compra: parseFloat(document.getElementById("edit_precio_compra").value),
        precio_venta: parseFloat(document.getElementById("edit_precio_venta").value),
        descripcion: document.getElementById("edit_descripcion").value
    };

    try {
        const res = await fetch(`${URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productoActualizado)
        });

        if (res.ok) {
            cerrarModal(); // Cierra la ventana emergente
            cargarProductos(); // Refresca la tabla
            alert("¡Producto actualizado con éxito!");
        } else {
            alert("Error al actualizar el producto");
        }
    } catch (error) {
        console.error("Error en la petición:", error);
    }
}

// --- ELIMINAR PRODUCTO ---
async function eliminarProd(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
        try {
            const res = await fetch(`${URL}/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                cargarProductos();
            } else {
                alert("Error al eliminar el producto");
            }
        } catch (error) {
            console.error("Error en la petición:", error);
        }
    }
}

// --- LIMPIAR FORMULARIO PRINCIPAL ---
function limpiarFormulario() {
    document.getElementById("form-producto").reset();
}


// Agrega esto justo debajo de donde cambias el título a "Editar Producto"
document.getElementById("nombre").focus(); // Pone el cursor en el nombre
window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube la pantalla suavemente