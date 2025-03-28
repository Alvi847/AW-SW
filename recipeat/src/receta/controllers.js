import { Receta } from './Receta.js';
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
    res.render('pagina', {
        contenido: 'paginas/verReceta',
        receta,
        session: req.session
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
    console.log("Foto: ", foto);
    const nuevaReceta = new Receta(nombre, descripcion, modo_preparacion, null, null, req.session.username, false , foto.filename);
    console.log("Datos recibidos: ", nuevaReceta);

    // Insertar la receta en la base de datos
    try {
        Receta.insertReceta(nuevaReceta);

        // Redirigir o devolver un mensaje de éxito
        res.redirect('/receta/listaRecetas');
    }
    catch (e) {
        console.log(e);
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

    if (id && user != null) {
        const receta = Receta.getRecetaById(id, null);
        if (user === receta.user || req.session.esAdmin) {
            try{Receta.deleteReceta(id);} // Elimina la receta por ID
            catch(e){
                res.status(500).send();
            }
            res.redirect('/receta/listaRecetas'); // Redirige a la página de recetas
        }
        else
            res.status(403).send();
    }
    else
        res.status(400).send();
}

export function likeReceta(req, res) {
    const { id } = req.body;
    const user = req.session.username

    if (id && user != null ) {
        const id_num = parseInt(id, 10); // 🔹 Convertir a número

        try{
            const receta = Receta.getRecetaById(id_num, user);
            Receta.processLike(id_num, user);
            res.redirect(`/receta/verReceta/${id_num}`);
        }
        catch(e){
            res.status(500).send();
        }
    }
    else if (!id)
        res.status(400).send();
    else
        res.status(403).send();
}

