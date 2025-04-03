import express from 'express';

import {deleteComentario, valorarComentario, doCreateComentario} from './controllers.js';


const comentariosRouter = express.Router();

/**
 * Router de controllers para los comentarios
 */

//Ruta para ver la lista de comentarios NO SE USA
//comentariosRouter.get('/listaComentarios/:id', viewComentarios);

// Ruta para agregar un comentario NO SE USA
comentariosRouter.post('/createComentario', doCreateComentario);

// Ruta para eliminar un comentario
comentariosRouter.post('/removeComentario', deleteComentario);

// Ruta para cuando se da like a un comentario
comentariosRouter.post('/like', valorarComentario);

export default comentariosRouter;
