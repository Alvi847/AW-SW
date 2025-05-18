import express from 'express';

import { viewReceta, viewRecetas, createReceta, doCreateReceta, viewUpdateReceta, updateReceta, deleteReceta, likeReceta, viewMisRecetas } from './controllers.js';
import multer from 'multer';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'url';
import { body, check, param } from 'express-validator';
import { autenticado } from '../middleware/auth.js';
import asyncHandler from 'express-async-handler';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const UPLOAD_PATH = join(__dirname, "../../uploads");

const multerFactory = multer({ dest: join(UPLOAD_PATH) });

const recetasRouter = express.Router();

const gustos_permitidos = ['dulce', 'salado'];
const niveles_permitidos = ['fácil', 'medio', 'difícil'];
const dietas_permitidas = ['vegana', 'vegetariana', 'sin gluten'];


//Ruta para ver la lista de recetas
recetasRouter.get('/listaRecetas'
    , param('gusto', 'gusto inválido').custom((value) => {return value == null || gustos_permitidos.includes(value)})
    , param('nivel', 'nivel inválido').custom((value) => {return value == null || niveles_permitidos.includes(value)})
    , param('dieta', 'dieta inválida').custom((value) => {return value == null || dietas_permitidas.includes(value)})
    , asyncHandler(viewRecetas));

//ruta para ver favoritos (liked by user)
recetasRouter.get('/favoritos', viewFavoritos);

//Ruta para ver una receta
recetasRouter.get('/verReceta/:id'
    , param('id', "El id debe ser un número entero").isNumeric()
    , asyncHandler(viewReceta));

// Ruta para crear una receta (vista)
recetasRouter.get('/createReceta'
    , autenticado('/usuarios/login')
    , asyncHandler(createReceta));

// Ruta para agregar una receta 
recetasRouter.post('/createReceta'
    , autenticado('/receta/listaRecetas')
    , multerFactory.single("imagen") // IMPORTANTE: En un form con enctype="multipart/form-data" hay que hacer que multer se encarge del cuerpo de la request antes de validarlo
    , body('nombre', 'No puede ser vacío').trim().notEmpty()
    , body('nombre', 'Sólo puede contener letras').trim().matches(/^[\p{L}\s]*$/u) // Cualquier letra de cualquier idioma
    , body('nombre', 'Máximo 50 caracteres').trim().isLength({ min: 1, max: 50 })
    , body('descripcion', 'No puede ser vacío').customSanitizer(value => value).notEmpty()
    , body('descripcion', 'Máximo 200 caracteres').isLength({ max: 200 })
    , [
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
        body('ingredientes_id.*') // Comprobamos que cada ingrediente sea un número válido
            .isInt({min: 1}).withMessage('Cada ingrediente debe ser un número natural')
    ]
    , [
        body('ingredientes_cantidad', 'Añade cantidades correctas a cada ingrediente').isArray({ min: 1 }),
        body('ingredientes_cantidad.*') // Comprobamos que cada cantidad es un número válido
            .isFloat({min: 0.01}).withMessage('Cada cantidad debe ser un número positivo')
    ]
    , body('modo_preparacion', 'No puede ser vacío').customSanitizer(value => value).notEmpty()
    , body('modo_preparacion', 'Máximo 1000 caracteres').isLength({ max: 1000 })
    , body('gusto').optional({ checkFalsy: true }).isIn(['dulce', 'salado', 'picante'])
    , body('nivel').optional({ checkFalsy: true }).isIn(['fácil', 'medio', 'difícil'])
    , body('dieta').optional({ checkFalsy: true }).isIn(['vegana', 'vegetariana', 'sin gluten'])

    , check('imagen').custom((value, { req }) => {
        /**
         * Validador custom para comprobar la subida de la imagen al formulario
         * Crédito: https://stackoverflow.com/questions/39703624/express-how-to-validate-file-input-with-express-validator
         */

        if (req.file) {
            return true;
        } else {
            return false;
        }
    }).withMessage("Proporciona una imagen para la receta")
    , check('imagen').custom((value, { req }) => {
        /**
         * Validador custom para comprobar la subida de una imagen con el tipo MIME correcto
         */
        const tiposPermitidos = ["image/jpeg", "image/png"];

        if (tiposPermitidos.includes(req.file.mimetype)) {
            return true;
        } else {
            return false;
        }
    }).withMessage("Sólo se permiten imágenes jpg o png")
    , asyncHandler(doCreateReceta));

// Ruta para actualizar una receta (vista)
recetasRouter.get('/updateReceta/:id'
    , autenticado('/receta/listaRecetas')
    , param('id', "El id debe ser un número entero").isNumeric()
    , asyncHandler(viewUpdateReceta));

// Ruta para procesar la actualización de una receta
recetasRouter.post('/updateReceta/:id'
    , autenticado('/receta/listaRecetas')
    , multerFactory.single("imagen")
    , param('id', 'id Inválido').notEmpty().isNumeric()
    , body('nombre', 'No puede ser vacío').trim().notEmpty()
    , body('nombre', 'Sólo puede contener letras').trim().matches(/^[\p{L}\s]*$/u)
    , body('nombre', 'Máximo 50 caracteres').trim().isLength({ min: 1, max: 50 })
    , body('descripcion', 'No puede ser vacío').notEmpty()
    , body('descripcion', 'Máximo 200 caracteres').isLength({ min: 1, max: 200 })
    , body('modo_preparacion', 'No puede ser vacío').notEmpty()
    , body('modo_preparacion', 'Máximo 1000 caracteres').isLength({ min: 1, max: 1000 })
    , body('gusto').optional({ checkFalsy: true }).isIn(['dulce', 'salado', 'picante'])
    , body('nivel').optional({ checkFalsy: true }).isIn(['fácil', 'medio', 'difícil'])
    , body('dieta').optional({ checkFalsy: true }).isIn(['vegana', 'vegetariana', 'sin gluten'])
    , check('imagen', "Archivo inválido").custom((value, { req }) => {
        /**
         * Validador custom para comprobar la subida de la imagen al formulario
         * Crédito: https://stackoverflow.com/questions/39703624/express-how-to-validate-file-input-with-express-validator
         */

        if (req.file) {
            return true;
        } else {
            return false;
        }
    }).withMessage("Proporciona una imagen para la receta")
    , check('imagen', "Archivo inválido").custom((value, { req }) => {
        /**
         * Validador custom para comprobar la subida de una imagen con el tipo MIME correcto
         */
        const tiposPermitidos = ["image/jpeg", "image/png"];

        if (tiposPermitidos.includes(req.file.mimetype)) {
            return true;
        } else {
            return false;
        }
    }).withMessage("Sólo se permiten imágenes jpg o png")
    ,[
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
        body('ingredientes_id.*') // Comprobamos que cada ingrediente sea un número válido
            .isInt({min: 1}).withMessage('Cada ingrediente debe ser un número natural')
    ]
    , [
        body('ingredientes_cantidad', 'Añade cantidades correctas a cada ingrediente').isArray({ min: 1 }),
        body('ingredientes_cantidad.*') // Comprobamos que cada cantidad es un número válido
            .isFloat({min: 0.01}).withMessage('Cada cantidad debe ser un número positivo')
    ]
    , asyncHandler(updateReceta));

// Ruta para eliminar una receta
recetasRouter.post('/removeReceta'
    , body('id', 'Id inválido').notEmpty()
    , autenticado('/receta/listaRecetas')
    , asyncHandler(deleteReceta));

// Ruta para cuando se da like a una receta
recetasRouter.post('/like'
    , body('id', 'Debe ser un entero').isNumeric()
    , autenticado('/receta/listaRecetas')
    , asyncHandler(likeReceta));

recetasRouter.get('/misRecetas', autenticado('/usuarios/login'), asyncHandler(viewMisRecetas));

export default recetasRouter;
