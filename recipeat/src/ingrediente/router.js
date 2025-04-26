import express from 'express';
import { body } from 'express-validator';
import { autenticado } from '../middleware/auth.js';

import {deleteIngrediente, doCreateIngrediente} from './controllers.js';


/**
 * Router de controllers para los ingredientes
 */
const ingredientesRouter = express.Router();

// Ruta para agregar un comentario
ingredientesRouter.post('/createIngrediente'
    , body('nombre', 'No puede ser vacío').notEmpty()
    , body('unidad', 'No puede ser vacío').notEmpty()
    , autenticado('/receta/listaRecetas') // TODO: CAMBIAR URL
    , doCreateIngrediente);

// Ruta para eliminar un comentario
ingredientesRouter.post('/removeIngrediente'
    , body('nombre', 'No puede ser vacío').notEmpty()
    , autenticado('/receta/listaRecetas') // TODO: CAMBIAR URL
    , deleteIngrediente);

export default ingredientesRouter;
