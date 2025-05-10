import { validationResult, matchedData } from 'express-validator';
import { render } from '../utils/render.js';
import { Contiene, Ingrediente } from './Ingrediente.js';

// Agregar un nuevo ingrediente
export function doCreateIngrediente(req, res) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        return render(req, res, 'paginas/index', { //TODO: CAMBIAR URL
            datos,
            errores,
        });
    }

    const { id_ingrediente, unidad, precio } = req.body;

    let ingrediente = new Ingrediente(id_ingrediente, precio, unidad);

    Ingrediente.insertIngrediente(ingrediente);

    req.log.info("Ingrediente '%i' registrado (Precio/unidad: %f/%s)", id_ingrediente, precio, unidad);

    // Redirigir al finalizar
    res.redirect(`paginas/index`);  //TODO: CAMBIAR URL
}

// Eliminar un ingrediente
export function deleteIngrediente(req, res) {

    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        return render(req, res, `paginas/index`, { //TODO: CAMBIAR URL
            datos,
            errores,
        });
    }

    const id_ingrediente = req.body;

    try{
        Ingrediente.deleteIngrediente(id_ingrediente);
    }
    catch(err){
        req.log.error("Error al eliminar el ingrediente '%i': %s ", id_ingrediente, err.message);
    }

    // Redirigir al finalizar
    res.redirect(`paginas/index`);  //TODO: CAMBIAR URL
}

export function addIngrediente(req, res){

    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        return render(req, res, `paginas/index`, { //TODO: CAMBIAR URL
            datos,
            errores,
        });
    }

    const {id_ingrediente, id_receta, cantidad} = req.body;

    try{
        Ingrediente.getIngredienteByName(id_ingrediente);
        Contiene.insert(id_ingrediente, id_receta, cantidad);
    }
    catch(err){
        req.log.error("Error al añadir el ingrediente '%i': %s a la receta '%i'", id_ingrediente, err.message, id_receta);
    }

    // Redirigir al finalizar
    res.redirect(`paginas/index`);  //TODO: CAMBIAR URL
}