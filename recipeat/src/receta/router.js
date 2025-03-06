import express from 'express';
import { createReceta, doCreateReceta, updateReceta, deleteReceta } from './controllers.js';

const recetasRouter = express.Router();

// Ruta para crear una receta (vista)
recetasRouter.get('/createReceta', createReceta);

// Ruta para agregar una receta
recetasRouter.post('/anadirReceta', doCreateReceta);

// Ruta para actualizar una receta (vista)
recetasRouter.get('/update/:id', updateReceta);

// Ruta para procesar la actualización de una receta
recetasRouter.post('/update/:id', updateReceta);

// Ruta para eliminar una receta
recetasRouter.get('/delete/:id', deleteReceta);

export default recetasRouter;
