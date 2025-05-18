document.addEventListener('DOMContentLoaded', init);

let i = 0;

function init() {

    const formUpdateArray = document.querySelectorAll('form[name="form-update-ingrediente"]'); // Esto es un array de formularios, porque hay un formulario de actualización por fila de ingrediente
    formUpdateArray.forEach((element) => {
        element.addEventListener("submit", updateSubmit);

        const id_ingrediente = element.elements.namedItem('id').value;

        const input_nombre = document.querySelector(`input#ingrediente-${id_ingrediente}-nombre`);
        input_nombre.addEventListener("input", compruebaNombreIngrediente);

        const input_unidad = document.querySelector(`input#ingrediente-${id_ingrediente}-unidad`);
        input_unidad.addEventListener("input", compruebaUnidadIngrediente);

        const input_precio = document.querySelector(`input#ingrediente-${id_ingrediente}-precio`);
        input_precio.addEventListener("input", compruebaPrecioIngrediente);
    });
}

async function updateSubmit(e) {
    e.preventDefault();
    const formUpdate = e.target;
    try {
        const formData = new FormData(formUpdate);
        appendData(formData);
        const response = await postData('/ingrediente/updateIngrediente', formData);
        //window.location.assign('/usuarios/administrar');
        mostrarConfirmacion(formData, response);
    } catch (err) {
        if (err instanceof ResponseError) {
            switch (err.response.status) {
                case 400:
                    await displayErrores(err.response, formUpdate);
                    break;
                default:
                    mostrarError(err.response.status, await err.response.json());
                    break;
            }
        }
        console.error(`Error: `, err);
    }
}

async function displayErrores(response, formUpdate) {
    const { errores } = await response.json();
    for (const input of formUpdate.elements) {
        if (input.name == undefined || input.name === '') continue;
        const feedback = formUpdate.querySelector(`*[name="${input.name}"] ~ span.error`);
        if (feedback == undefined) continue;

        feedback.textContent = '';

        const error = errores[input.name];
        if (error) {
            feedback.textContent = error.msg;
        }
    }
}

function appendData(formData) {
    const id_ingrediente = formData.get("id");

    const input_nombre = document.querySelector(`input#ingrediente-${id_ingrediente}-nombre`);

    const input_unidad = document.querySelector(`input#ingrediente-${id_ingrediente}-unidad`);

    const input_precio = document.querySelector(`input#ingrediente-${id_ingrediente}-precio`);

    formData.append(input_nombre.name, input_nombre.value);
    formData.append(input_unidad.name, input_unidad.value);
    formData.append(input_precio.name, input_precio.value);
}

async function mostrarConfirmacion(formData, response) {
    const id_ingrediente = formData.get("id");
    const json = await response.json();
    const changed = json.changed;

    // Se ponen ticks en los campos que el cliente cambió
    if (changed.find((e) => e === 'nombre'))
        document.querySelector(`input#ingrediente-${id_ingrediente}-nombre ~ span.feedback`).textContent = '✔';

    if (changed.find((e) => e === 'unidad'))
        document.querySelector(`input#ingrediente-${id_ingrediente}-unidad ~ span.feedback`).textContent = '✔';

    if (changed.find((e) => e === 'precio'))
        document.querySelector(`input#ingrediente-${id_ingrediente}-precio ~ span.feedback`).textContent = '✔';
}

function compruebaNombreIngrediente(e) {
    const nombre = e.target;

    const validity = nombreIngredienteValido(nombre.value)
    if (validity == "") {
        nombre.setCustomValidity('');
    } else {
        nombre.setCustomValidity(validity);
    }

    const esNombreValido = nombre.checkValidity();
    if (esNombreValido) {
        nombre.parentNode.querySelector('span.error').textContent = ' ';
    } else {
        nombre.parentNode.querySelector('span.error').textContent = '⚠';
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

function compruebaPrecioIngrediente(e) {
    const precio = e.target;

    const validity = precioIngredienteValido(precio.value)
    if (validity == "") {
        precio.setCustomValidity('');
    } else {
        precio.setCustomValidity(validity);
    }

    const esNombreValido = precio.checkValidity();
    if (esNombreValido) {
        precio.parentNode.querySelector('span.error').textContent = ' ';
    } else {
        precio.parentNode.querySelector('span.error').textContent = '⚠';
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

function compruebaUnidadIngrediente(e) {
    const unidad = e.target;

    const validity = unidadIngredienteValida(unidad.value)
    if (validity == "") {
        unidad.setCustomValidity('');
    } else {
        unidad.setCustomValidity(validity);
    }

    const esNombreValido = unidad.checkValidity();
    if (esNombreValido) {
        unidad.parentNode.querySelector('span.error').textContent = ' ';
    } else {
        unidad.parentNode.querySelector('span.error').textContent = '⚠';
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
        return "La unidad contiene caracteres no permitidos";
    if (trimmed.length > 15)
        return "Máximo 15 caracteres";
    return "";
}