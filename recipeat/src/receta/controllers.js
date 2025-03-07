import { Receta } from './Receta.js';
import { body } from 'express-validator';

// Ver las recetas (página de inicio de recetas)
export function viewRecetas(req, res) {
    let contenido = 'paginas/listaRecetas'; 
    
    const recetas= Receta.getAllRecetas();
    res.render('pagina', {
        contenido,
        session: req.session,
        recetas
    });
}

// Ver una receta
export function viewReceta(req, res) {
    const id = req.params.id; // Ahora toma el id correctamente desde la URL
    const receta = Receta.getRecetaById(id); // Método para obtener la receta por ID
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
    const { nombre, descripcion} = req.body;
    const nuevaReceta = new Receta(nombre, descripcion, null, null, req.session.username);

    console.log("Datos recibidos: ", nuevaReceta);
    // Insertar la receta en la base de datos
    try {
        let receta = Receta.insertReceta(nuevaReceta);

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

/*// Actualizar una receta (mostrar el formulario para editar)
export function updateReceta(req, res) {
    const id = req.params.id;
    const receta = Receta.getRecetaById(id);  // Método para obtener una receta por ID
    res.render('pagina', {
        contenido: 'paginas/updateReceta', // Vista para editar la receta
        receta,
        session: req.session
    });
}*/

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
    const { nombre, descripcion, likes } = req.body;

    const recetaExistente = new Receta(nombre, descripcion, likes, id);
    Receta.updateReceta(recetaExistente);

    res.redirect('/receta/listaRecetas');
}

// Eliminar una receta
export function deleteReceta(req, res) {
    const id = req.params.id;
    Receta.deleteReceta(id); // Elimina la receta por ID

    res.redirect('/receta/listaRecetas'); // Redirige a la página de recetas

}

/*export function likeReceta(req, res) {
    const id = parseInt(req.params.id, 10); //* Convertir a número

    Receta.addLikeReceta(id); // Añadir like
    res.redirect(`/receta/verReceta/${id}`); //* Redirigir a la misma receta

}*/

export function likeReceta(req, res) {
    const id = req.params.id;
    Receta.addLikeReceta(id);

    res.redirect('/receta/listaRecetas');
}