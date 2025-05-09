document.addEventListener('DOMContentLoaded', init);

function init() {
    const formCreate = document.forms.namedItem("form-create-receta");
    formCreate.addEventListener("submit", createSubmit);

    const nombre = formCreate.elements.namedItem('nombre');
    nombre.addEventListener("input", compruebaNombre);

    const descripcion = formCreate.elements.namedItem("descripcion");
    descripcion.addEventListener("input", compruebaDescripcion);

    const preparacion = formCreate.elements.namedItem("modo_preparacion");
    preparacion.addEventListener("input", compruebaPreparacion);

    const imagen = formCreate.elements.namedItem("imagen");
    imagen.addEventListener("input", compruebaImagen);
}

async function createSubmit(e) {
    e.preventDefault();
    const formCreate = e.target;
    try {
        const formData = new FormData(formCreate);
        const response = await post('/receta/createReceta', formData);
        window.location.assign('/receta/listaRecetas');
    } catch (err) {
        if (err instanceof ResponseError) {
            switch (err.response.status) {
                case 400:
                    await displayErrores(err.response);
                    break;
            }
        }
        console.error(`Error: `, err);
    }
}

async function displayErrores(response) {
    const { errores } = await response.json();
    const formCreate = document.forms.namedItem('form-create-receta');
    for (const input of formCreate.elements) {
        if (input.name == undefined || input.name === '') continue;
        const feedback = formCreate.querySelector(`*[name="${input.name}"] ~ span.error`);
        if (feedback == undefined) continue;

        feedback.textContent = '';

        const error = errores[input.name];
        if (error) {
            feedback.textContent = error.msg;
        }
    }
}

function compruebaNombre(e) {
    const nombre = e.target;

    const validity = nombreRecetaValido(nombre.value)
    if (validity == "") {
        nombre.setCustomValidity('');
    } else {
        nombre.setCustomValidity(validity);
    }

    const esNombreValido = nombre.checkValidity();
    if (esNombreValido) {
        nombre.parentNode.querySelector('span.error').textContent = ' ';
        nombre.parentNode.querySelector('span.feedback').textContent = '✔';
    } else {
        nombre.parentNode.querySelector('span.error').textContent = '⚠';
        nombre.parentNode.querySelector('span.feedback').textContent = ' ';
    }
    // Muestra el mensaje de validación
    nombre.reportValidity();
}

function nombreRecetaValido(nombre) {
    const regex = /^[\p{L}\s]*$/u;
    const trimmed = nombre.trim();
    if (trimmed === "")
        return "El nombre no puede ser vacío";
    if (!regex.test(trimmed))
        return "Sólo puede contener letras";
    if (trimmed.length > 50)
        return "Máximo 50 caracteres";
    return "";
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
    if (esDescripcionValida) {
        descripcion.parentNode.querySelector('span.error').textContent = ' ';
        descripcion.parentNode.querySelector('span.feedback').textContent = '✔';
    } else {
        descripcion.parentNode.querySelector('span.error').textContent = '⚠';
        descripcion.parentNode.querySelector('span.feedback').textContent = ' ';
    }
    // Muestra el mensaje de validación
    descripcion.reportValidity();
}

function descripcionValida(descripcion) {
    const trimmed = descripcion.trim();
    if (trimmed === "")
        return "La descripcion no puede ser vacía";
    if (trimmed.length > 200)
        return "Máximo 200 caracteres";
    return "";
}

function compruebaPreparacion(e) {
    const preparacion = e.target;

    const validity = preparacionValida(preparacion.value)
    if (validity == "") {
        preparacion.setCustomValidity('');
    } else {
        preparacion.setCustomValidity(validity);
    }

    const esPreparacionValida = preparacion.checkValidity();
    if (esPreparacionValida) {
        preparacion.parentNode.querySelector('span.error').textContent = ' ';
        preparacion.parentNode.querySelector('span.feedback').textContent = '✔';
    } else {
        preparacion.parentNode.querySelector('span.error').textContent = '⚠';
        preparacion.parentNode.querySelector('span.feedback').textContent = ' ';
    }
    // Muestra el mensaje de validación
    preparacion.reportValidity();
}

function preparacionValida(preparacion) {
    const trimmed = preparacion.trim();
    if (trimmed === "")
        return "El método de preparación no puede ser vacío";
    if (trimmed.length > 1000)
        return "Máximo 1000 caracteres";
    return "";
}

function compruebaImagen(e) {
    const imagen = e.target;

    const validity = imagenValida(imagen.files)
    if (validity == "") {
        imagen.setCustomValidity('');
    } else {
        imagen.setCustomValidity(validity);
    }

    const esImagenValida = imagen.checkValidity();
    if (esImagenValida) {
        imagen.parentNode.querySelector('span.error').textContent = ' ';
        imagen.parentNode.querySelector('span.feedback').textContent = '✔';
    } else {
        imagen.parentNode.querySelector('span.error').textContent = '⚠';
        imagen.parentNode.querySelector('span.feedback').textContent = ' ';
    }
    // Muestra el mensaje de validación
    imagen.reportValidity();
}

function imagenValida(files) {
    if (files.length == 0)
        return "Proporciona una imagen de receta";
    const imagen = files[0];
    const tipo = imagen.type;
    const tiposPermitidos = ["image/jpeg", "image/png"];

    if (!tiposPermitidos.includes(tipo)) {
        imagen = "";
        return "Sólo los tipos jpeg y png están permitidos";
    }
    return "";
} 