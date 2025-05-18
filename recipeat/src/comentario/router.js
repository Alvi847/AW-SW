import express from 'express';
import { body } from 'express-validator';
import { autenticado } from '../middleware/auth.js';
import asyncHandler from 'express-async-handler';
import {deleteComentario, valorarComentario, doCreateComentario} from './controllers.js';


/**
 * Router de controllers para los comentarios
 */
const comentariosRouter = express.Router();

// Ruta para agregar un comentario
comentariosRouter.post('/createComentario'
    , body('id', 'Id inválido').notEmpty().isNumeric()
    , body('descripcion', 'No puede ser vacío').notEmpty()
    , body('descripcion', 'Máximo 1500 caracteres').isLength({min: 0, max: 1500})
    , autenticado('/receta/listaRecetas')
    , asyncHandler(doCreateComentario));

// Ruta para eliminar un comentario
comentariosRouter.post('/removeComentario'
    , body('id', 'Id inválido').notEmpty().isNumeric()
    , autenticado('/receta/listaRecetas')
    , asyncHandler(deleteComentario));

// Ruta para cuando se da like a un comentario
comentariosRouter.post('/like'
    , body('id', 'No puede ser vacío').notEmpty().isNumeric()
    , asyncHandler(valorarComentario));

export default comentariosRouter;
