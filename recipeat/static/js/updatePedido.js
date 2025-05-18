document.addEventListener('DOMContentLoaded', init);

let i = 0;

function init() {

    const formUpdateArray = document.querySelectorAll('form[name="form-update-pedido"]'); // Esto es un array de formularios, porque hay un formulario de actualización por fila de ingrediente
    formUpdateArray.forEach((element) => {
        element.addEventListener("submit", updateSubmit);

        const id_ingrediente = element.elements.namedItem('id').value;

        const input_cantidad = document.querySelector(`input#ingrediente-${id_ingrediente}-cantidad`);
        input_cantidad.addEventListener("input", compruebaCantidadIngrediente);
    });

    const formDeleteArray = document.querySelectorAll('form[name="form-remove_ingrediente-pedido"]'); // Esto es un array de formularios, porque hay un formulario de actualización por fila de ingrediente
    formDeleteArray.forEach((element) => {
        element.addEventListener("submit", deleteSubmit);
    });
}

async function deleteSubmit(e) {
     e.preventDefault();
    const formDelete = e.target;
    try {
        const formData = new FormData(formDelete);
        const response = await postData('/pedido/removeIngrediente', formData);
        eliminarFila(formData);
    } catch (err) {
        if (err instanceof ResponseError) {
            switch (err.response.status) {
                case 400:
                    await displayErrores(err.response, formDelete);
                    break;
                default:
                    mostrarError(err.response.status, await err.response.json());
                    break;
            }
        }
        console.error(`Error: `, err);
    }
}

async function updateSubmit(e) {
    e.preventDefault();
    const formUpdate = e.target;
    try {
        const formData = new FormData(formUpdate);
        appendData(formData);
        const response = await postData('/pedido/updatePedido', formData);
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

function eliminarFila(formData){
    const id_ingrediente = formData.get("id");

    const index_fila_ingrediente = document.querySelector(`tr#ingrediente-${id_ingrediente}`).rowIndex;

    const tabla = document.querySelector('table');

    tabla.deleteRow(index_fila_ingrediente);

    if(tabla.rows.length > 1) // Se compara con 1 porque la fila de los nombres de columna cuenta
        calcularPrecioTotal(); // Si quedan ingredientes calculas el nuevo precio total
    else
        window.location.assign("/pedido/verPedido"); // Si no quedan recargas la página para mostrar el mensaje de sin ingredientes
}

function appendData(formData) {
    const id_ingrediente = formData.get("id");

    const input_cantidad = document.querySelector(`input#ingrediente-${id_ingrediente}-cantidad`);

    formData.append("cantidad", input_cantidad.value);
}

async function mostrarConfirmacion(formData, response) {
    const id_ingrediente = formData.get("id");
    const json = await response.json();
    const nuevoPrecio = json.nuevoPrecio;

    document.querySelector(`input#ingrediente-${id_ingrediente}-cantidad ~ span.feedback`).textContent = '✔';

    document.querySelector(`span#ingrediente-${id_ingrediente}-precio`).textContent = `${nuevoPrecio}€`;

        document.querySelector(`input#hiddenInput-${id_ingrediente}-precio`).value = nuevoPrecio;

    calcularPrecioTotal();
}

function calcularPrecioTotal(){
    const spanPrecioTotal = document.querySelector('span.precio-total');

    let sumaPrecio = 0;

    const arrayPrecios = document.querySelectorAll('input[name="span-precio"]');
    arrayPrecios.forEach((e) => {
        sumaPrecio += Number(e.value);
    });

    spanPrecioTotal.textContent = `${sumaPrecio}€`;
}

function compruebaCantidadIngrediente(e) {
    const cantidad = e.target;

    const validity = cantidadIngredienteValida(cantidad.value)
    if (validity == "") {
        cantidad.setCustomValidity('');
    } else {
        cantidad.setCustomValidity(validity);
    }

    const esNombreValido = cantidad.checkValidity();
    if (esNombreValido) {
        cantidad.parentNode.querySelector('span.error').textContent = ' ';
    } else {
        cantidad.parentNode.querySelector('span.error').textContent = '⚠';
    }
    // Muestra el mensaje de validación
    cantidad.reportValidity();
}

function cantidadIngredienteValida(cantidad) {
    if (cantidad === "")
        return "La cantidad no puede ser vacía";
    if (!Number.isFinite(Number(cantidad)))
        return "La cantidad debe ser un número"
    if (cantidad <= 0)
        return "La cantidad debe ser mayor que cero";
    return "";
}