document.addEventListener('DOMContentLoaded', () => {
    const API_CONFIRMAR = "http://localhost:8080/api/venta/confirmar";
    const API_PRODUCTOS = "http://localhost:8080/api/productos/categoria/";
    const IVA_PERCENT = 0.16;

    let carritoItems = [];

    // 1. Reloj y Fecha Automática
    function initFechaHora() {
        const ahora = new Date();
        document.getElementById('fecha').value = ahora.toLocaleDateString();
        document.getElementById('hora_venta').value = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    initFechaHora();
    setInterval(initFechaHora, 60000);

    // 2. Cargar Productos con Estilo Elite
    window.cargarProductos = async function(categoria) {
        const grid = document.getElementById('grid-productos');
        grid.innerHTML = '<p class="text-center py-10 animate-pulse text-outline">Buscando productos...</p>';

        // Actualizar UI de botones de categoría
        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.classList.remove('bg-primary', 'text-on-primary');
            btn.classList.add('bg-surface-container', 'text-on-surface-variant');
        });
        
        // Solo aplica la clase si el evento existe (clic del usuario)
        if(typeof event !== 'undefined' && event.currentTarget) {
            event.currentTarget.classList.add('bg-primary', 'text-on-primary');
        }

        try {
            const url = categoria === 'Todos' ? 'http://localhost:8080/api/productos' : API_PRODUCTOS + categoria;
            const res = await fetch(url);
            const productos = await res.json();

            grid.innerHTML = "";
            
            if(productos.length === 0) {
                 grid.innerHTML = '<p class="text-center py-10 text-outline text-sm">No hay productos en esta categoría.</p>';
                 return;
            }

            productos.forEach(p => {
                // Manejo seguro de nombres de variables
                const idProd = p.id_producto || p.idProducto;
                const nombreProd = p.nombre_producto || p.nombre;

                grid.innerHTML += `
                    <div onclick="agregarAlCarrito(${idProd}, '${nombreProd}', ${p.precio_venta})" 
                         class="group cursor-pointer bg-surface rounded-lg overflow-hidden border border-outline-variant/30 hover:border-secondary-fixed-dim transition-all flex h-24 flex-shrink-0">
                        <div class="p-3 flex flex-col justify-between flex-grow">
                            <h3 class="font-semibold text-[13px] leading-tight text-primary">${nombreProd}</h3>
                            <div class="flex justify-between items-center">
                                <span class="text-secondary font-bold text-[14px]">$${p.precio_venta.toFixed(2)}</span>
                                <span class="material-symbols-outlined text-outline group-hover:text-secondary-fixed-dim text-sm transition-colors">add_circle</span>
                            </div>
                        </div>
                    </div>`;
            });
        } catch (err) {
            grid.innerHTML = '<p class="text-red-500 text-xs p-4 text-center">Error al conectar con el catálogo</p>';
            if(typeof mostrarToast === 'function') mostrarToast("Error al cargar productos", "error");
        }
    };

    // 3. Lógica del Carrito
    window.agregarAlCarrito = function(id, nombre, precio) {
        const existe = carritoItems.find(item => item.idProducto === id);
        if (existe) {
            existe.cantidad++;
        } else {
            carritoItems.push({ idProducto: id, nombre, precio, cantidad: 1 });
        }
        renderizarCarrito();
    };

    window.quitarUno = function(id) {
        const item = carritoItems.find(i => i.idProducto === id);
        if (item.cantidad > 1) item.cantidad--;
        else carritoItems = carritoItems.filter(i => i.idProducto !== id);
        renderizarCarrito();
    };

    window.vaciarCarrito = function() {
        if(carritoItems.length === 0) return;
        if(confirm("¿Deseas vaciar la lista actual?")) {
            carritoItems = [];
            renderizarCarrito();
            if(typeof mostrarToast === 'function') mostrarToast("Carrito vaciado", "info");
        }
    };

    function renderizarCarrito() {
        const tabla = document.getElementById('carrito-items');
        const emptyMsg = document.getElementById('carrito-vacio');
        const countLabel = document.getElementById('cart-count');
        
        tabla.innerHTML = "";
        let subtotal = 0;
        let totalUnidades = 0;

        if (carritoItems.length === 0) {
            emptyMsg.classList.remove('hidden');
        } else {
            emptyMsg.classList.add('hidden');
            carritoItems.forEach(item => {
                const sub = item.precio * item.cantidad;
                subtotal += sub;
                totalUnidades += item.cantidad;

                tabla.innerHTML += `
                    <tr class="hover:bg-surface-container-low transition-colors group border-b border-surface-variant">
                        <td class="px-6 py-4 font-body-md">
                            <div class="flex items-center gap-2">
                                <button onclick="quitarUno(${item.idProducto})" class="text-outline hover:text-error transition-colors">
                                    <span class="material-symbols-outlined text-sm">remove_circle</span>
                                </button>
                                <span class="font-bold text-sm text-primary">${item.cantidad}x</span>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="font-body-md text-primary font-semibold text-sm">${item.nombre}</div>
                            <div class="text-[10px] text-outline font-bold">$${item.precio.toFixed(2)} c/u</div>
                        </td>
                        <td class="px-6 py-4 text-right font-body-md text-primary font-bold">$${sub.toFixed(2)}</td>
                    </tr>`;
            });
        }

        countLabel.innerText = `${totalUnidades} items seleccionados`;
        actualizarTotales(subtotal);
    }

    function actualizarTotales(sub) {
        const iva = sub * IVA_PERCENT;
        const total = sub + iva;

        // Formato de moneda para que se vea premium ($0.00)
        const formatoOpciones = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

        document.getElementById('subtotalDisplay').innerText = `$${sub.toLocaleString('es-MX', formatoOpciones)}`;
        document.getElementById('ivaDisplay').innerText = `$${iva.toLocaleString('es-MX', formatoOpciones)}`;
        document.getElementById('totalDisplay').innerText = `$${total.toLocaleString('es-MX', formatoOpciones)}`;
        document.getElementById('big-total').innerText = `$${total.toLocaleString('es-MX', formatoOpciones)}`;
    }

    // 4. Confirmar Venta (Backend)
    document.getElementById('form-venta').addEventListener('submit', async (e) => {
        e.preventDefault();

        if (carritoItems.length === 0) {
            if(typeof mostrarToast === 'function') mostrarToast("Agrega productos al carrito antes de finalizar", "warning");
            return;
        }

        const idUsuario = document.getElementById('id_usuario').value;
        if(!idUsuario) {
             if(typeof mostrarToast === 'function') mostrarToast("Falta el ID del Cajero/Usuario", "error");
             return;
        }

        const payload = {
            idUsuario: parseInt(idUsuario),
            nombreVenta: document.getElementById('nombreVenta').value || "Venta Elite",
            items: carritoItems.map(i => ({ idProducto: i.idProducto, cantidad: i.cantidad }))
        };

        if(typeof mostrarToast === 'function') mostrarToast("Procesando pago...", "info");

        try {
            const response = await fetch(API_CONFIRMAR, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Venta Exitosa
                if(typeof mostrarToast === 'function') mostrarToast("¡Venta procesada exitosamente!", "success");
                
                carritoItems = [];
                document.getElementById('nombreVenta').value = "";
                renderizarCarrito();
                
                if(typeof cargarNotificacionesGlobales === 'function') cargarNotificacionesGlobales();
                
            } else {
                // Obtenemos el texto de error de Java
                let err = await response.text();
                
                // --- TRADUCTOR DE ERRORES: Cambiar ID por Nombre ---
                // Busca si el mensaje dice algo como "ID: 11"
                const coincidenciaID = err.match(/ID:\s*(\d+)/i);
                
                if (coincidenciaID) {
                    const idFaltante = parseInt(coincidenciaID[1]);
                    // Busca el producto en el carrito que tenga ese ID
                    const productoFaltante = carritoItems.find(i => i.idProducto === idFaltante);
                    
                    if (productoFaltante) {
                        // Reemplaza "el ID: 11" por "el producto: Atún en Agua"
                        err = err.replace(/el ID:\s*\d+/i, `el producto: ${productoFaltante.nombre}`);
                    }
                }
                
                // Muestra la notificación con el nombre ya arreglado
                if(typeof mostrarToast === 'function') mostrarToast(err, "error");
            }
        } catch (error) {
            if(typeof mostrarToast === 'function') mostrarToast("No hay conexión con el servidor", "error");
        }
    });

    // Iniciar
    cargarProductos('Todos');
});