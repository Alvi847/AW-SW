document.addEventListener("DOMContentLoaded", function () {
    const buscador = document.getElementById("buscadorRecetas");
    const tipoFiltro = document.getElementById("tipoFiltro");
    const recetasContainer = document.querySelector(".recetas-container");
    const mensajeNoEncontrado = document.getElementById("mensajeNoEncontrado");

    const recetasOriginales = recetasContainer.innerHTML;  // 💾 Guardamos el HTML inicial

    async function buscarRecetas() {
        const query = buscador.value.trim();
        const filtro = tipoFiltro.value;

        if (query.length === 0) {
            recetasContainer.innerHTML = recetasOriginales; // ✅ Recuperamos todas las recetas
            mensajeNoEncontrado.style.display = "none";
            return;
        }

        try {
            const response = await fetch(`/receta/api/buscar?tipo=${filtro}&q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error("Error en la búsqueda");

            const recetas = await response.json();

            recetasContainer.innerHTML = '';

            if (recetas.length === 0) {
                mensajeNoEncontrado.style.display = "block";
            } else {
                mensajeNoEncontrado.style.display = "none";
                recetas.forEach(r => {
                    const recetaCard = document.createElement("div");
                    recetaCard.className = "receta-card";

                    recetaCard.innerHTML = `
                        <a href="/receta/verReceta/${r.id}">
                            <div class="receta-content">
                                <img class="receta-imagen" src="/imagen/${r.imagen}" alt="${r.nombre}">
                                <div class="receta-info">
                                    <h3>${r.nombre}</h3>
                                    <p class="resumen">${r.descripcion}</p>
                                </div>
                            </div>
                        </a>
                    `;

                    recetasContainer.appendChild(recetaCard);
                });
            }
        } catch (error) {
            console.error(error);
            recetasContainer.innerHTML = recetasOriginales; // También recuperamos originales si hay error
            mensajeNoEncontrado.style.display = "none";
        }
    }

    buscador.addEventListener("input", buscarRecetas);
    tipoFiltro.addEventListener("change", buscarRecetas);
});
