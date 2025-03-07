import express from 'express';
import {viewReceta, viewRecetas, createReceta, doCreateReceta, updateReceta, deleteReceta } from './controllers.js';

const recetasRouter = express.Router();

//Ruta para ver la lista de recetas
recetasRouter.get('/listaRecetas', viewRecetas);

//Ruta para ver una receta
recetasRouter.get('/verReceta', viewReceta);

// Ruta para crear una receta (vista)
recetasRouter.get('/createReceta', createReceta);

// Ruta para agregar una receta
//recetasRouter.post('/anadirReceta', doCreateReceta);
recetasRouter.post('/createReceta', doCreateReceta);
// Ruta para actualizar una receta (vista)
recetasRouter.get('/updateReceta', updateReceta);

// Ruta para procesar la actualización de una receta
recetasRouter.post('/updateReceta', updateReceta);

// Ruta para eliminar una receta
recetasRouter.get('/removeReceta', deleteReceta);

export default recetasRouter;
