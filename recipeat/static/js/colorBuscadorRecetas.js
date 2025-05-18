const contenedor = document.querySelector(".buscador");
const input = document.getElementById("buscadorRecetas");

input.addEventListener("focus", () => {
    contenedor.style.border = "3.5px solid #e67e22"; // nuevo color o estilo
});

input.addEventListener("blur", () => {
    contenedor.style.border = "1px solid #ccc"; // estilo original
});
