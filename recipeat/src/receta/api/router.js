/**
 * API de recetas
 * 
 * Aquí van los controladores de URLs que no van a mostrar una página (como puede ser ver si una receta existe o no)
 * 
 * Servirán para comunicarnos con clientes mediante peticiones AJAX
 */

import express from 'express';
import { body, param } from 'express-validator';
import { checkReceta, buscarRecetas } from './controllers.js';
import asyncHandler from 'express-async-handler';

const recetasApiRouter = express.Router();

recetasApiRouter.post('/existe'
    , body('id', 'Falta el id')
    , asyncHandler(checkReceta));

recetasApiRouter.get('/buscar'
    , param('q', 'query inválida').trim().notEmpty().matches(/^[\p{L}\s]*$/u).isLength({ min: 1, max: 50 })
    , param('filtro', 'filtro inválido').trim().notEmpty().custom((value) =>{return value === "nombre" || value === "ingrediente"})
    , asyncHandler(buscarRecetas));
    
export default recetasApiRouter;