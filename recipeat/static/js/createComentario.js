document.addEventListener('DOMContentLoaded', init);

function init() {
    const formComentario = document.forms.namedItem("form-create-comentario");
    if (formComentario) {
        formComentario.addEventListener("submit", createSubmit);

        const id = formComentario.elements.namedItem("id"); //Si por lo que sea, se cambia el id. Aunque en circunstancias normales no pasa
        id.addEventListener("input", compruebaId);

        const descripcion = formComentario.elements.namedItem("descripcion");
        descripcion.addEventListener("input", compruebaDescripcion);
    }
}

async function createSubmit(e) {
    e.preventDefault();
    const formComentario = e.target;
    const id = formComentario.elements.namedItem("id").value;
    try {
        const formData = new FormData(formComentario);
        const response = await postData('/comentario/createComentario', formData);
        window.location.assign(`/receta/verReceta/${id}`);
    } catch (err) {
        if (err instanceof ResponseError) {
            switch (err.response.status) {
                case 400:
                    await displayErrores(err.response);
                    break;
                case 401:
                    window.assign('/usuarios/login'); // Mandar al usuario al formulario de login
                    break;
                default:
                    mostrarError(err);
                    break;
            }
        }
        console.error(`Error: `, err);
    }
}

async function displayErrores(response) {
    const { errores } = await response.json();
    const formComentario = document.forms.namedItem('form-create-comentario');
    for (const input of formComentario.elements) {
        if (input.name == undefined || input.name === '') continue;
        const feedback = formComentario.querySelector(`*[name="${input.name}"] ~ span.error`);
        if (feedback == undefined) continue;

        feedback.textContent = '';

        const error = errores[input.name];
        if (error) {
            feedback.textContent = error.msg;
        }
    }
}

function compruebaId(e) {
    const id = e.target;

    if (!recetaExiste(id.value)) {
        id.setCustomValidity('');
    } else {
        id.setCustomValidity("Id de receta inválido");
    }

    const esIdValido = id.checkValidity();
    if (esIdValido) {
        id.parentNode.querySelector('span.error').textContent = ' ';
    } else {
        id.parentNode.querySelector('span.error').textContent = '⚠';
    }
    // Muestra el mensaje de validación
    id.reportValidity();
}

async function recetaExiste(id) {
    const response = await postJson('/api/recetas/existe', {
        id: id.value
    });
    const jsonData = await response.json();
    return JSON.parse(jsonData);
}

function compruebaDescripcion(e) {
    const descripcion = e.target;

    const validity = descripcionValida(descripcion.value)
    if (validity == "") {
        descripcion.setCustomValidity('');
    } else {
        descripcion.setCustomValidity(validity);
    }

    const esDescripcionValida = descripcion.checkValidity();
    if (!esDescripcionValida) {
        descripcion.parentNode.querySelector('span.error').textContent = '⚠';
    }
    else {
        descripcion.parentNode.querySelector('span.error').textContent = '';
    }

    // Muestra el mensaje de validación
    descripcion.reportValidity();
}

function descripcionValida(descripcion) {
    const trimmed = descripcion.trim();
    if (trimmed === "")
        return "La descripcion no puede ser vacía";
    if (trimmed.length > 1500)
        return "Máximo 1500 caracteres";
    return "";
}
