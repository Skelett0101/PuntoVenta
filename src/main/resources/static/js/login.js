document.addEventListener('DOMContentLoaded', () => {
    // Seleccionamos el formulario del login
    const form = document.querySelector('form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitamos que la página se recargue

        // Obtenemos los valores de los inputs
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        // Validación básica
        if (!username || !password) {
            mostrarToast("Por favor, ingrese su usuario y contraseña.", "warning");
            return;
        }

        mostrarToast("Verificando credenciales...", "info");

        try {
            // Mandamos los datos a Spring Boot
            const response = await fetch('http://localhost:8080/api/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombreUsuario: username,
                    contrasenaUsuario: password
                })
            });

            if (response.ok) {
                // Si el servidor responde OK (Status 200)
                const usuario = await response.json();
                
                // Guardamos la sesión en localStorage para que el Dashboard la lea
                localStorage.setItem('usuario', JSON.stringify({
                    nombre: usuario.nombre_usuario || usuario.nombreUsuario,
                    rol: usuario.rol,
                    correo: usuario.correo_usuario || usuario.correoUsuario
                }));

                mostrarToast("Acceso Autorizado. Redirigiendo...", "success");
                
                // Redirigimos al panel de control después de 1.5 segundos
                setTimeout(() => {
                    window.location.href = "Index2.html"; 
                }, 1500);

            } else {
                // Si el servidor responde Error (Status 401 Unauthorized)
                mostrarToast("Credenciales incorrectas. Acceso denegado.", "error");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            mostrarToast("Error al conectar con el servidor.", "error");
        }
    });
});

// --- SISTEMA DE NOTIFICACIONES (TOAST PREMIUM) ---
function mostrarToast(mensaje, tipo = 'info') {
    const toast = document.createElement('div');
    
    let bg = '#121212'; // Negro Charcoal (Fondo)
    let colorTexto = '#FFFFFF';
    let icon = 'ph-info';
    let border = 'border: 1px solid rgba(255,255,255,0.1);';

    if (tipo === 'success') { icon = 'verified'; colorTexto = '#D4AF37'; } // Dorado para éxito
    if (tipo === 'error')   { icon = 'error'; colorTexto = '#ef4444'; } // Rojo para error
    if (tipo === 'warning') { icon = 'warning'; colorTexto = '#f59e0b'; } // Naranja para advertencias

    toast.style.cssText = `
        position: fixed; bottom: 30px; right: 30px;
        background-color: ${bg}; color: ${colorTexto};
        padding: 16px 24px; border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        display: flex; align-items: center; gap: 12px;
        font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 600;
        z-index: 9999; opacity: 0; transform: translateY(20px);
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        ${border}
    `;

    toast.innerHTML = `<span class="material-symbols-outlined" style="font-size: 1.5rem;">${icon}</span> <span style="color: white;">${mensaje}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; }, 10);
    setTimeout(() => {
        toast.style.opacity = '0'; toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}