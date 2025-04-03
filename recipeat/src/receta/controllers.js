import { Receta } from './Receta.js';
import { Comentario } from '../comentario/Comentario.js';
import { body } from 'express-validator';

// Ver las recetas (página de inicio de recetas)
export function viewRecetas(req, res) {
    let contenido = 'paginas/listaRecetas';

    const recetas = Receta.getAllRecetas();
    res.render('pagina', {
        contenido,
        session: req.session,
        recetas
    });
}

// Ver una receta
export function viewReceta(req, res) {
    const id = req.params.id; // Ahora toma el id correctamente desde la URL
    const user = req.session.username // El usuario que quiere ver la receta (usado para ver si le ha dado like o no)
    const receta = Receta.getRecetaById(id, user); // Método para obtener la receta por ID
    const comentarios = Comentario.getAllComentarios(id, user);
    let hayComentarios = true;
    if (comentarios.length == 0)
        hayComentarios = false;

    res.render('pagina', {
        contenido: 'paginas/verReceta',
        receta,
        session: req.session,
        comentarios,
        hayComentarios
    });
}

// Crear una receta (mostrar el formulario de creación)
export function createReceta(req, res) {

    let contenido = 'paginas/createReceta';
    if (req.session == null || !req.session.login) {
        contenido = 'paginas/home';
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
}

// Agregar una nueva receta (procesar el formulario)
export function doCreateReceta(req, res) {
    const { nombre, descripcion, modo_preparacion } = req.body;
    const foto = req.file;

    const nuevaReceta = new Receta(nombre, descripcion, modo_preparacion, null, null, req.session.username, false, foto.filename);

    // Insertar la receta en la base de datos
    try {
        Receta.insertReceta(nuevaReceta);

        // Redirigir o devolver un mensaje de éxito
        res.redirect('/receta/listaRecetas');
    }
    catch (e) {
        req.log.error("No se ha podido crear la receta: '%s'", e.message);
        let contenido = 'paginas/createReceta';
        res.render('pagina', {
            contenido,
            session: req.session,
            error: 'No se ha podido crear la receta'
        });
    }
}

// Mostrar el formulario de actualización con los datos actuales
export function viewUpdateReceta(req, res) {
    const id = req.params.id;
    const receta = Receta.getRecetaById(id); // Obtener la receta por ID

    res.render('pagina', {
        contenido: 'paginas/updateReceta', // Renderiza la vista
        receta,
        session: req.session
    });
}

// Procesar la actualización de la receta
export function updateReceta(req, res) {
    const id = req.params.id;
    const { nombre, descripcion, modo_preparacion, likes } = req.body;

    const likesFinal = likes ? likes : 0;

    const recetaExistente = new Receta(nombre, descripcion, modo_preparacion, likesFinal, id);
    Receta.updateReceta(recetaExistente);

    res.redirect('/receta/listaRecetas');
}

// Eliminar una receta
export function deleteReceta(req, res) {
    const { id } = req.body;
    const user = req.session.username;
    let receta = null;

    if (id != null && req.session.login) {
        try {
            receta = Receta.getRecetaById(id, null);
        }
        catch (e) {
            req.log.error("Error interno al intentar eliminar el comentario '%i': '%s'", id, e.message);
            res.status(500).send();
        }
        if (receta != null && (user === receta.user || req.session.rol === "A")) {
            try {
                Receta.deleteReceta(id);
                req.log.info("Receta '%i' eliminada con exito", id);
            } // Elimina la receta por ID
            catch (e) {
                req.log.error("Error interno al intentar eliminar la receta '%i': '%s'", id, e.message);
                res.status(500).send();
            }
            res.redirect('/receta/listaRecetas'); // Redirige a la lista de recetas
        }
        else if(receta != null) {
            res.status(403).send();
            req.log.debug("Para borrar la receta, el usuario '%s' tiene que ser '%s' o administrador", user, receta.user);
        }
    }
    else {
        res.status(400).send();
        req.log.debug("Usuario no logueado o receta no encontrada");
    }
}

export function likeReceta(req, res) {
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
            res.status(500).send();
            req.log.error("No se ha podido añadir el like de '%s' a la receta '%i'", user, id);
        }
    }
    else if (!id) {
        res.status(400).send();
        req.log.error("Receta '%i' no existe", id);
    }
    else {
        res.status(403).send();
        req.log.error("Usuario no logueado");
    }
}

