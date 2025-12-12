function mostrarMensaje() {
    const mensaje = document.getElementById("mensaje");
    mensaje.textContent = "¡Gracias por visitar la página!";
    mensaje.style.opacity = 1;
}

window.mostrarMensaje = mostrarMensaje; // necesario