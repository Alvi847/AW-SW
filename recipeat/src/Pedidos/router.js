import express from 'express';
import { body } from 'express-validator';
import { autenticado } from '../middleware/auth.js';

import { doCreatePedido, deletePedido, addIngredientes, mostrarPagarPedido, doPagarPedido, viewPedido, updatePedido, removeIngrediente } from './controllers.js';
import asyncHandler from 'express-async-handler';


/**
 * Router de controllers para los pedidos
 */
const pedidosRouter = express.Router();

// Ruta para crear un pedido
pedidosRouter.post('/createPedido'
    , autenticado('/usuarios/login')
    , body('username', 'No puede ser vacío').notEmpty()
    , body('username', 'Sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i)
    , asyncHandler(doCreatePedido));

// Ruta para eliminar un pedido
pedidosRouter.post('/removePedido'
    , autenticado('/usuarios/login')
    , body('username', 'No puede ser vacío').notEmpty()
    , body('username', 'Sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i)
    , asyncHandler(deletePedido));

// Ruta para cambiar las cantidades de los ingredientes de un pedido
pedidosRouter.post('/updatePedido'
    , autenticado('/usuarios/login')
    , body('id', 'Id inválido').notEmpty().isNumeric()
    , body('cantidad', 'No puede ser vacío').notEmpty()
    , body('cantidad', 'Debe ser un número mayor que 0').isNumeric().isFloat({min: 0.01})
    , asyncHandler(updatePedido));


// Ruta para eliminar un ingrediente de un pedido
pedidosRouter.post('/removeIngrediente'
    , autenticado('/usuarios/login')
    , body('id', 'Id inválido').notEmpty().isNumeric()
    , asyncHandler(removeIngrediente));

// Ruta para añadir un ingrediente a un pedido
pedidosRouter.post('/addIngredientesToPedido'
    , autenticado('/usuarios/login')
    , body('username', 'No puede ser vacío').notEmpty()
    , body('username', 'Sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i)
    ,[  // Misma validación que la URL /receta/createReceta
        body('ingredientes_id', 'Añade ingredientes').isArray({min: 1})
            .custom((value, { req }) => {
                    // Aquí comprobamos si los arrays de ids y cantidades tienen la misma longitud, para saber si cada ingrediente tiene su correpondiente cantidad
                    if (value.length !== req.body.ingredientes_cantidad.length) {
                        throw new Error('Cada ingrediente debe tener asociada una cantidad');
                    }
                    return true;
                
            })
            .custom((value, { req }) => {
                if (Array.isArray(value) && Array.isArray(req.body.ingredientes_cantidad)) {
                    // Aquí nos aseguramos de que no se ha seleccionado un ingrediente varias veces
                    // Usamos un Set auxiliar (almacena valores y no permite que estos se repitan) para encontrar ingredientes duplicados en tiempo lineal con respecto al número de ingredientes
                    const set = new Set();
                    for (let i = 0; i < value.length; i++) {
                        if (set.has(value[i])) {
                            throw new Error('Añade cada ingrediente sólo 1 vez');  // Se ha encontrado un duplicado
                        }
                        set.add(value[i]);
                    }
                    return true;  // No hay duplicados
                }
                return Number.isFinite(Number(value)); // Si no son arrays, entonces miramos si son enteros
            }),
        body('ingredientes_id.*')
            .isNumeric().withMessage('Cada ingrediente debe ser un número')
    ]
    , [
        body('ingredientes_cantidad', 'Añade cantidades correctas a cada ingrediente').isArray({ min: 1 }),
        body('ingredientes_cantidad.*')
            .isFloat({min: 0.01}).withMessage('Cada cantidad debe ser un número mayor que 0')
    ]
    , asyncHandler(addIngredientes));

// Ruta para mostrar un formulario para pagar un pedido
pedidosRouter.get('/pay'
    , autenticado('/usuarios/login')
    , asyncHandler(mostrarPagarPedido));

// Ruta para pagar un pedido
// Me he inventado que el usuario tiene que poner "pagar" para pagar
pedidosRouter.post('/pay'
    , autenticado('/usuarios/login')
    , body('pagar', 'Tienes que escribir "pagar"').custom((value) => {return value === "pagar"})
    , asyncHandler(doPagarPedido));

pedidosRouter.get('/verPedido'
    , autenticado('/usuarios/login')
    , asyncHandler(viewPedido)
);

export default pedidosRouter;
