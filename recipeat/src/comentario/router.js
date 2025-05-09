import express from 'express';
import { body } from 'express-validator';
import { autenticado } from '../middleware/auth.js';

import {deleteComentario, valorarComentario, doCreateComentario} from './controllers.js';


/**
 * Router de controllers para los comentarios
 */
const comentariosRouter = express.Router();


// La ruta para ver la lista de comentarios NO SE USA
//comentariosRouter.get('/listaComentarios/:id', viewComentarios);

// Ruta para agregar un comentario
comentariosRouter.post('/createComentario'
    , body('id', 'Id inválido').notEmpty()
    , body('descripcion', 'No puede ser vacío').notEmpty()
    , body('descripcion', 'Máximo 1500 caracteres').isLength({min: 0, max: 1500})
    , autenticado('/receta/listaRecetas')
    , doCreateComentario);

// Ruta para eliminar un comentario
comentariosRouter.post('/removeComentario'
    , body('id', 'Id inválido').notEmpty()
    , autenticado('/receta/listaRecetas')
    , deleteComentario);

// Ruta para cuando se da like a un comentario
comentariosRouter.post('/like', valorarComentario);

export default comentariosRouter;
