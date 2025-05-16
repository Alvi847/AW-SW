import express from 'express';
import { body } from 'express-validator';
import { autenticado, tieneRol } from '../middleware/auth.js';

import {addIngrediente, deleteIngrediente, doCreateIngrediente, updateIngrediente} from './controllers.js';
import asyncHandler from 'express-async-handler';


/**
 * Router de controllers para los ingredientes
 */
const ingredientesRouter = express.Router();

// Ruta para agregar un ingrediente
ingredientesRouter.post('/createIngrediente'
    , autenticado('/') // TODO: CAMBIAR URL
    , tieneRol()
    , body('nombre', 'No puede ser vacío').notEmpty()
    , body('nombre', 'Sólo puede contener letras').trim().matches(/^[\p{L}\s]*$/u)
    , body('unidad', 'No puede ser vacío').notEmpty()
    , body('precio', 'No puede ser vacío').notEmpty()
    , body('precio', 'Debe ser un número').isNumeric()
    , asyncHandler(doCreateIngrediente));

// Ruta para eliminar un ingrediente
ingredientesRouter.post('/removeIngrediente'
    , autenticado('/') // TODO: CAMBIAR URL
    , tieneRol()
    , body('id', 'Id inválido').notEmpty().isNumeric()
    , asyncHandler(deleteIngrediente));

// Ruta para cambiar los datos de un ingrediente
ingredientesRouter.post('/updateIngrediente'
    , autenticado('/') // TODO: CAMBIAR URL
    , tieneRol()
    , body('id', 'Id inválido').notEmpty().isNumeric()
    , body('nombre', 'No puede ser vacío').notEmpty()
    , body('nombre', 'Sólo puede contener letras').trim().matches(/^[\p{L}\s]*$/u)
    , body('unidad', 'No puede ser vacío').notEmpty()
    , body('precio', 'No puede ser vacío').notEmpty()
    , body('precio', 'Debe ser un número').isNumeric()
    , asyncHandler(updateIngrediente));

// Ruta para añadir un ingrediente a una receta
ingredientesRouter.post('/addIngredienteToReceta'
    , autenticado('/') // TODO: CAMBIAR URL
    , body('nombre', 'No puede ser vacío').notEmpty()
    , body('nombre', 'Sólo puede contener letras').trim().matches(/^[\p{L}\s]*$/u)
    , body('id_receta', 'No puede ser vacío').notEmpty()
    , body('cantidad', 'No puede ser vacío').notEmpty()
    , body('cantidad', 'Debe ser un número').isNumeric()
    , asyncHandler(addIngrediente));

export default ingredientesRouter;
