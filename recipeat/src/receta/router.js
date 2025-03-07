import express from 'express';
import {viewReceta, viewRecetas, createReceta, doCreateReceta, viewUpdateReceta, updateReceta, deleteReceta, likeReceta } from './controllers.js';

const recetasRouter = express.Router();

//Ruta para ver la lista de recetas
recetasRouter.get('/listaRecetas', viewRecetas);

//Ruta para ver una receta
recetasRouter.get('/verReceta/:id', viewReceta);

// Ruta para crear una receta (vista)
recetasRouter.get('/createReceta', createReceta);

// Ruta para agregar una receta
//recetasRouter.post('/anadirReceta', doCreateReceta);
recetasRouter.post('/createReceta', doCreateReceta);
// Ruta para actualizar una receta (vista)
recetasRouter.get('/updateReceta/:id', viewUpdateReceta);

// Ruta para procesar la actualización de una receta
recetasRouter.post('/updateReceta/:id', updateReceta);

// Ruta para eliminar una receta
recetasRouter.get('/removeReceta/:id', deleteReceta);

// Ruta para cuando se da like a una receta
recetasRouter.get('/like/:id', likeReceta);

export default recetasRouter;
