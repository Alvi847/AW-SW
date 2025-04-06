import { Receta } from './Receta.js';
import { Comentario } from '../comentario/Comentario.js';
import { validationResult, matchedData } from 'express-validator';
import { render } from '../utils/render.js';
import { error } from '../utils/helpers.js';

/**
 * Para que los formularios funcionen usando multer y express-validator, he de parsear los datos con multer antes de pasarlos por el validator
 * (https://stackoverflow.com/questions/63632356/multer-and-express-validator-creating-problem-in-validation)
 * 
 * Si el usuario envía el formulario con una foto, pero algún otro campo inválido (que no pase el filtro), multer subirá la foto al servidor igualmente,
 * aunque no se cree la receta. Así que esta es la forma que tengo de solucionar esto. Si el formulario no es válido, borro la foto en caso de haber alguna
 * 
 */
import * as fs from 'node:fs';

// Ver las recetas (página de inicio de recetas)
export function viewRecetas(req, res) {
    let contenido = 'paginas/listaRecetas';

    const recetas = Receta.getAllRecetas();
    render(req, res, contenido, {
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

    return render(req, res, 'paginas/verReceta', {
        receta,
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
    return render(req, res, contenido, {
        errores: {}
    });
}

// Agregar una nueva receta (procesar el formulario)
export function doCreateReceta(req, res) {

    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        if(req.file)
            fs.unlinkSync(req.file.path); // (Ver comentario del import) Se puede usar fs.unlink() con promises: https://midu.dev/como-eliminar-un-ficher-con-node-js/
        const datos = matchedData(req);
        return render(req, res, 'paginas/createReceta', {
            datos,
            errores
        });
    }

    const { nombre, descripcion, modo_preparacion } = req.body;
    const imagen = req.file;

    const nuevaReceta = new Receta(nombre, descripcion, modo_preparacion, null, null, req.session.username, false, imagen.filename);

    // Insertar la receta en la base de datos
    try {
        Receta.insertReceta(nuevaReceta);

        // Redirigir o devolver un mensaje de éxito
        res.redirect('/receta/listaRecetas');
    }
    catch (e) {
        req.log.error("No se ha podido crear la receta: '%s'", e.message);
        let contenido = 'paginas/createReceta';
        render(req, res, contenido, {
            errores: {}
        });
    }
}

// Mostrar el formulario de actualización con los datos actuales
export function viewUpdateReceta(req, res) {
    const id = req.params.id;
    const receta = Receta.getRecetaById(id); // Obtener la receta por ID

    return render(req, res, 'paginas/updateReceta', {
        receta,
        errores: {},
        datos: {}
    });
}

// Procesar la actualización de la receta
export function updateReceta(req, res) {
    
    const id = req.params.id;
    const recetaExistente = Receta.getRecetaById(id);

    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        if(req.file)
            fs.unlinkSync(req.file.path); // En la actualización también borramos la foto si el usuario ha subido alguna
        return render(req, res, `paginas/updateReceta`, {
            datos,
            errores,
            receta: recetaExistente
        });
    }

    const { nombre, descripcion, modo_preparacion } = req.body;
    const imagen = req.file;
    const user = req.session.username;

    if (recetaExistente.user === user) {
        recetaExistente.nombre = nombre;
        recetaExistente.descripcion = descripcion;
        recetaExistente.modo_preparacion = modo_preparacion;
        recetaExistente.imagen = imagen.filename;

        console.log("Datos recibidos: ", req.body);
        console.log("Nueva receta: ", recetaExistente);

        Receta.updateReceta(recetaExistente);
        req.log.info("Receta '%i', editada con éxito por '%s'", id, user);
    }
    else
        req.log.error("La receta '%i',no puede ser editada por '%s'", id, user);
    res.redirect(`/receta/verReceta/${id}`);
}

// Eliminar una receta
export function deleteReceta(req, res) {

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
    let receta = null;

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
        else if (receta != null) {
            res.status(403).send();
            req.log.debug("Para borrar la receta, el usuario '%s' tiene que ser '%s' o administrador", user, receta.user);
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

