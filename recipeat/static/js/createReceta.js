document.addEventListener('DOMContentLoaded', init);

// Guardamos los ingredientes para no tener que pedirlos al servidor cada vez que queramos verlos
let ingredientes = [];
let numIngredientes = 0;
let ingredientes_seleccionados = [] // Para que no se seleccionen los mismos ingredientes

function init() {

    const formCreate = document.forms.namedItem("form-create-receta");
    formCreate.addEventListener("submit", createSubmit);

    const nombre = formCreate.elements.namedItem('nombre');
    nombre.addEventListener("input", compruebaNombre);

    const descripcion = formCreate.elements.namedItem("descripcion");
    descripcion.addEventListener("input", compruebaDescripcion);

    const preparacion = formCreate.elements.namedItem("modo_preparacion");
    preparacion.addEventListener("input", compruebaPreparacion);

    const botonAgregar = formCreate.elements.namedItem('addIngrediente');
    botonAgregar.addEventListener('click', crearLineaIngrediente);

    const botonEliminar = formCreate.elements.namedItem('removeIngrediente');
    botonEliminar.addEventListener('click', eliminaLineaIngrediente);

    crearLineaIngrediente();

    const imagen = formCreate.elements.namedItem("imagen");
    imagen.addEventListener("input", compruebaImagen);

}

async function crearLineaIngrediente() {

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
    input.name = `ingredientes_cantidad[]`; // Usando el mismo nombre se envía como un array
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
function crearCamposDeValidacionIngrediente(div){
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
function crearCamposDeValidacionCantidad(div){
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
function eliminaLineaIngrediente(){
    const div = document.getElementById(`linea_ingrediente_${numIngredientes - 1}`);
    const selectIngredientes = document.getElementById(`${numIngredientes - 1}`);
    ingredientes_seleccionados[Number(selectIngredientes.id)] = selectIngredientes.options[selectIngredientes.selectedIndex].value = -1
    div.remove();
    numIngredientes--;
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

async function cambiaIngredientes(select) {
    const dropdown = select;

    // Limpiamos ingredientes anteriores
    dropdown.innerHTML = '';

    if (ingredientes.length == 0)
        ingredientes = await pedirIngredientes();

    // Agregamos los ingredientes recibidos
    ingredientes.data.forEach(ingrediente => {
        const opt = document.createElement('option');
        opt.value = ingrediente.id;
        opt.textContent = ingrediente.nombre;
        dropdown.appendChild(opt);
    });
}

/**
 * Pregunta al servidor por los ingredientes disponibles
 * 
 * @returns un array de json con los ingredientes, de la forma: [{id: "id_ingrediente", unidad: "unidad de medida"}]
 */
async function pedirIngredientes() {
    const response = await postJson('/api/ingredientes/lista', {
        /* TODO: Dejar como json, por si podemos en el futuro implementar filtros para no tener que enviar toda la lista de ingredientes al cliente */
    });
    const jsonData = await response.json();
    return jsonData;
}


function actualizarUnidadEvent(e) {
    const selectIngredientes = e.target;
    const contenedor = selectIngredientes.parentElement;
    const unidadSpan = contenedor.querySelector('span.unidad');

    actualizarUnidad(unidadSpan, selectIngredientes);
};

function actualizarUnidad(unidadSpan, selectIngredientes){
    const seleccionado = ingredientes.data.find(i => i.id == selectIngredientes.value);
    unidadSpan.textContent = seleccionado?.unidad || '';
}

function compruebaCantidad(e){
     const cantidad = e.target;

    const validity = cantidadValida(cantidad.value)
    if (validity == "") {
        cantidad.setCustomValidity('');
    } else {
        cantidad.setCustomValidity(validity);
    }

    const esCantidadValida = cantidad.checkValidity();
    
    let spanError = cantidad.parentNode.querySelector('span#cantidad.error');
    let spanFeedback = cantidad.parentNode.querySelector('span#cantidad.feedback');

    if (esCantidadValida) {
        spanError.textContent = ' ';
        spanFeedback.textContent = '✔';
    } else {
        spanError.textContent = '⚠';
        spanFeedback.textContent = ' ';
    }
    // Muestra el mensaje de validación
    cantidad.reportValidity();
}

function cantidadValida(cantidad) {
    if (cantidad === "")
        return "La cantidad no puede ser vacía";
    if (!Number.isFinite(Number(cantidad)))
        return "La cantidad debe ser un número"
    if (cantidad <= 0)
        return "La cantidad debe ser mayor que cero";
    return "";
}

function compruebaRepetidosEvent(e){
    const selectIngredientes = e.target;
    compruebaRepetidos(selectIngredientes);
}

function compruebaRepetidos(selectIngredientes){
    const validity = checkIngredienteRepetido(selectIngredientes.options[selectIngredientes.selectedIndex].value)
    if (validity == "") {
        selectIngredientes.setCustomValidity('');
    } else {
        selectIngredientes.setCustomValidity(validity);
    }

    const esRepetido = !selectIngredientes.checkValidity();
    
    let spanError = selectIngredientes.parentNode.querySelector('span#ingrediente.error');
    let spanFeedback = selectIngredientes.parentNode.querySelector('span#ingrediente.feedback');

    if (esRepetido) {
        spanError.textContent = '⚠';
        spanFeedback.textContent = ' ';
    }
    else{
        spanError.textContent = ' ';
        spanFeedback.textContent = '✔'; 
    }

    // Marcamos el ingrediente actual como selccionado
    ingredientes_seleccionados[Number(selectIngredientes.id)] = selectIngredientes.options[selectIngredientes.selectedIndex].value

    // Muestra el mensaje de validación
    selectIngredientes.reportValidity();
}

function checkIngredienteRepetido(ingrediente){
    if(ingredientes_seleccionados.includes(ingrediente))
        return "Selecciona cada ingrediente una sola vez";
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