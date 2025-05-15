import express from 'express';
import { body } from 'express-validator';
import { autenticado } from '../middleware/auth.js';

import {addIngrediente, deleteIngrediente, doCreateIngrediente} from './controllers.js';
import asyncHandler from 'express-async-handler';


/**
 * Router de controllers para los ingredientes
 */
const ingredientesRouter = express.Router();

// Ruta para agregar un ingrediente
ingredientesRouter.post('/createIngrediente'
    , autenticado('/') // TODO: CAMBIAR URL
    , body('nombre', 'No puede ser vacío').notEmpty()
    , body('nombre', 'Sólo puede contener letras').trim().matches(/^[A-Z]*$/i)
    , body('unidad', 'No puede ser vacío').notEmpty()
    , body('precio', 'No puede ser vacío').notEmpty()
    , body('precio', 'Debe ser un número').isNumeric()
    , asyncHandler(doCreateIngrediente));

// Ruta para eliminar un ingrediente
ingredientesRouter.post('/removeIngrediente'
    , autenticado('/') // TODO: CAMBIAR URL
    , body('id', 'No puede ser vacío').notEmpty()
    , asyncHandler(deleteIngrediente));

// Ruta para añadir un ingrediente a una receta
ingredientesRouter.post('/addIngredienteToReceta'
    , autenticado('/') // TODO: CAMBIAR URL
    , body('nombre', 'No puede ser vacío').notEmpty()
    , body('nombre', 'Sólo puede contener letras').trim().matches(/^[A-Z]*$/i)
    , body('id_receta', 'No puede ser vacío').notEmpty()
    , body('cantidad', 'No puede ser vacío').notEmpty()
    , body('cantidad', 'Debe ser un número').isNumeric()
    , asyncHandler(addIngrediente));

export default ingredientesRouter;
