const URL = "http://localhost:8080/api/productos";

// 🚀 CARGAR PRODUCTOS AL INICIAR
document.addEventListener("DOMContentLoaded", cargarProductos);

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
                    <td><span class="badge-price">$${p.precio_venta}</span></td>
                    <td class="text-right">
                        <div class="action-btns">
                            <button class="btn-action edit" onclick="editarProd(${p.id_producto})">
                                <i class="ph ph-pencil-simple"></i>
                            </button>
                            <button class="btn-action delete" onclick="eliminarProd(${p.id_producto})">
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