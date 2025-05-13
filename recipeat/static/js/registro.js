document.addEventListener('DOMContentLoaded', init);

function init() {
    const formRegistro = document.forms.namedItem("form-registro-usuario");
    formRegistro.addEventListener("submit", registroSubmit);

    const username = formRegistro.elements.namedItem('username');
    username.addEventListener("input", compruebaUsername);

    const nombre = formRegistro.elements.namedItem("nombre");
    nombre.addEventListener("input", compruebaNombre);

    const email = formRegistro.elements.namedItem("email");
    email.addEventListener("input", compruebaEmail);

    const password = formRegistro.elements.namedItem("password");
    password.addEventListener("input", compruebaPassword);
}

async function registroSubmit(e) {
    e.preventDefault();
    const formRegistro = e.target;
    try {
        const formData = new FormData(formRegistro);
        const response = await post('/usuarios/registro', formData);
        window.location.assign('/usuarios/home');  // Misma URL a la que te envía el controller
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
    const formRegistro = document.forms.namedItem('form-registro-usuario');
    for (const input of formRegistro.elements) {
        if (input.name == undefined || input.name === '') continue;
        const feedback = formRegistro.querySelector(`*[name="${input.name}"] ~ span.error`);
        if (feedback == undefined) continue;

        feedback.textContent = '';

        const error = errores[input.name];
        if (error) {
            feedback.textContent = error.msg;
        }
    }
}
async function compruebaUsername(e) {
    const username = e.target;
    const trimmed = username.value.trim();

    // Validación local sincrónica
    /*
        -^ Inicio de la cadena
        -[A-Z0-9]  Cualquier carácter que sea una letra mayúscula (A-Z) o un dígito (0-9)
        -*    	Cero o más repeticiones del patrón anterior
        -$ Fin de la cadena
        -/i Flag de insensibilidad a mayúsculas/minúsculas (ignora si pones a o A)
     */
    const regex = /^[A-Z0-9]*$/i;
    if (trimmed === "") {
        username.setCustomValidity("El nombre de usuario no puede ser vacío");
    } else if (!regex.test(trimmed)) {
        username.setCustomValidity("Sólo puede contener números y letras");
    } else {
        // Validación asíncrona
        const disponible = await usernameDisponible(trimmed);
        if (!disponible) {
            username.setCustomValidity("Nombre de usuario no disponible");
        } else {
            username.setCustomValidity('');
        }
    }

    const esValido = username.checkValidity();
    const errorSpan = username.parentNode.querySelector('span.error');
    const feedbackSpan = username.parentNode.querySelector('span.feedback');

    if (esValido) {
        errorSpan.textContent = ' ';
        feedbackSpan.textContent = '✔';
    } else {
        errorSpan.textContent = '⚠';
        feedbackSpan.textContent = ' ';
    }

    username.reportValidity();
}

async function usernameDisponible(username){
    const response = await postJson('/api/usuarios/disponible', {
        username
    });
    const jsonData = await response.json();
    return JSON.parse(jsonData);
}

function compruebaNombre(e) {
    const nombre = e.target;

    const validity = nombreValido(nombre.value)
    if (validity === "") {
        nombre.setCustomValidity('');
    } else {
        nombre.setCustomValidity(validity);
    }

    const esDescripcionValida = nombre.checkValidity();
    if (esDescripcionValida) {
        nombre.parentNode.querySelector('span.error').textContent = ' ';
        nombre.parentNode.querySelector('span.feedback').textContent = '✔';
    } else {
        nombre.parentNode.querySelector('span.error').textContent = '⚠';
        nombre.parentNode.querySelector('span.feedback').textContent = ' ';
    }
    // Muestra el mensaje de validación
    nombre.reportValidity();
}

function nombreValido(nombre) {
    const trimmed = nombre.trim();
    if (trimmed === "")
        return "El nombre no puede ser vacío";
    return "";
}

function compruebaEmail(e) {
    const email = e.target;

    const validity = emailValido(email.value)
    if (validity == "") {
        email.setCustomValidity('');
    } else {
        email.setCustomValidity(validity);
    }

    const esPreparacionValida = email.checkValidity();
    if (esPreparacionValida) {
        email.parentNode.querySelector('span.error').textContent = ' ';
        email.parentNode.querySelector('span.feedback').textContent = '✔';
    } else {
        email.parentNode.querySelector('span.error').textContent = '⚠';
        email.parentNode.querySelector('span.feedback').textContent = ' ';
    }
    // Muestra el mensaje de validación
    email.reportValidity();
}

function emailValido(email) {
    const trimmed = email.trim();
    if (trimmed === "")
        return "El email no puede ser vacío";
    if (trimmed.search(/@[^@\s]+\.[^@\s]+/) == -1)    // Busca en el email por una cadena de la forma: @<Serie de caracteres, excepto '@' y espacios>.<una serie igual que la anterior>
        return "Introduce un email válido";
    return "";
}

function compruebaPassword(e) {
    const password = e.target;

    const validity = passwordValida(password.value)
    if (validity == "") {
        password.setCustomValidity('');
    } else {
        password.setCustomValidity(validity);
    }

    const esImagenValida = password.checkValidity();
    if (esImagenValida) {
        password.parentNode.querySelector('span.error').textContent = ' ';
        password.parentNode.querySelector('span.feedback').textContent = '✔';
    } else {
        password.parentNode.querySelector('span.error').textContent = '⚠';
        password.parentNode.querySelector('span.feedback').textContent = ' ';
    }
    // Muestra el mensaje de validación
    password.reportValidity();
}

function passwordValida(pswd) {
    const trimmed = pswd.trim();
    if (trimmed === "")
        return "Proporciona una contraseña";
    if (trimmed.length < 6 || trimmed.length > 10 )
        return "La contraseña no tiene entre 6 y 10 caracteres";
    return "";
} 