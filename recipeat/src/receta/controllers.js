import { Receta } from './Receta.js';
import { Comentario } from '../comentario/Comentario.js';
import { Preferencias } from '../usuarios/Usuario.js';
import { validationResult, matchedData } from 'express-validator';
import { render } from '../utils/render.js';
import { UPLOAD_PATH } from './router.js';
import { join } from 'node:path';
import sanitizeHtml from 'sanitize-html';
import { errorAjax } from '../middleware/error.js';


/**
 * Para que los formularios funcionen usando multer y express-validator, he de parsear los datos con multer antes de pasarlos por el validator
 * (https://stackoverflow.com/questions/63632356/multer-and-express-validator-creating-problem-in-validation)
 * 
 * Si el usuario envía el formulario con una foto, pero algún otro campo inválido (que no pase el filtro), multer subirá la foto al servidor igualmente,
 * aunque no se cree la receta. Así que esta es la forma que tengo de solucionar esto. Si el formulario no es válido, borro la foto en caso de haber alguna
 * 
 */
import * as fs from 'node:fs/promises';
import { Contiene } from '../ingrediente/Ingrediente.js';
import { logger } from '../logger.js';

// Ver las recetas (página de inicio de recetas)

export function viewRecetas(req, res, next) {
    let contenido = 'paginas/listaRecetas';
    const login = req.session.login;
    const user = req.session.username;

    const { gusto, nivel, dieta } = req.query;
    let preferencias = {};

    if (gusto || nivel || dieta) {
        // Filtros enviados por el usuario
        preferencias = { gusto, nivel, dieta };
    } else if (login && user) {
        // Preferencias guardadas del usuario
        preferencias = Preferencias.getPreferenciasUsuario(user);
    }

    // Obtener recetas según filtros o preferencias
    let recetas = Receta.getAllRecetas();

    if (preferencias.gusto)
        recetas = recetas.filter(r => r.gusto === preferencias.gusto);
    if (preferencias.nivel)
        recetas = recetas.filter(r => r.nivel === preferencias.nivel);
    if (preferencias.dieta)
        recetas = recetas.filter(r => r.dieta === preferencias.dieta);

    // Favoritos y recomendaciones
    let favoritos = [];
    let recomendadas = [];

    if (login && user) {
        favoritos = Receta.getFavoritosPorUsuario(user);
        recomendadas = Receta.getRecomendadasPersonalizadas(user);
    }

    return render(req, res, contenido, {
        recetas,
        login,
        favoritos,
        recomendadas,
        preferencias
    });
}

// Ver una receta
export function viewReceta(req, res, next) {

    const result = validationResult(req);
    const err = {};

    if (!result.isEmpty()) {
        const errores = result.mapped();

        err.statusCode = 400;
        err.message = errores['id'].msg;

        return next(err, req, res); // Mostramos al usuario el error correspondiente (En este caso que el id debe ser un entero)
    }

    try {
        const id = req.params.id; // Ahora toma el id correctamente desde la URL
        const user = (req.session.username || null) // El usuario que quiere ver la receta (usado para ver si le ha dado like o no)
        const receta = Receta.getRecetaById(id, user); // Método para obtener la receta por ID
        const comentarios = Comentario.getAllComentarios(id, user);


        const ingredientes = Contiene.getIngredientesByReceta(id);

        let hayComentarios = true;
        if (comentarios.length == 0)
            hayComentarios = false;

        return render(req, res, 'paginas/verReceta', {
            receta,
            ingredientes,
            comentarios,
            hayComentarios,
            errores: {}
        });
    }
    catch (e) {
        e.statusCode = 500;
        next(e, req, res);
    }
}

// Crear una receta (mostrar el formulario de creación)
export function createReceta(req, res, next) {
    let contenido = 'paginas/createReceta';
    return render(req, res, contenido, {
        errores: {}
    });
}

// Agregar una nueva receta (procesar el formulario)
export async function doCreateReceta(req, res, next) {

    const result = validationResult(req);
    const requestWith = req.get('X-Requested-With');
    const esAjax = requestWith != undefined && ['xmlhttprequest', 'fetch'].includes(requestWith.toLowerCase());
    if (esAjax)
        logger.debug("Petición AJAX recibida para doCreateReceta()");

    if (!result.isEmpty()) {
        const errores = result.mapped();
        if (req.file)
            await fs.unlink(req.file.path); // (Ver comentario del import): https://midu.dev/como-eliminar-un-ficher-con-node-js/
        const datos = matchedData(req);

        if (esAjax) {
            logger.debug("Devuelto código 400 a la petición AJAX");
            return res.status(400).json({ status: 400, errores });
        }

        return render(req, res, 'paginas/createReceta', {
            datos,
            errores
        });
    }

    const { nombre, descripcion, modo_preparacion, gusto, nivel, dieta
        , ingredientes_id, ingredientes_cantidad } = matchedData(req)

    const imagen = req.file;

    // Insertar la receta en la base de datos
    try {

        const descripcionSegura = sanitizeHtml(descripcion, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
            allowedAttributes: {
                a: ['href', 'name', 'target'],
                img: ['src', 'alt', 'width', 'height'],
                '*': ['style'] // Si quieres permitir estilos en línea
            }
        });

        const modoPreparacionSeguro = sanitizeHtml(modo_preparacion, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'ul', 'li', 'h1', 'h2']),
            allowedAttributes: {
                img: ['src', 'alt'],
                '*': ['style']
            }
        });

        const nuevaReceta = new Receta(nombre, descripcionSegura, modoPreparacionSeguro, null, null, req.session.username, false, imagen.filename, gusto, nivel, dieta);

        const id_receta = Receta.insertReceta(nuevaReceta).id;

        const numIngredientes = (ingredientes_id.length || 1);

        // Introducimos todos los ingredientes en la nueva receta
        for (let i = 0; i < numIngredientes; i++) {
            Contiene.insertContiene(ingredientes_id[i], id_receta, ingredientes_cantidad[i]);
        }

        // Redirigir o devolver un mensaje de éxito

        if (esAjax) {
            logger.debug("Devuelto código 200 a la petición AJAX");
            return res.status(200).json({ ok: true });
        }

        return res.redirect('/receta/listaRecetas');
    }
    catch (e) {
        req.log.error("No se ha podido crear la receta: '%s'", e.message);

        const err = {};

        err.statusCode = 500;
        err.message = "Se produjo un error al crear la receta";

        if (esAjax)
            return errorAjax(err, res);
        next(err, req, res);
    }
}

// Mostrar el formulario de actualización con los datos actuales
export function viewUpdateReceta(req, res, next) {
    const result = validationResult(req);
    const err = {};

    if (!result.isEmpty()) {
        const errores = result.mapped();

        err.statusCode = 400;
        err.message = errores['id'].msg;

        return next(err, req, res); // Mostramos al usuario el error correspondiente
    }

    try {
        const id = req.params.id;
        const receta = Receta.getRecetaById(id); // Obtener la receta por ID

        if (req.session.username != receta.user) {
            err.message = "No puedes editar una receta que no es tuya";
            err.statusCode = 403;
            return next(err, req, res);
        }

        return render(req, res, 'paginas/updateReceta', {
            receta,
            errores: {},
            datos: {}
        });
    }
    catch (e) {
        e.statusCode = 500;
        return next(e, req, res);
    }
}

// Procesar la actualización de la receta
export async function updateReceta(req, res, next) {

    const requestWith = req.get('X-Requested-With');
    const esAjax = requestWith != undefined && ['xmlhttprequest', 'fetch'].includes(requestWith.toLowerCase());

    if (esAjax)
        req.log.debug("Petición AJAX recibida para updateReceta()");

    const result = validationResult(req);
    const err = {};

    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        if (req.file)
            await fs.unlink(req.file.path); // En la actualización también borramos la foto si el usuario ha subido alguna
        if (esAjax) {
            req.log.debug("Devuelto código 400 a la petición AJAX");
            return res.status(400).json({ status: 400, errores });
        }
        return render(req, res, `paginas/updateReceta`, {
            errores,
            receta: datos
        });
    }

    const id = req.params.id;
    const recetaExistente = Receta.getRecetaById(id);

    const { nombre, descripcion, modo_preparacion, gusto, nivel, dieta } = matchedData(req);
    const imagen = req.file;
    const user = req.session.username;

    if (recetaExistente.user === user || req.session.rol === 'A') {
        if (!recetaExistente.user) // En caso de un administrador estar editando una receta que fue colocada sin dueño (las recetas que colocamos al principio), el administrador que la esté editando pasará a ser su dueño
            recetaExistente.user = user;
        recetaExistente.nombre = nombre;
        recetaExistente.descripcion = descripcion;
        recetaExistente.modo_preparacion = modo_preparacion;
        recetaExistente.gusto = gusto || null;
        recetaExistente.nivel = nivel || null;
        recetaExistente.dieta = dieta || null;
        try {
            if (recetaExistente.imagen) {

                await fs.unlink(join(UPLOAD_PATH, "/", recetaExistente.imagen)); // Hay que borrar la foto anterior en caso de haber alguna
            }
            recetaExistente.imagen = imagen.filename;

            req.log.debug("Actualizando receta con id '%i'", id);

            Receta.updateReceta(recetaExistente);
        }
        catch (e) {
            req.log.error(e.message);

            err.message = "Ha ocurrido un error al editar la receta";
            err.statusCode = 500;
            if (esAjax)
                return errorAjax(err, res);
            return next(err, req, res);
        }
        req.log.info("Receta '%i', editada con éxito por '%s'", id, user);

        if (esAjax) {
            req.log.debug("Devuelto código 200 a la petición AJAX");
            return res.status(200).json({ ok: true });
        }
    }
    else
        logger.error("La receta '%i',no puede ser editada por '%s'", id, user);

    if (esAjax){
        err.message = "No tienes permisos para editar la receta"
        err.statusCode = 403;
        return errorAjax(err, res);
    }

    res.redirect(`/receta/verReceta/${id}`);
}

// Eliminar una receta
export async function deleteReceta(req, res, next) {

    const err = {};

    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        return render(req, res, `paginas/listaRecetas`, {
            datos,
            errores,
        });
    }

    const { id } = matchedData(req)
    const user = req.session.username;
    let receta = null;

    try {
        receta = Receta.getRecetaById(id, null);

        if (receta != null && (user === receta.user || req.session.rol === "A")) {
            Receta.deleteReceta(id); // Elimina la receta por ID
            await fs.unlink(join(UPLOAD_PATH, receta.imagen));  // Se borra la imagen de la receta del disco
            req.log.info("Receta '%i' eliminada con exito", id);
        }
    }
    catch (e) {
        req.log.error("Error interno al intentar eliminar la receta '%i': '%s'", id, e.message);
        err.message = "Ha ocurrido un error al intentar eliminar la receta";
        return next(err, req, res);
    }

    res.redirect('/receta/listaRecetas'); // Redirige a la lista de recetas
}

export function likeReceta(req, res, next) {

    const result = validationResult(req);
    const err = {};

    if (!result.isEmpty()) {
        const errores = result.mapped();

        err.statusCode = 400;
        err.message = errores['id'].msg;

        return next(err, req, res); // Mostramos al usuario el error correspondiente
    }

    const { id } = req.body;
    const user = req.session.username

    if (id && user != null) {
        const id_num = parseInt(id, 10); // Convertir a número

        try {
            const receta = Receta.getRecetaById(id_num, user);
            Receta.processLike(id_num, user);
            res.redirect(`/receta/verReceta/${id_num}`);
        }
        catch (e) {
            req.log.error("No se ha podido añadir el like de '%s' a la receta '%i'", user, id);
            err.message = "Ha ocurrido un error al intentar dar like a la receta";
            err.statusCode = 500;
            return next(err, req, res);
        }
    }
    else if (!id) {
        req.log.error("Receta '%i' no existe", id);
        err.message = "Ha ocurrido un error al intentar dar like a la receta";
        err.statusCode = 400;
        return next(err, req, res);
    }
}

// Ver las recetas del usuario logueado
export function viewMisRecetas(req, res, next) {
    let contenido = 'paginas/misRecetas';
    const user = req.session.username;

    if (!user) {
        return res.redirect('/login');
    }

    try {
        const recetas = Receta.getRecetasPorUsuario(user);
        render(req, res, contenido, {
            recetas,
            login: true
        });
    } catch (e) {
        req.log.error("Error al obtener las recetas del usuario '%s': %s", user, e.message);
        const err = {};

        err.statusCode = 500;
        err.message = "Error al obtener las recetas";

        next(err, req, res);
    }
}
