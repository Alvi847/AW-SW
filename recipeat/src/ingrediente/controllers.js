import { validationResult, matchedData } from 'express-validator';
import { render } from '../utils/render.js';
import { Contiene, Ingrediente } from './Ingrediente.js';

// Agregar un nuevo ingrediente
export function doCreateIngrediente(req, res, next) {
    const result = validationResult(req);

    const requestWith = req.get('X-Requested-With');
    const esAjax = requestWith != undefined && ['xmlhttprequest', 'fetch'].includes(requestWith.toLowerCase());
    if (esAjax)
        req.log.debug("Petición AJAX recibida para doCreateIngrediente()");

    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);

        if (esAjax) {
            req.log.debug("Devuelto código 400 a la petición AJAX");
            return res.status(400).json({ status: 400, errores });
        }

        return render(req, res, 'paginas/index', { //TODO: CAMBIAR URL
            datos,
            errores,
        });
    }

    const { nombre, unidad, precio } = matchedData(req);

    let ingrediente = new Ingrediente(nombre, precio, unidad);

    try {
        Ingrediente.insertIngrediente(ingrediente);

        req.log.info("Ingrediente '%s' registrado (Precio/unidad: %f/%s)", nombre, precio, unidad);

        if (esAjax) {
            req.log.debug("Devuelto código 200 a la petición AJAX");
            return res.status(200).json({ ok: true });
        }

        // Redirigir al finalizar
        return res.redirect(`/usuarios/administrar`);
    }
    catch (e) {
        req.log.error("Error al crear el ingrediente: %s", e.message);

        const err = {};

        err.statusCode = 500;
        err.message = "Error al crear el ingrediente";

        next(err, req, res);
    }
}

// Eliminar un ingrediente
export function deleteIngrediente(req, res, next) {

    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        return render(req, res, `paginas/index`, { //TODO: CAMBIAR URL
            datos,
            errores,
        });
    }

    const id_ingrediente = matchedData(req);

    try {
        Ingrediente.deleteIngrediente(id_ingrediente);
    }
    catch (e) {
        req.log.error("Error al eliminar el ingrediente '%i': %s ", id_ingrediente, e.message);

        const err = {};

        err.statusCode = 500;
        err.message = "Error al borrar el ingrediente";

        next(err, req, res);

    }

    // Redirigir al finalizar
    res.redirect(`paginas/index`);  //TODO: CAMBIAR URL
}

// Cambiar los datos de un ingrdiente
export function updateIngrediente(req, res, next) {
    const result = validationResult(req);

    const requestWith = req.get('X-Requested-With');
    const esAjax = requestWith != undefined && ['xmlhttprequest', 'fetch'].includes(requestWith.toLowerCase());
    if (esAjax)
        req.log.debug("Petición AJAX recibida para updateIngrediente()");


    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);

        if (esAjax) {
            req.log.debug("Devuelto código 400 a la petición AJAX");
            return res.status(400).json({ status: 400, errores });
        }

        return render(req, res, `paginas/index`, { //TODO: CAMBIAR URL
            datos,
            errores,
        });
    }

    try {

        const { id, nombre, precio, unidad } = matchedData(req);

        let ingredienteExistente = Ingrediente.getIngredienteById(id);

        const changed = []; // Campos del ingrediente cambiados

        /*  Estos ifs se hacen para saber qué campos ha cambiado el cliente
            Se devuelve un JSON al cliente con los datos cambiados, para que muestre por pantalla el feedback en los elementos cambiados*/
        if (ingredienteExistente.nombre != nombre) {
            ingredienteExistente.nombre = nombre;
            changed.push('nombre');
        }

        if (ingredienteExistente.precio != precio) {
            ingredienteExistente.precio = precio;
            changed.push('precio');
        }

        if (ingredienteExistente.unidad != unidad) {
            ingredienteExistente.unidad = unidad;
            changed.push('unidad');
        }

        if (changed.length !== 0) { // Si no ha habido cambios se evita hacer este acceso a la base de datos
            Ingrediente.cambiaIngrediente(ingredienteExistente);
            req.log.info("Ingrediente %i, con nombre '%s', actualizado con éxito (precio: %i, unidad: %s)", id, nombre, precio, unidad);
        }

        if (esAjax) {
            req.log.debug("Devuelto código 200 a la petición AJAX");
            return res.status(200).json({ ok: true, changed });
        }

        return res.redirect('/usuarios/administrar');
    }
    catch (e) {
        req.log.error("No se ha podido actualizar el ingrediente: '%s'", e.message);

        const err = {};

        err.statusCode = 500;
        err.message = "Se produjo un error al actualizar el ingrediente";

        next(err, req, res);
    }

}

// Añade un ingrediente a una receta
export function addIngrediente(req, res, next) {

    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        return render(req, res, `paginas/index`, { //TODO: CAMBIAR URL
            datos,
            errores,
        });
    }

    const { nombre, id_receta, cantidad } = matchedData(req);

    try {
        const id_ingrediente = Ingrediente.getIngredienteById(nombre).id;
        Contiene.insertContiene(id_ingrediente, id_receta, cantidad);
    }
    catch (e) {
        req.log.error("Error al añadir el ingrediente '%i': %s a la receta '%i'", id_ingrediente, e.message, id_receta);


        const err = {};

        err.statusCode = 500;
        err.message = "Error al añadir el ingrediente a la receta";

        next(err, req, res);
    }

    // Redirigir al finalizar
    res.redirect(`paginas/index`);  //TODO: CAMBIAR URL
}