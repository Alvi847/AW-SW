import express from 'express';

import {viewReceta, viewRecetas, createReceta, doCreateReceta, viewUpdateReceta, updateReceta, deleteReceta, likeReceta } from './controllers.js';
import multer from 'multer';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'url'; 

const __dirname = dirname(fileURLToPath(import.meta.url));
const multerFactory = multer({ dest: join(__dirname, "uploads") });

const recetasRouter = express.Router();

//Ruta para ver la lista de recetas
recetasRouter.get('/listaRecetas', viewRecetas);

//Ruta para ver una receta
recetasRouter.get('/verReceta/:id', viewReceta);

// Ruta para crear una receta (vista)
recetasRouter.get('/createReceta', createReceta);

// Ruta para agregar una receta
recetasRouter.post('/createReceta', multerFactory.single("foto") , doCreateReceta);

// Ruta para actualizar una receta (vista)
recetasRouter.get('/updateReceta/:id', viewUpdateReceta);

// Ruta para procesar la actualización de una receta
recetasRouter.post('/updateReceta/:id', updateReceta);

// Ruta para eliminar una receta
recetasRouter.post('/removeReceta', deleteReceta);

// Ruta para cuando se da like a una receta
recetasRouter.post('/like', likeReceta);

export default recetasRouter;
