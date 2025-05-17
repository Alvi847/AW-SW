document.addEventListener('DOMContentLoaded', init);

let i = 0;

function init() {

    const formSendArray = document.forms.namedItem("form-send-ingredientes");
    if(formSendArray)
        formSendArray.addEventListener("submit", sendSubmit);
}

async function sendSubmit(e) {
    e.preventDefault();
    const formSendArray = e.target;
    try {
        const data = dataToJson(formSendArray); // convertimos los datos que queremos a formato json
        const response = await postJson('/pedido/addIngredientesToPedido', data);
        mostrarConfirmacion(formSendArray);
    } catch (err) {
        if (err instanceof ResponseError) {
            switch (err.response.status) {
                default:
                    spanError(formSendArray);
                    break;
            }
        }
        console.error(`Error: `, err);
    }
}

// Función para poner los datos de los inputs correctamente en el formData
function dataToJson(formSendArray) {

    const array_ids = formSendArray.querySelectorAll(`input[name="ingredientes_id[]"]`);

    const input_username = formSendArray.querySelector(`input[name="username"]`);

    const array_cantidades = formSendArray.querySelectorAll(`input[name="ingredientes_cantidad[]"]`);

    let ids_values = [];
    let cantidades_values = [];

    array_cantidades.forEach((input) =>{
        cantidades_values.push(input.value);
    });
    
    array_ids.forEach((input) =>{
        ids_values.push(input.value);
    });

    const data = {};

    data.username = input_username.value;
    data.ingredientes_id = ids_values;
    data.ingredientes_cantidad = cantidades_values;

    return data;
}

async function mostrarConfirmacion(formSendArray) {

    formSendArray.querySelector(`button[type="submit"] ~ span.feedback`).textContent = 'Ingredientes añadidos al pedido';
}

async function spanError(formSendArray){
    formSendArray.querySelector(`button[type="submit"] ~ span.error`).textContent = 'Hubo un error al añadir los ingredientes. ¡Lo sentimos! D:';
}