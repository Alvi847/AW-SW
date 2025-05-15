import express from 'express';
import { body } from 'express-validator';
import { autenticado } from '../middleware/auth.js';

import {doCreatePedido, deletePedido, addIngrediente} from './controllers.js';
import asyncHandler from 'express-async-handler';


/**
 * Router de controllers para los pedidos
 */
const pedidosRouter = express.Router();

// Ruta para agregar un ingrediente
pedidosRouter.post('/createPedido'
    , autenticado('/') // TODO: CAMBIAR URL
    , body('username', 'No puede ser vacío').notEmpty()
    , body('username', 'Sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i)
    , asyncHandler(doCreatePedido));

// Ruta para eliminar un ingrediente
pedidosRouter.post('/removePedido'
    , autenticado('/') // TODO: CAMBIAR URL
    , body('username', 'No puede ser vacío').notEmpty()
    , body('username', 'Sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i)
    , asyncHandler(deletePedido));

// Ruta para añadir un ingrediente a un pedido
pedidosRouter.post('/addIngredienteToPedido'
    , autenticado('/') // TODO: CAMBIAR URL
    , body('nombre_ingrediente', 'No puede ser vacío').notEmpty()
    , body('nombre_ingrediente', 'Sólo puede contener letras').trim().matches(/^[A-Z]*$/i)
    , body('username', 'No puede ser vacío').notEmpty()
    , body('username', 'Sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i)
    , body('cantidad', 'No puede ser vacío').notEmpty()
    , body('cantidad', 'Debe ser un número').isNumeric()
    , asyncHandler(addIngrediente));

export default pedidosRouter;
