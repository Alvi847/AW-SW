document.addEventListener('DOMContentLoaded', init);



// Guardamos los ingredientes para no tener que pedirlos al servidor cada vez que queramos verlos
let ingredientes = [];
let numIngredientes = 0;
let ingredientes_seleccionados = [] // Para que no se seleccionen los mismos ingredientes


function init() {
    const formUpdate = document.forms.namedItem("form-update-receta");
    formUpdate.addEventListener("submit", updateSubmit);

    const nombre = formUpdate.elements.namedItem('nombre');
    nombre.addEventListener("input", compruebaNombre);

    const descripcion = formUpdate.elements.namedItem("descripcion");
    descripcion.addEventListener("input", compruebaDescripcion);

    const preparacion = formUpdate.elements.namedItem("modo_preparacion");
    preparacion.addEventListener("input", compruebaPreparacion);

    const imagen = formUpdate.elements.namedItem("imagen");
    imagen.addEventListener("input", compruebaImagen);

    const botonAgregar = formCreate.elements.namedItem('addIngrediente');
    botonAgregar.addEventListener('click', crearLineaIngrediente);

    const botonEliminar = formCreate.elements.namedItem('removeIngrediente');
    botonEliminar.addEventListener('click', eliminaLineaIngrediente);

    crearLineaIngrediente();
}

export async function crearLineaIngrediente() {

    const contenedor = document.getElementById("lista-ingredientes");

    const div = document.createElement('div');
    div.className = 'linea-ingrediente';
    div.id = `linea_ingrediente_${numIngredientes}`; // Cada div se marca con el número de ingredientes

    // Puse que los ingredientes se cargan solo cuando se carga el html de la pagina
    const selectIngredientes = document.createElement('select');
    await cambiaIngredientes(selectIngredientes);

    selectIngredientes.name = `ingredientes_id[]`;
    selectIngredientes.id = `${numIngredientes}`; // Usamos también el número de ingredientes como indice para identificar cada select (sirve para cuando hacemos la comprobación de repetidos)

    const input = document.createElement('input');
    input.type = 'number';
    input.step = "0.01";
    input.min = 0;
    input.placeholder = 'Cantidad';
    input.name = `ingredientes_cantidad[]`; // Usando "[]" se envía como array
    input.addEventListener("change", compruebaCantidad);

    const unidadSpan = document.createElement('span');
    unidadSpan.className = 'unidad';
    selectIngredientes.addEventListener('change', actualizarUnidadEvent);
    selectIngredientes.addEventListener('change', compruebaRepetidosEvent);

    if (ingredientes.length != 0) {
        actualizarUnidad(unidadSpan, selectIngredientes);
    }

    
    // Creamos span para indicar la validez de los ingredientes
    crearCamposDeValidacionIngrediente(div);
    
    // Se añaden los elementos al div
    div.appendChild(selectIngredientes);
    div.appendChild(input);
    div.appendChild(unidadSpan);
    
    // Creamos span para indicar la validez de las cantidades
    crearCamposDeValidacionCantidad(div);
    
    contenedor.appendChild(div);
    
    // Se comprueban repetidos después de añadir el selct al div
    compruebaRepetidos(selectIngredientes);

    // Se marca el elemento como seleccionado
    ingredientes_seleccionados[numIngredientes] = selectIngredientes.options[selectIngredientes.selectedIndex].value;
    
    numIngredientes++;
}

/**
 * Crea span para indicar la validez de los ingredientes
 * @param {*} div 
 */
export function crearCamposDeValidacionIngrediente(div){
    const errorSpanIngrediente = document.createElement('span');
    errorSpanIngrediente.className = 'error';
    errorSpanIngrediente.id = 'ingrediente';

    const feedbackSpanIngrediente = document.createElement('span');
    feedbackSpanIngrediente.className = 'feedback';
    feedbackSpanIngrediente.id = 'ingrediente';

    div.appendChild(errorSpanIngrediente);
    div.appendChild(feedbackSpanIngrediente);
}

/**
 * Crea span para indicar la validez de las cantidades
 * @param {*} div 
 */
export function crearCamposDeValidacionCantidad(div){
    const errorSpanCantidad = document.createElement('span');
    errorSpanCantidad.className = 'error';
    errorSpanCantidad.id = 'cantidad';

    const feedbackSpanCantidad = document.createElement('span');
    feedbackSpanCantidad.className = 'feedback';
    feedbackSpanCantidad.id = 'cantidad';

    div.appendChild(errorSpanCantidad);
    div.appendChild(feedbackSpanCantidad);
}

// Eliminamos la última línea de ingredientes
export function eliminaLineaIngrediente(){
    const div = document.getElementById(`linea_ingrediente_${numIngredientes - 1}`);
    const selectIngredientes = document.getElementById(`${numIngredientes - 1}`);
    ingredientes_seleccionados[Number(selectIngredientes.id)] = selectIngredientes.options[selectIngredientes.selectedIndex].value = -1
    div.remove();
    numIngredientes--;
}

async function updateSubmit(e) {
    e.preventDefault();
    const formUpdate = e.target;
    const id_receta = formUpdate.elements.namedItem("id_receta").value;
    try {
        const formData = new FormData(formUpdate);
        const response = await post(`/receta/updateReceta/${id_receta}`, formData);
        window.location.assign(`/receta/verReceta/${id_receta}`);
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
    const formUpdate = document.forms.namedItem('form-update-receta');
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
    displayErroresIngredientes(errores);
}

function displayErroresIngredientes(errores) {
    const spanError = document.getElementById('general-error');
    if ('ingredientes_id' in errores || 'ingredientes_cantidad' in errores) {
        spanError.textContent = (errores['ingredientes_id'].msg || errores['ingredientes_cantidad'].msg);
    }
    else{
        for(let i = 0; i < numIngredientes; i++)
            if (`ingredientes_cantidad[${i}]` in errores)
                spanError.textContent = errores[`ingredientes_cantidad[${i}]`].msg;

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

    // validación html5, porque el campo es <input type="nombre" ...>
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/checkValidity
    // se asigna la pseudoclase :invalid
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