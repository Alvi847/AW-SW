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
        window.location.assign('/receta/listaRecetas');
        //mostrarConfirmacion(formData, response);
    } catch (err) {
        if (err instanceof ResponseError) {
            switch (err.response.status) {
                case 400:
                    await displayErrores(err.response, formSendArray);
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

    return data
}

async function mostrarConfirmacion(formData, response) {
    const id_ingrediente = formData.get("id");
    const json = await response.json();
    const nuevoPrecio = json.precio;

    document.querySelector(`input#ingrediente-${id_ingrediente}-cantidad ~ span.feedback`).textContent = '✔';

    document.querySelector(`input#ingrediente-${id_ingrediente}-cantidad`).value = nuevoPrecio;
}