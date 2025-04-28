document.addEventListener("DOMContentLoaded", function () {
    const buscador = document.getElementById("buscadorRecetas");
    const recetas = document.querySelectorAll(".receta-card");
    const mensajeNoEncontrado = document.getElementById("mensajeNoEncontrado");

    buscador.addEventListener("input", function () {
        const filtro = buscador.value.toLowerCase().trim();
        let hayCoincidencias = false;

        recetas.forEach((receta) => {
            const nombreReceta = receta.querySelector("h3").innerText.toLowerCase().trim();

            // Dividir el nombre en palabras y comprobar si alguna empieza con el filtro
            const palabras = nombreReceta.split(" ");
            const coincide = palabras.some(palabra => palabra.startsWith(filtro));

            if (coincide) {
                receta.style.display = "block";
                hayCoincidencias = true;
            } else {
                receta.style.display = "none";
            }
        });

        // Mostrar mensaje si no hay coincidencias
        mensajeNoEncontrado.style.display = hayCoincidencias ? "none" : "block";
    });
});