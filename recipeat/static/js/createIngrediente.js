document.addEventListener('DOMContentLoaded', init);


function init() {
    const formCreate = document.forms.namedItem("form-create-ingrediente");
    formCreate.addEventListener("submit", createSubmit);

    const nombre = formCreate.elements.namedItem('nombre');
    nombre.addEventListener("input", compruebaNombre);

    const unidad = formCreate.elements.namedItem("unidad");
    unidad.addEventListener("input", compruebaUnidad);

    const precio = formCreate.elements.namedItem("precio");
    precio.addEventListener("input", compruebaPrecio);
}

async function createSubmit(e) {
    e.preventDefault();
    const formCreate = e.target;
    try {
        const formData = new FormData(formCreate);
        const response = await postData(`/ingrediente/createIngrediente`, formData);
        window.location.assign(`/usuarios/administrar`);
    } catch (err) {
        if (err instanceof ResponseError) {
            switch (err.response.status) {
                case 400:
                    await displayErrores(err.response);
                    break;
                default:
                    mostrarError(err.response.status, await err.response.json());
                    break;
            }
        }
        console.error(`Error: `, err);
    }
}

async function displayErrores(response) {
    const { errores } = await response.json();
    const formCreate = document.forms.namedItem('form-create-ingrediente');
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

    const validity = nombreIngredienteValido(nombre.value)
    if (validity == "") {
        nombre.setCustomValidity('');
    } else {
        nombre.setCustomValidity(validity);
    }

    const esNombreValido = nombre.checkValidity();
    if (esNombreValido) {
        nombre.parentNode.querySelector(`input[name="${nombre.name}"] ~ span.error`).textContent = ' ';
    } else {
        nombre.parentNode.querySelector(`input[name="${nombre.name}"] ~ span.error`).textContent = '⚠';
    }
    // Muestra el mensaje de validación
    nombre.reportValidity();
}

function nombreIngredienteValido(nombre) {
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

function compruebaUnidad(e) {
    const unidad = e.target;

    const validity = unidadIngredienteValida(unidad.value)
    if (validity == "") {
        unidad.setCustomValidity('');
    } else {
        unidad.setCustomValidity(validity);
    }

    const esUnidadValida = unidad.checkValidity();
    if (esUnidadValida) {
        unidad.parentNode.querySelector(`input[name="${unidad.name}"] ~ span.error`).textContent = ' ';
    } else {
        unidad.parentNode.querySelector(`input[name="${unidad.name}"] ~ span.error`).textContent = '⚠';
    }
    // Muestra el mensaje de validación
    unidad.reportValidity();
}

function unidadIngredienteValida(unidad) {
    const regex = /^[\p{L}/]*$/u;
    const trimmed = unidad.trim();
    if (trimmed === "")
        return "La unidad no puede ser vacía";
    if (!regex.test(trimmed))
        return "Sólo puede contener letras";
    if (trimmed.length > 15)
        return "Máximo 15 caracteres";
    return "";
}

function compruebaPrecio(e) {
    const precio = e.target;

    const validity = precioIngredienteValido(precio.value)
    if (validity == "") {
        precio.setCustomValidity('');
    } else {
        precio.setCustomValidity(validity);
    }

    const esPrecioValido = precio.checkValidity();
    if (esPrecioValido) {
        precio.parentNode.querySelector(`input[name="${precio.name}"] ~ span.error`).textContent = ' ';
    } else {
        precio.parentNode.querySelector(`input[name="${precio.name}"] ~ span.error`).textContent = '⚠';
    }
    // Muestra el mensaje de validación
    precio.reportValidity();
}

function precioIngredienteValido(precio) {
    if (precio === "")
        return "El precio no puede ser vacío";
    if (!Number.isFinite(Number(precio)))
        return "El precio debe ser un número"
    if (precio <= 0)
        return "El precio debe ser mayor que cero";
    return "";
}

