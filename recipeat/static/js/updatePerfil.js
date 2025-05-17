document.addEventListener('DOMContentLoaded', initPerfil);

function initPerfil() {
    const formEditar = document.querySelector('form[name="form-actualizar-perfil"]');
    formEditar.addEventListener("submit", editarPerfilSubmit);

    const nombre = formEditar.elements.namedItem("nombre");
    nombre.addEventListener("input", compruebaNombre);

    const email = formEditar.elements.namedItem("email");
    email.addEventListener("input", compruebaEmail);

    const password = formEditar.elements.namedItem("password");
    password.addEventListener("input", compruebaPassword);

    const imagen = formEditar.elements.namedItem("imagen");
    imagen.addEventListener("input", compruebaImagen);
}

async function editarPerfilSubmit(e) {
    e.preventDefault();
    const formEditar = e.target;

    try {
        const formData = new FormData(formEditar);
        const response = await post('/usuarios/updatePerfil', formData);
        window.location.assign('/usuarios/verPerfil');
    } catch (err) {
        if (err instanceof ResponseError) {
            switch (err.response.status) {
                case 400:
                    await displayErroresPerfil(err.response);
                    break;
            }
        }
        console.error(`Error al editar perfil:`, err);
    }
}

async function displayErroresPerfil(response) {
    const { errores } = await response.json();
    const formEditar = document.querySelector('form[name="form-actualizar-perfil"]');

    for (const input of formEditar.elements) {
        if (!input.name) continue;

        const feedback = formEditar.querySelector(`*[name="${input.name}"] ~ span.error`);
        if (!feedback) continue;

        feedback.textContent = '';

        const error = errores[input.name];
        if (error) {
            feedback.textContent = error.msg;
        }
    }
}

function compruebaNombre(e) {
    const nombre = e.target;
    const errorSpan = nombre.parentNode.querySelector('span.error');
    const feedbackSpan = nombre.parentNode.querySelector('span.feedback');

    const validity = nombreValido(nombre.value);
    nombre.setCustomValidity(validity);

    if (nombre.checkValidity()) {
        errorSpan.textContent = ' ';
        feedbackSpan.textContent = '✔';
    } else {
        errorSpan.textContent = '⚠';
        feedbackSpan.textContent = ' ';
    }

    nombre.reportValidity();
}

function nombreValido(nombre) {
    const trimmed = nombre.trim();
    if (trimmed === "")
        return "El nombre no puede estar vacío";
    return "";
}

function compruebaEmail(e) {
    const email = e.target;
    const errorSpan = email.parentNode.querySelector('span.error');
    const feedbackSpan = email.parentNode.querySelector('span.feedback');

    const validity = emailValido(email.value);
    email.setCustomValidity(validity);

    if (email.checkValidity()) {
        errorSpan.textContent = ' ';
        feedbackSpan.textContent = '✔';
    } else {
        errorSpan.textContent = '⚠';
        feedbackSpan.textContent = ' ';
    }

    email.reportValidity();
}

function emailValido(email) {
    const trimmed = email.trim();
    if (trimmed === "")
        return "El email no puede estar vacío";
    if (!/@[^@\s]+\.[^@\s]+/.test(trimmed))
        return "Introduce un email válido";
    return "";
}

function compruebaPassword(e) {
    const password = e.target;
    const errorSpan = password.parentNode.querySelector('span.error');
    const feedbackSpan = password.parentNode.querySelector('span.feedback');

    const validity = passwordValida(password.value);
    password.setCustomValidity(validity);

    if (password.checkValidity()) {
        errorSpan.textContent = ' ';
        feedbackSpan.textContent = password.value ? '✔' : '';
    } else {
        errorSpan.textContent = '⚠';
        feedbackSpan.textContent = ' ';
    }

    password.reportValidity();
}

function passwordValida(pswd) {
    const trimmed = pswd.trim();
    if (trimmed === "") return ""; // Es opcional
    if (trimmed.length < 6 || trimmed.length > 10)
        return "La contraseña debe tener entre 6 y 10 caracteres";
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
    if (files.length === 0)
        return ""; // No es obligatorio subir una imagen

    const imagen = files[0];
    const tipo = imagen.type;
    const tiposPermitidos = ["image/jpeg", "image/png"];

    if (!tiposPermitidos.includes(tipo)) {
        imagen = "";
        return "Sólo los tipos jpeg y png están permitidos";
    }
    return "";
} 

