document.addEventListener('DOMContentLoaded', () => {
    const formLote = document.getElementById('form-lote');
    const selectProducto = document.getElementById('producto');

    // Registrar nuevo lote
    formLote.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Extraemos los valores usando los IDs exactos de tu HTML
        const idProducto = selectProducto.value;
        const codigoLote = document.getElementById('codigo_lote').value;
        const fechaIngreso = document.getElementById('fecha_ingreso').value;
        const stockLote = document.getElementById('stock_lote').value;
        const fechaCaducidad = document.getElementById('fecha_caducidad').value;

        // Validación simple
        if (!idProducto || !codigoLote || !fechaIngreso || !stockLote || !fechaCaducidad) {
            alert("Por favor, completa todos los campos");
            return;
        }

        const payload = {
            id_producto: parseInt(idProducto),
            codigo_lote: codigoLote,
            fecha_ingreso: fechaIngreso,
            fecha_caducidad: fechaCaducidad,
            stock_lote: parseInt(stockLote)
        };

        try {
            const response = await fetch("http://localhost:8080/api/lotes", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const resultado = await response.json();
                alert("✅ Lote registrado con éxito");
                formLote.reset();
                if (typeof cargarLotes === 'function') cargarLotes();
            } else {
                const errorTexto = await response.text();
                alert("❌ Error del servidor: " + errorTexto);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("No se pudo conectar con el servidor. Verifica que Spring Boot esté corriendo.");
        }
    });
});