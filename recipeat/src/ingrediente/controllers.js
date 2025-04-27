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

    const { nombre, unidad, precio } = req.body;

    let ingrediente = new Ingrediente(nombre, precio, unidad);

    Ingrediente.insertIngrediente(ingrediente);

    req.log.info("Ingrediente '%s' registrado (Precio/unidad: %f/%s)", nombre, precio, unidad);

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

    const nombre = req.body;

    try{
        Ingrediente.getIngredienteByName(nombre);
        Ingrediente.deleteIngrediente(nombre);
    }
    catch(err){
        req.log.error("Error al eliminar el ingrediente '%s': %s ", nombre, err.message);
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

    const {nombre, id_receta, cantidad} = req.body;

    try{
        Ingrediente.getIngredienteByName(nombre);
        Contiene.insert(nombre, id_receta, cantidad);
    }
    catch(err){
        req.log.error("Error al eliminar el ingrediente '%s': %s ", nombre, err.message);
    }

    // Redirigir al finalizar
    res.redirect(`paginas/index`);  //TODO: CAMBIAR URL
}