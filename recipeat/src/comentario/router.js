import express from 'express';

import {createComentario, doCreateComentario, deleteComentario, valorarComentario, viewComentarios} from './controllers.js';


const comentariosRouter = express.Router();

/**
 * No he añadido las URLs y tampoco he puesto un middleware para ver un solo comentario. Si es necesario, lo pongo
 * 
 * Tampoco estoy seguro de que la gestión de los comentarios se tenga que hacer en un router aparte. A menos que tengamos como un apartado en la receta
 * en el que ponga algo como "Ver Comentarios" y al darle se muestre una lista de comentarios como pasa con la lista de recetas. He hecho toda esta 
 * gestión de comentarios teniendo en mente hacerlo así (aunque sin poner las URLs)
 */

//Ruta para ver la lista de comentarios
recetasRouter.get('', viewComentarios);

// Ruta para crear un comentario (vista)
recetasRouter.get('', createComentario);

// Ruta para agregar una receta
recetasRouter.post('', doCreateComentario);

// Ruta para eliminar una receta
recetasRouter.post('', deleteComentario);

// Ruta para cuando se da like a una receta
recetasRouter.post('', valorarComentario);

export default recetasRouter;
