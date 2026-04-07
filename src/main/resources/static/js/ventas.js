document.addEventListener('DOMContentLoaded', () => {

const API_VENTAS = "http://localhost:8080/api/venta/";
const IVA = 0.16;

const formVenta = document.getElementById('form-venta');
const tabla = document.getElementById('tabla-ventas-recientes');
const statusMsg = document.getElementById('status-msg');



function actualizarFechaHora(){

const ahora = new Date();

document.getElementById('fecha').value = ahora.toISOString().split('T')[0];

document.getElementById('hora_venta').value = ahora.toTimeString().slice(0,5);

}

actualizarFechaHora();



document.getElementById('subtotal').addEventListener('input',(e)=>{

const subtotal = parseFloat(e.target.value) || 0;

const iva = subtotal * IVA;

const total = subtotal + iva;

document.getElementById('total').value = total.toFixed(2);

document.getElementById('subtotalDisplay').innerText = subtotal.toFixed(2);

document.getElementById('ivaDisplay').innerText = iva.toFixed(2);

document.getElementById('totalDisplay').innerText = total.toFixed(2);

});



formVenta.addEventListener('submit', async (e)=>{

e.preventDefault();

const ahora = new Date();

const ventaData = {

nombreVenta: document.getElementById('nombreVenta').value,

usuario:{
idUsuario: parseInt(document.getElementById('id_usuario').value)
},

fecha: ahora.toISOString().split('T')[0],

horaVenta: ahora.toTimeString().slice(0,8),

subtotal: parseFloat(document.getElementById('subtotal').value),

total: parseFloat(document.getElementById('total').value),

iva: parseFloat(document.getElementById('subtotal').value) * IVA

};



try{

const response = await fetch(API_VENTAS,{

method:'POST',

headers:{ 'Content-Type':'application/json' },

body: JSON.stringify(ventaData)

});

if(response.ok){

const venta = await response.json();

agregarFilaHistorial(venta);

notify("Venta registrada","success");

formVenta.reset();

actualizarFechaHora();

}

else{

notify("Error en servidor","error");

}

}

catch(err){

notify("Error de conexión","error");

console.error(err);

}

});



function agregarFilaHistorial(venta){

if(tabla.innerText.includes("Esperando")){

tabla.innerHTML="";

}

const fila = document.createElement("tr");

fila.innerHTML = `

<td>#${venta.idVenta}</td>

<td>${venta.nombreVenta}</td>

<td>$${parseFloat(venta.total).toFixed(2)}</td>

<td><span class="status-pill success">Completado</span></td>

`;

tabla.prepend(fila);

}



function notify(text,type){

statusMsg.textContent=text;

statusMsg.style.display="block";

statusMsg.className=`status-box status-${type}`;

setTimeout(()=>{

statusMsg.style.display="none";

},4000);

}

});



function mostrarTab(tab){

document.getElementById("tab-historial").style.display="none";
document.getElementById("tab-categorias").style.display="none";

document.getElementById("tab-"+tab).style.display="block";

document.querySelectorAll(".tab-btn").forEach(btn=>{

btn.classList.remove("active");

});

event.target.classList.add("active");

}



function cargarProductosCategoria(){

const categoria = document.getElementById("categoriaTabla").value;

if(!categoria) return;

fetch("http://localhost:8080/api/productos/categoria/"+categoria)

.then(res=>res.json())

.then(productos=>{

const tabla = document.getElementById("tabla-productos");

tabla.innerHTML="";

productos.forEach(p=>{

tabla.innerHTML+=`

<tr>

<td>${p.idProducto}</td>

<td>${p.nombre}</td>

<td>$${p.precio}</td>

<td>

<button onclick="agregarProducto(${p.precio})">

Agregar

</button>

</td>

</tr>

`;

});

});

}



function agregarProducto(precio){

const subtotalInput = document.getElementById("subtotal");

let subtotal = parseFloat(subtotalInput.value) || 0;

subtotal += precio;

subtotalInput.value = subtotal.toFixed(2);

subtotalInput.dispatchEvent(new Event("input"));

}