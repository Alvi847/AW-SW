import express from 'express';
import { body } from 'express-validator';
import { autenticado } from '../middleware/auth.js';

import {deleteIngrediente, doCreateIngrediente} from './controllers.js';


/**
 * Router de controllers para los ingredientes
 */
const ingredientesRouter = express.Router();

// Ruta para agregar un ingrediente
ingredientesRouter.post('/createIngrediente'
    , body('nombre', 'No puede ser vacío').notEmpty()
    , body('unidad', 'No puede ser vacío').notEmpty()
    , autenticado('/receta/listaRecetas') // TODO: CAMBIAR URL
    , doCreateIngrediente);

// Ruta para eliminar un ingrediente
ingredientesRouter.post('/removeIngrediente'
    , body('nombre', 'No puede ser vacío').notEmpty()
    , autenticado('/receta/listaRecetas') // TODO: CAMBIAR URL
    , deleteIngrediente);

// Ruta para añadir un ingrediente a una receta
ingredientesRouter.post('/addIngredienteToReceta'
    , body('nombre', 'No puede ser vacío').notEmpty()
    , body('id_receta', 'No puede ser vacío').notEmpty()
    , body('cantidad', 'No puede ser vacío').notEmpty()
    , autenticado('/receta/listaRecetas') // TODO: CAMBIAR URL
    , addIngrediente);

export default ingredientesRouter;
