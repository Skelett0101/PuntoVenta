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
        event?.currentTarget?.classList.add('bg-primary', 'text-on-primary');

        try {
            // Si la categoría es 'Todos', podrías necesitar otro endpoint o manejarlo en el backend
            const url = categoria === 'Todos' ? 'http://localhost:8080/api/productos' : API_PRODUCTOS + categoria;
            const res = await fetch(url);
            const productos = await res.json();

            grid.innerHTML = "";
            productos.forEach(p => {
                grid.innerHTML += `
                    <div onclick="agregarAlCarrito(${p.id_producto}, '${p.nombre}', ${p.precio_venta})" 
                         class="group cursor-pointer bg-surface rounded-lg overflow-hidden border border-outline-variant/30 hover:border-secondary-fixed-dim transition-all flex h-24 flex-shrink-0">
                        <div class="p-3 flex flex-col justify-between flex-grow">
                            <h3 class="font-semibold text-[13px] leading-tight text-primary">${p.nombre}</h3>
                            <div class="flex justify-between items-center">
                                <span class="text-secondary font-bold text-[14px]">$${p.precio_venta.toFixed(2)}</span>
                                <span class="material-symbols-outlined text-outline group-hover:text-secondary-fixed-dim text-sm">add_circle</span>
                            </div>
                        </div>
                    </div>`;
            });
        } catch (err) {
            grid.innerHTML = '<p class="text-red-500 text-xs p-4">Error al conectar con el servidor</p>';
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
        if(confirm("¿Deseas vaciar la lista actual?")) {
            carritoItems = [];
            renderizarCarrito();
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
                    <tr class="hover:bg-surface-container-low transition-colors group">
                        <td class="px-6 py-4 font-body-md">
                            <div class="flex items-center gap-2">
                                <button onclick="quitarUno(${item.idProducto})" class="text-outline hover:text-error">
                                    <span class="material-symbols-outlined text-sm">remove_circle</span>
                                </button>
                                <span>${item.cantidad}x</span>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="font-body-md text-primary font-semibold">${item.nombre}</div>
                            <div class="text-[10px] text-outline">$${item.precio.toFixed(2)} c/u</div>
                        </td>
                        <td class="px-6 py-4 text-right font-body-md text-primary font-bold">$${sub.toFixed(2)}</td>
                    </tr>`;
            });
        }

        countLabel.innerText = `${totalUnidades} unidades en total`;
        actualizarTotales(subtotal);
    }

    function actualizarTotales(sub) {
        const iva = sub * IVA_PERCENT;
        const total = sub + iva;

        document.getElementById('subtotalDisplay').innerText = `$${sub.toLocaleString()}`;
        document.getElementById('ivaDisplay').innerText = `$${iva.toLocaleString()}`;
        document.getElementById('totalDisplay').innerText = `$${total.toLocaleString()}`;
        document.getElementById('big-total').innerText = `$${total.toLocaleString()}`;
    }

    // 4. Confirmar Venta (Backend)
    document.getElementById('form-venta').addEventListener('submit', async (e) => {
        e.preventDefault();

        if (carritoItems.length === 0) {
            alert("Agrega productos antes de finalizar");
            return;
        }

        const payload = {
            idUsuario: parseInt(document.getElementById('id_usuario').value),
            nombreVenta: document.getElementById('nombreVenta').value || "Venta Elite",
            items: carritoItems.map(i => ({ idProducto: i.idProducto, cantidad: i.cantidad }))
        };

        try {
            const response = await fetch(API_CONFIRMAR, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("✅ Venta procesada exitosamente");
                carritoItems = [];
                document.getElementById('nombreVenta').value = "";
                renderizarCarrito();
            } else {
                const err = await response.text();
                alert("❌ Error: " + err);
            }
        } catch (error) {
            alert("No hay conexión con el servidor");
        }
    });

    // Cargar productos iniciales
    cargarProductos('Todos');
});