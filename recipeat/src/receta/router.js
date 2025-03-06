import express from 'express';
import { createReceta, updateReceta, deleteReceta } from './controllers.js';

const recetasRouter = express.Router();

// Ruta para crear una receta (vista)
recetasRouter.get('/añadirReceta', createReceta);

// Ruta para agregar una receta
recetasRouter.post('/añadirReceta', doCreateReceta);

// Ruta para actualizar una receta (vista)
recetasRouter.get('/update/:id', updateReceta);

// Ruta para procesar la actualización de una receta
recetasRouter.post('/update/:id', updateReceta);

// Ruta para eliminar una receta
recetasRouter.get('/delete/:id', deleteReceta);

export default recetasRouter;
