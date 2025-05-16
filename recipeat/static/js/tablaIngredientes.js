document.addEventListener('DOMContentLoaded', init);

let i = 0;

function init() {

    const formUpdate = document.querySelectorAll('form[name="form-update-ingrediente"]');
    formUpdate.forEach((element) => { element.addEventListener("submit", updateSubmit); });
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