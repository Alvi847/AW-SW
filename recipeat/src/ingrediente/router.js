import express from 'express';
import { body } from 'express-validator';
import { autenticado, tieneRol } from '../middleware/auth.js';

import {addIngrediente, deleteIngrediente, doCreateIngrediente, updateIngrediente} from './controllers.js';
import asyncHandler from 'express-async-handler';


/**
 * Router de controllers para los ingredientes
 */
const ingredientesRouter = express.Router();

// Ruta para crear un ingrediente
ingredientesRouter.post('/createIngrediente'
    , autenticado('/usuarios/login')
    , body('nombre', 'No puede ser vacío').notEmpty()
    , body('nombre', 'Sólo puede contener letras').trim().matches(/^[\p{L}\s]*$/u)
    , body('nombre', 'Máximo 50 caracteres').isLength({min:1, max:50})
    , body('unidad', 'No puede ser vacía').notEmpty()
    , body('unidad', 'La unidad contiene caracteres no permitidos').trim().matches(/^[\p{L}/]*$/u)
    , body('unidad', 'Máximo 15 caracteres').isLength({min:1, max:15}) // Por si se quiere poner la palabra entera, en vez de una abreviación
    , body('precio', 'No puede ser vacío').notEmpty()
    , body('precio', 'Debe ser un número').isNumeric()
    , tieneRol()
    , asyncHandler(doCreateIngrediente));

// Ruta para eliminar un ingrediente
ingredientesRouter.post('/removeIngrediente'
    , autenticado('/usuarios/login')
    , tieneRol()
    , body('id', 'Id inválido').notEmpty().isNumeric()
    , asyncHandler(deleteIngrediente));

// Ruta para cambiar los datos de un ingrediente
ingredientesRouter.post('/updateIngrediente'
    , autenticado('/usuarios/login')
    , tieneRol()
    , body('id', 'Id inválido').notEmpty().isNumeric()
    , body('nombre', 'No puede ser vacío').notEmpty()
    , body('nombre', 'Sólo puede contener letras').trim().matches(/^[\p{L}\s]*$/u)
    , body('nombre', 'Máximo 50 caracteres').isLength({min:1, max:50})
    , body('unidad', 'No puede ser vacío').notEmpty()
    , body('unidad', 'La unidad contiene caracteres no permitidos').trim().matches(/^[\p{L}/]*$/u)
    , body('unidad', 'Máximo 15 caracteres').isLength({min:1, max:15})
    , body('precio', 'No puede ser vacío').notEmpty()
    , body('precio', 'Debe ser un número').isNumeric()
    , asyncHandler(updateIngrediente));

// Ruta para añadir un ingrediente a una receta
ingredientesRouter.post('/addIngredienteToReceta'
    , autenticado('/usuarios/login')
    , body('nombre', 'No puede ser vacío').notEmpty()
    , body('nombre', 'Sólo puede contener letras').trim().matches(/^[\p{L}\s]*$/u)
    , body('nombre', 'Máximo 50 caracteres').isLength({min:1, max:50})
    , body('id_receta', 'No puede ser vacío').notEmpty()
    , body('cantidad', 'No puede ser vacío').notEmpty()
    , body('cantidad', 'Debe ser un número').isFloat({min: 0.01})
    , asyncHandler(addIngrediente));

export default ingredientesRouter;
