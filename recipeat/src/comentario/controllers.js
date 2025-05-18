import { validationResult, matchedData } from 'express-validator';
import { Comentario } from './Comentario.js';
import { render } from '../utils/render.js';
import {errorAjax} from '../middleware/error.js'
import { logger } from '../logger.js';


// Agregar un nuevo comentario
export function doCreateComentario(req, res, next) {
    const result = validationResult(req);
    const err = {};
    const requestWith = req.get('X-Requested-With');
    const esAjax = requestWith != undefined && ['xmlhttprequest', 'fetch'].includes(requestWith.toLowerCase());
    if (esAjax)
        logger.debug("Petición AJAX recibida para doCreateComentario()");

    if (!result.isEmpty()) {
        const errores = result.mapped();

        if (esAjax) {
            logger.debug("Devuelto código 400 a la petición AJAX");
            return res.status(400).json({ status: 400, errores });
        }

        err.statusCode = 400;
        err.message = "El contenido del comentario no debe ser vacío y el id de receta debe ser el correcto";

        return next(err, req, res);
    }

    const { descripcion, id } = matchedData(req);
    const user = req.session.username;

    const nuevoComentario = new Comentario(user, id, null, descripcion, null);

    try {
        // Insertar comentario en la base de datos
        Comentario.insertComentario(nuevoComentario);
        if (esAjax) {
            logger.debug("Devuelto código 200 a la petición AJAX");
            return res.status(200).json({ ok: true });
        }
    }
    catch (e) {
        req.log.error(e);

        err.message = "Error al crear el comentario";
        err.statusCode = 500;

        if (esAjax)
            return errorAjax(err, res);
        next(err, req, res);
    }


    // Redirigir al finalizar
    res.redirect(`/receta/verReceta/${id}`);
}

// Eliminar un comentario
export function deleteComentario(req, res, next) {

    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        return render(req, res, `paginas/listaRecetas`, {
            datos,
            errores,
        });
    }

    const { id } = matchedData(req);
    const user = req.session.username;
    const err = {};

    let comentario = null

    if (id != null) {
        try {
            comentario = Comentario.getComentarioById(id, null);

            if (comentario != null && (user === comentario.user || req.session.rol === "A")) {
                Comentario.deleteComentario(id); // Elimina el comentario por ID
                logger.info("Comentario '%i' eliminado con exito", id);
                res.redirect(`/receta/verReceta/${comentario.id_receta}`); // Ahora redirige a la página de la receta  
            }
            else if (receta != null) {
                req.log.error("Error al elminar el comentario '%i', de '%s': acceso no permitido al usuario '%s'", id, comentario.user, user);
                err.message = "Acceso no permitido";
                next(err, req, res);
            }
        }
        catch (e) {
            req.log.error("Error interno al intentar eliminar el comentario '%i': '%s'", id, e.message);
            err.message = "Error interno al intentar eliminar el comentario";
            next(err, req, res);
        }
    }
    else if (!id) {
        req.log.error("Error al elminar un comentario: id inválido");
        err.message = "Error interno al intentar eliminar el comentario";
        next(err, req, res);
    }
}

// Añadir una valoración al comentario (He usado un formato de likes, pero si queremos poner estrellas ponemos estrellas)
export function valorarComentario(req, res, next) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        return render(req, res, `paginas/listaRecetas`, {
            datos,
            errores,
        });
    }

    const { id } = req.body;
    const user = req.session.username

    if (id && req.session.login) {
        const id_num = parseInt(id, 10); // 🔹 Convertir a número

        try {
            const comentario = Comentario.getComentarioById(id_num, user);
            Comentario.processLike(id_num, comentario.id_receta, user);
            res.redirect(`/receta/verReceta/${comentario.id_receta}`);
        }
        catch (e) {
            req.log.error("Error al añadir un like al comentario: '%s'", e.message);
            res.status(500).send();
        }
    }
    else if (!id) {
        req.log.error("Error al añadir un like al comentario: id inválido");
        res.status(400).send();
    }
    else {
        req.log.error("Error al añadir un like al comentario: Usuario no registrado");
        res.status(403).send();
    }

}