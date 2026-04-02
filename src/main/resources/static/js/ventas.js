document.addEventListener('DOMContentLoaded', () => {

    const formVenta = document.getElementById('form-venta');
    const statusMsg = document.getElementById('status-msg');
    const tabla = document.getElementById('tabla-ventas-recientes');

    const API_VENTAS = "http://localhost:8080/api/ventas";

    // 🔹 Inicializar fecha y hora
    const hoy = new Date();
    document.getElementById('fecha').value = hoy.toISOString().split('T')[0];
    document.getElementById('hora_venta').value = hoy.toTimeString().slice(0, 5);

    /**
     * 🔥 AUTO-CÁLCULO DE TOTAL
     * (por ahora solo copia subtotal → total)
     */
    document.getElementById('subtotal').addEventListener('input', () => {
        const subtotal = parseFloat(document.getElementById('subtotal').value) || 0;
        document.getElementById('total').value = subtotal.toFixed(2);
    });

    /**
     * 🔥 ENVIAR VENTA AL BACKEND NUEVO (JSON)
     */
    formVenta.addEventListener('submit', async (e) => {
        e.preventDefault();

        // ⚠️ Aquí estamos adaptando tu formulario al nuevo backend
        const subtotal = parseFloat(document.getElementById('subtotal').value);
        const total = parseFloat(document.getElementById('total').value);
        const nombre = document.getElementById('nombreVenta').value;

        // 🔥 Simulación mínima de detalle (para que funcione con backend nuevo)
        const body = {
            subtotal: subtotal,
            total: total,
            detalles: [
                {
                    productoId: 1, // ⚠️ temporal
                    cantidad: 1
                }
            ]
        };

        try {
            const response = await fetch(API_VENTAS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {

                const venta = await response.json();

                notify("Venta registrada con éxito", "success");

                agregarFilaHistorial(venta, nombre, total);

                formVenta.reset();

                // Reestablecer fecha/hora
                document.getElementById('fecha').value = hoy.toISOString().split('T')[0];
                document.getElementById('hora_venta').value = hoy.toTimeString().slice(0, 5);

            } else {
                notify("Error al procesar la venta", "error");
            }

        } catch (err) {
            console.error(err);
            notify("Error de conexión con el servidor", "error");
        }
    });

    /**
     * 🔥 AGREGAR A HISTORIAL DINÁMICO
     */
    function agregarFilaHistorial(venta, nombre, total) {

        // Limpiar placeholder si existe
        if (tabla.children.length === 1 && tabla.innerText.includes("Esperando")) {
            tabla.innerHTML = "";
        }

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>#${venta.id}</td>
            <td>${nombre}</td>
            <td>$${parseFloat(total).toFixed(2)}</td>
            <td><span class="status-pill success">Completado</span></td>
        `;

        tabla.prepend(fila);
    }

    /**
     * 🔹 MENSAJES VISUALES
     */
    function notify(text, type) {
        statusMsg.textContent = text;
        statusMsg.style.display = "block";
        statusMsg.className = `status-box status-${type}`;

        setTimeout(() => {
            statusMsg.style.display = "none";
        }, 4000);
    }

});