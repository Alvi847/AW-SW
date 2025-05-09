import { validationResult, matchedData } from 'express-validator';
import { Comentario } from './Comentario.js';
import { Receta } from '../receta/Receta.js';
import { render } from '../utils/render.js';

// Ver los comentarios
// ACTUALMENTE EN DESUSO, el middleware viewReceta ya carga los comentarios
/*export function viewComentarios(req, res) {
    const id_receta = req.params.id; // Id de la receta del comentario
    const user = req.session.username;

    let contenido = `pagina/`; // TODO: Poner URL correcta
    
    req.log.debug("Cargando todos los comentarios de la receta '%i'", id_receta);
    
    const comentarios = Comentario.getAllComentarios(id_receta, user);

    res.send(comentarios);
}*/

// Crear un comentario (mostrar el formulario de creación)
// NO SE USA
/*export function createComentario(req, res) {
    let contenido;
    const { id } = req.body;
    const user = req.session.username;

    if (req.session == null || !req.session.login) {
        contenido = '/receta/verReceta';
        req.log.debug("El usuario no está logueado, no se puede crear un comentario");
    }
    else {
        const id_receta = req.params.id_receta; // Id de la receta del comentario

        contenido = 'paginas/createComentario'; // URL del formulario
    }

    const receta = Receta.getRecetaById(id, user);

    const comentarios = Comentario.getAllComentarios(id, user);

    let hayComentarios = true;
    if (comentarios.length == 0)
        hayComentarios = false;

    render(req, res, contenido, {
        receta,
        session: req.session,
        hayComentarios,
        comentarios
    });
}*/

// Agregar un nuevo comentario
export function doCreateComentario(req, res) {
    const result = validationResult(req);

    const requestWith = req.get('X-Requested-With');
    const esAjax = requestWith != undefined && ['xmlhttprequest', 'fetch'].includes(requestWith.toLowerCase());
    if (esAjax)
        req.log.debug("Petición AJAX recibida para doCreateComentario()");

    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);

        const { id } = req.body;

        console.log("Body: ", req.body);

        if (esAjax) {
            req.log.debug("Devuelto código 400 a la petición AJAX");
            return res.status(400).json({ status: 400, errores });
        }

        if (id && Receta.exists(id)) {

            console.log("Id: ", id);
            console.log("Devolviendo errores de descripción...");

            const user = req.session.username;
            const receta = Receta.getRecetaById(id, user); // Método para obtener la receta por ID
            const comentarios = Comentario.getAllComentarios(id, user);

            let hayComentarios = true;
            if (comentarios.length == 0)
                hayComentarios = false;


            console.log("Errores", errores);
            return render(req, res, 'paginas/verReceta', {
                receta,
                comentarios,
                hayComentarios,
                errores,
                datos,
            });
        }
        else {
            console.log("Volviendo al index...");
            return render(req, res, 'paginas/index', {
                datos,
                errores,
            });
        }
    }

    const { descripcion, id } = req.body;
    const user = req.session.username;
    if (req.session == null || req.session.login === undefined) {
        req.log.error("El usuario no esta logueado, no se puede crear un comentario");

        if (esAjax) {
            req.log.debug("Devuelto código 401 a la petición AJAX");
            return res.status(401).json({ ok: true });
        }
    }
    else {
        const nuevoComentario = new Comentario(user, id, null, descripcion, null);

        try {
            // Insertar comentario en la base de datos
            Comentario.insertComentario(nuevoComentario);
            if (esAjax) {
                req.log.debug("Devuelto código 200 a la petición AJAX");
                return res.status(200).json({ ok: true });
            }
        }
        catch (e) {
            req.log.error(e);
        }
    }

    // Redirigir al finalizar
    res.redirect(`/receta/verReceta/${id}`);
}

// Eliminar un comentario
export function deleteComentario(req, res) {

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
    const user = req.session.username;

    let comentario = null

    if (id != null && req.session.login) {
        try {
            comentario = Comentario.getComentarioById(id, null);
        }
        catch (e) {
            req.log.error("Error interno al intentar eliminar el comentario '%i': '%s'", id, e.message);
            res.status(500).send();
        }
        if (comentario != null && (user === comentario.user || req.session.rol === "A")) {

            try {
                Comentario.deleteComentario(id); // Elimina el comentario por ID
                req.log.info("Comentario '%i' eliminado con exito", id);
            }
            catch (e) {
                req.log.error("Error interno al intentar eliminar el comentario '%i': '%s'", id, e.message);
                res.status(500).send();
            }
            res.redirect(`/receta/verReceta/${comentario.id_receta}`); // Ahora redirige a la página de la receta  
        }
        else if (receta != null) {
            req.log.error("Error al elminar el comentario '%i', de '%s': acceso no permitido al usuario '%s'", id, comentario.user, user);
            res.status(403);
        }
    }
    else if (!id) {
        req.log.error("Error al elminar un comentario: id inválido");
        res.status(400).send();
    }
    else {
        req.log.error("Error al eliminar el comentario '%i': Usuario no registrado", id);
        res.status(403).send();
    }
}

// Añadir una valoración al comentario (He usado un formato de likes, pero si queremos poner estrellas ponemos estrellas)
export function valorarComentario(req, res) {
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