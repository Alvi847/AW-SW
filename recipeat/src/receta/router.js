import express from 'express';

import {viewReceta, viewRecetas, createReceta, doCreateReceta, viewUpdateReceta, updateReceta, deleteReceta, likeReceta, viewMisRecetas } from './controllers.js';
import multer from 'multer';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'url'; 
import { body, check } from 'express-validator';
import { autenticado } from '../middleware/auth.js';
import { apiBuscarRecetas } from './controllers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const UPLOAD_PATH = join(__dirname, "../../uploads");

const multerFactory = multer({ dest: join(UPLOAD_PATH) });

const recetasRouter = express.Router();

//Ruta para ver la lista de recetas
recetasRouter.get('/listaRecetas', viewRecetas);

//Ruta para ver una receta
recetasRouter.get('/verReceta/:id', viewReceta);

// Ruta para crear una receta (vista)
recetasRouter.get('/createReceta'
    , autenticado('/usuarios/login')
    , createReceta);

// Ruta para agregar una receta 
recetasRouter.post('/createReceta'
    , autenticado('/receta/listaRecetas')
    , multerFactory.single("imagen") // IMPORTANTE: En un form con enctype="multipart/form-data" hay que hacer que multer se encarge del cuerpo de la request antes de validarlo
    , body('nombre', 'No puede ser vacío').trim().notEmpty()
    , body('nombre', 'Sólo puede contener letras').trim().matches(/^[\p{L}\s]*$/u) // Cualquier letra de cualquier idioma
    , body('nombre', 'Máximo 50 caracteres').trim().isLength({ min: 1, max: 50 })
    , body('descripcion', 'No puede ser vacío').trim().notEmpty()
    , body('descripcion', 'Máximo 200 caracteres').trim().isLength({ min: 1, max: 200 })
    , body('modo_preparacion', 'No puede ser vacío').trim().notEmpty()
    , body('modo_preparacion', 'Máximo 1000 caracteres').trim().isLength({ min: 1, max: 1000 })
    , check('imagen', "Archivo inválido").custom((value, {req}) =>{
        /**
         * Validador custom para comprobar la subida de la imagen al formulario
         * Crédito: https://stackoverflow.com/questions/39703624/express-how-to-validate-file-input-with-express-validator
         */

        console.log("Validando imagen de la receta: ", req.file.path);
        if(req.file){
            return true;
        }else{
            return false;
        }
    }).withMessage("Proporciona una imagen para la receta")
    , check('imagen', "Archivo inválido").custom((value, {req}) =>{
        /**
         * Validador custom para comprobar la subida de una imagen con el tipo MIME correcto
         */
        const tiposPermitidos = ["image/jpeg", "image/png"];

        if(tiposPermitidos.includes(req.file.mimetype)){
            return true;
        }else{
            return false;
        }
    }).withMessage("Sólo se permiten imágenes jpg o png")
    , doCreateReceta);

// Ruta para actualizar una receta (vista)
recetasRouter.get('/updateReceta/:id'
    , autenticado('/receta/listaRecetas')
    , viewUpdateReceta);

// Ruta para procesar la actualización de una receta
recetasRouter.post('/updateReceta/:id'
    , autenticado('/receta/listaRecetas')
    , multerFactory.single("imagen")
    , body('nombre', 'No puede ser vacío').trim().notEmpty()
    , body('nombre', 'Sólo puede contener letras').trim().matches(/^[\p{L}\s]*$/u)
    , body('nombre', 'Máximo 50 caracteres').trim().isLength({ min: 1, max: 50 })
    , body('descripcion', 'No puede ser vacío').notEmpty()
    , body('descripcion', 'Máximo 200 caracteres').isLength({ min: 1, max: 200 })
    , body('modo_preparacion', 'No puede ser vacío').notEmpty()
    , body('modo_preparacion', 'Máximo 1000 caracteres').isLength({ min: 1, max: 1000 })
    , check('imagen', "Archivo inválido").custom((value, {req}) =>{
        /**
         * Validador custom para comprobar la subida de la imagen al formulario
         * Crédito: https://stackoverflow.com/questions/39703624/express-how-to-validate-file-input-with-express-validator
         */

        console.log("Validando imagen de la receta: ", req.file.path);
        if(req.file){
            return true;
        }else{
            return false;
        }
    }).withMessage("Proporciona una imagen para la receta")
    , check('imagen', "Archivo inválido").custom((value, {req}) =>{
        /**
         * Validador custom para comprobar la subida de una imagen con el tipo MIME correcto
         */
        const tiposPermitidos = ["image/jpeg", "image/png"];

        if(tiposPermitidos.includes(req.file.mimetype)){
            return true;
        }else{
            return false;
        }
    }).withMessage("Sólo se permiten imágenes jpg o png")
    , updateReceta);

// Ruta para eliminar una receta
recetasRouter.post('/removeReceta'
    , body('id', 'Id inválido').notEmpty()
    , autenticado('/receta/listaRecetas')
    , deleteReceta);

// Ruta para cuando se da like a una receta
recetasRouter.post('/like'
    , autenticado('/receta/listaRecetas')
    , likeReceta);

recetasRouter.get('/misRecetas', viewMisRecetas);


recetasRouter.get('/api/buscar', apiBuscarRecetas);

export default recetasRouter;
