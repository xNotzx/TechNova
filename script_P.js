function mostrarComponentes(id) {
    const contenedor = document.getElementById(id);
    if (!contenedor) return;
    contenedor.classList.toggle("activo");
}

function mostrarLinks(id, boton) {
    const contenedor = document.getElementById(id);
    if (!contenedor) return;

    const activo = contenedor.classList.toggle("activo");
    if (boton) {
        boton.textContent = activo ? "Cerrar" : "Ver Más";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".btn-amazon").forEach((btn) => {
        const busqueda = btn.dataset.busqueda;
        btn.href = "https://www.amazon.com/s?k=" + encodeURIComponent(busqueda);
    });

    document.querySelectorAll(".btn-ml").forEach((btn) => {
        const busqueda = btn.dataset.busqueda;
        btn.href = "https://listado.mercadolibre.com.mx/" + encodeURIComponent(busqueda);
    });

    const cards = document.querySelectorAll(".pc-card");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    cards.forEach((card) => observer.observe(card));
});

function regresarInicio() {
    window.location.href = "index.html";
}
