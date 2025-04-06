import express from 'express';

import {viewReceta, viewRecetas, createReceta, doCreateReceta, viewUpdateReceta, updateReceta, deleteReceta, likeReceta } from './controllers.js';
import multer from 'multer';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'url'; 
import { body } from 'express-validator';
import { autenticado } from '../middleware/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const multerFactory = multer({ dest: join(__dirname, "../../uploads") });

const recetasRouter = express.Router();

//Ruta para ver la lista de recetas
recetasRouter.get('/listaRecetas', viewRecetas);

//Ruta para ver una receta
recetasRouter.get('/verReceta/:id', viewReceta);

// Ruta para crear una receta (vista)
recetasRouter.get('/createReceta'
    , autenticado('/receta/listaRecetas')
    , createReceta);

// Ruta para agregar una receta
recetasRouter.post('/createReceta'
    , autenticado('/receta/listaRecetas')
    , multerFactory.single("imagen") // IMPORTANTE: En un form con enctype="multipart/form-data" hay que hacer que multer se encarge del cuerpo de la request antes de validarlo
    , body('nombre', 'No puede ser vacío').trim().not().isEmpty()
    , body('nombre', 'Sólo puede contener letras').trim().matches(/^[A-Z\s]*$/i)
    , body('descripcion', 'No puede ser vacío').trim().notEmpty()
    , body('modo_preparacion', 'No puede ser vacío').trim().notEmpty()
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
    , body('nombre', 'Sólo puede contener letras').trim().matches(/^[A-Z]*$/i)
    , body('descripcion', 'No puede ser vacío').trim().notEmpty()
    , body('modo_preparacion', 'No puede ser vacío').trim().notEmpty()
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

export default recetasRouter;
