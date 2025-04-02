import { Context } from 'express-validator/lib/context.js';
import { Comentario, Valoracion } from './Comentario.js';
import { body } from 'express-validator';

// Ver los comentarios
export function viewComentarios(req, res) {
    const id_receta = req.params.id; // Id de la receta del comentario
    const user = req.session.username;

    let contenido = `pagina/`; // TODO: Poner URL correcta
    
    req.log.debug("Cargando todos los comentarios de la receta '%i'", id_receta);
    
    const comentarios = Comentario.getAllComentarios(id_receta, user);
    /*res.render('pagina', {
        contenido,
        session: req.session,
    });*/

    res.send(comentarios);
}

// Crear un comentario (mostrar el formulario de creación)
export function createComentario(req, res) {
    let contenido;

    if (req.session == null || !req.session.login) {
        contenido = 'paginas/verReceta/${comentario.id_receta}';
    }
    else {
        const id_receta = req.params.id_receta; // Id de la receta del comentario

        contenido = 'paginas/createComentario/${comentario.id_receta}'; // URL del formulario
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
}

// Agregar un nuevo comentario (procesar el formulario)
export function doCreateComentario(req, res) {
    const { descripcion, receta, user } = req.body;
    const nuevoComentario = new Comentario(user, id_receta, null, descripcion, null);

    console.log("Datos recibidos: ", nuevoComentario);

    // Insertar comentario en la base de datos

    try {
        let receta = Comentario.insertComentario(nuevaReceta);

        // Redirigir o devolver un mensaje de éxito
        res.redirect('/receta/listaRecetas');
    }
    catch (e) {
        console.log(e);
        let contenido = 'paginas/createComentario';
        res.render('pagina', {
            contenido,
            session: req.session,
            error: 'No se ha podido crear la receta'
        });
    }
}

// Eliminar un comentario
export function deleteComentario(req, res) {
    const { id } = req.body;
    const user = req.session.username;

    if (id && user != null) {
        const comentario = Comentario.getComentarioById(id, null);
        if (user === comentario.user) {

            Comentario.deleteComentario(id); // Elimina la receta por ID
            res.res.redirect(`/receta/verReceta/${comentario.id_receta}`); // TODO: Debería ser aquí?? Ahora redirige a la página de la receta  
        }
        else
            res.status(403)
    }
    else
        res.status(400);
}

// Añadir una valoración al comentario (He usado un formato de likes, pero si queremos poner estrellas ponemos estrellas)
export function valorarComentario(req, res) {
    const { id } = req.body;
    const user = req.session.username

    if (id && user != null) {
        const id_num = parseInt(id, 10); // 🔹 Convertir a número

        try {
            const comentario = Comentario.getComentarioById(id_num, user);
            Comentario.processLike(id_num, user);
            res.redirect(`/receta/verReceta/${comentario.id_receta}`);
        }
        catch (e) {
            res.status(500).send();
        }
    }
    else if (!id)
        res.status(400).send();
    else
        res.status(403).send();

}