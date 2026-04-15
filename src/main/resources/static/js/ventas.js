document.addEventListener('DOMContentLoaded', () => {
    const API_VENTAS = "http://localhost:8080/api/venta/confirmar";
    const API_PRODUCTOS = "http://localhost:8080/api/productos/categoria/";
    const IVA_PERCENT = 0.16;

    // El "Carrito" que guardará lo que el backend necesita (id y cantidad)
    let carritoItems = [];

    const formVenta = document.getElementById('form-venta');
    const tablaHistorial = document.getElementById('tabla-ventas-recientes');
    const statusMsg = document.getElementById('status-msg');

    // Inicializar Fecha y Hora
    function actualizarFechaHora() {
        const ahora = new Date();
        document.getElementById('fecha').value = ahora.toISOString().split('T')[0];
        document.getElementById('hora_venta').value = ahora.toTimeString().slice(0, 5);
    }
    actualizarFechaHora();

    // Escuchar cambios en el subtotal para actualizar los displays visuales
    document.getElementById('subtotal').addEventListener('input', (e) => {
        const subtotal = parseFloat(e.target.value) || 0;
        const iva = subtotal * IVA_PERCENT;
        const total = subtotal + iva;

        document.getElementById('total').value = total.toFixed(2);
        document.getElementById('subtotalDisplay').innerText = subtotal.toFixed(2);
        document.getElementById('ivaDisplay').innerText = iva.toFixed(2);
        document.getElementById('totalDisplay').innerText = total.toFixed(2);
    });

    // Función para agregar producto al carrito interno y actualizar totales
    window.agregarProductoAlCarrito = function (id, nombre, precio) {
        // Buscar si ya existe para sumar cantidad
        const itemExistente = carritoItems.find(item => item.idProducto === id);

        if (itemExistente) {
            itemExistente.cantidad += 1;
        } else {
            carritoItems.push({ idProducto: id, cantidad: 1 });
        }

        // Actualizar el input de subtotal (esto disparará el evento 'input' de arriba)
        const subtotalInput = document.getElementById('subtotal');
        let nuevoSubtotal = (parseFloat(subtotalInput.value) || 0) + precio;
        subtotalInput.value = nuevoSubtotal.toFixed(2);
        subtotalInput.dispatchEvent(new Event('input'));

        notify(`Agregado: ${nombre}`, "success");
    };

    // Enviar la venta al Backend
    formVenta.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (carritoItems.length === 0) {
            notify("El carrito está vacío", "error");
            return;
        }

        const ventaData = {
            idUsuario: parseInt(document.getElementById('id_usuario').value),
            nombreVenta: document.getElementById('nombreVenta').value || "Venta General",
            items: carritoItems // Coincide con List<ItemDetalleDTO> en Java
        };

        try {
            const response = await fetch(API_VENTAS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ventaData)
            });

            if (response.ok) {
                const ventaRealizada = await response.json();
                agregarFilaHistorial(ventaRealizada);
                notify("¡Venta finalizada y stock actualizado!", "success");

                // Resetear todo
                carritoItems = [];
                formVenta.reset();
                document.getElementById('subtotal').value = "";
                document.getElementById('subtotal').dispatchEvent(new Event('input'));
                actualizarFechaHora();
            } else {
                const errorTexto = await response.text();
                notify("Error: " + errorTexto, "error");
            }
        } catch (err) {
            notify("No se pudo conectar con el servidor", "error");
            console.error(err);
        }
    });

    // Cargar productos por categoría
    window.cargarProductosCategoria = function () {
        const categoria = document.getElementById("categoriaTabla").value;
        if (!categoria) return;

        fetch(API_PRODUCTOS + categoria)
            .then(res => res.json())
            .then(productos => {
                const tabla = document.getElementById("tabla-productos");
                tabla.innerHTML = "";
                productos.forEach(p => {
                    tabla.innerHTML += `
    <tr>
        <td>${p.id_producto}</td> 
        <td>${p.nombre}</td>
        <td>$${p.precio_venta}</td>
        <td>
<button type="button" class="btn-primary" style="padding: 5px 10px;" 
    onclick="agregarProductoAlCarrito(${p.id_producto}, '${p.nombre}', ${p.precio_venta})">
    <i class="ph ph-plus"></i> Agregar
</button>
        </td>
    </tr>`;
                });
            });
    };

    function agregarFilaHistorial(venta) {
        if (tablaHistorial.innerText.includes("Esperando")) tablaHistorial.innerHTML = "";
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>#${venta.idVenta}</td>
            <td>${venta.nombreVenta}</td>
            <td>$${parseFloat(venta.total).toFixed(2)}</td>
            <td><span class="status-pill success">Completado</span></td>
        `;
        tablaHistorial.prepend(fila);
    }

    function notify(text, type) {
        statusMsg.textContent = text;
        statusMsg.className = `status-box status-${type}`;
        statusMsg.style.display = "block";
        setTimeout(() => { statusMsg.style.display = "none"; }, 4000);
    }

    // Lógica de Tabs
    window.mostrarTab = function (tab) {
        document.getElementById("tab-historial").style.display = tab === 'historial' ? "block" : "none";
        document.getElementById("tab-categorias").style.display = tab === 'categorias' ? "block" : "none";

        document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
        event.currentTarget.classList.add("active");
    };
    // Función para actualizar la vista del carrito
function renderizarCarrito() {
    const contenedor = document.getElementById('carrito-items');
    const mensajeVacio = document.getElementById('carrito-vacio');
    
    contenedor.innerHTML = "";
    
    if (carritoItems.length === 0) {
        mensajeVacio.style.display = "block";
        return;
    }
    
    mensajeVacio.style.display = "none";
    
    carritoItems.forEach((item, index) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${item.cantidad}</td>
            <td>${item.nombre}</td>
            <td>$${(item.precio * item.cantidad).toFixed(2)}</td>
            <td>
                <button onclick="quitarDelCarrito(${index})" style="background:none; border:none; color:red; cursor:pointer">
                    <i class="ph ph-trash"></i>
                </button>
            </td>
        `;
        contenedor.appendChild(fila);
    });
}

// Modificamos agregarProductoAlCarrito para que use los nombres correctos
window.agregarProductoAlCarrito = function (id, nombre, precio) {
    const itemExistente = carritoItems.find(item => item.idProducto === id);

    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        // Guardamos nombre y precio solo para la vista, el backend solo necesita id y cantidad
        carritoItems.push({ idProducto: id, nombre: nombre, precio: precio, cantidad: 1 });
    }

    // Actualizar el formulario izquierdo
    actualizarTotales();
    renderizarCarrito();
    notify(`Agregado: ${nombre}`, "success");
};

function actualizarTotales() {
    let subtotal = 0;
    carritoItems.forEach(item => subtotal += (item.precio * item.cantidad));
    
    const inputSubtotal = document.getElementById('subtotal');
    inputSubtotal.value = subtotal.toFixed(2);
    // Disparar el evento input para que calcule IVA y Total
    inputSubtotal.dispatchEvent(new Event('input'));
}

function quitarDelCarrito(index) {
    carritoItems.splice(index, 1);
    actualizarTotales();
    renderizarCarrito();
}

});