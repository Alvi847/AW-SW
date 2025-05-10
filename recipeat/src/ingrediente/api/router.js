/**
 * API de ingredientes
 * 
 * Aquí van los controladores de URLs que no van a mostrar una página
 * 
 * Servirán para comunicarnos con clientes mediante peticiones AJAX
 */

import express from 'express';
import { listaIngredientes } from './controllers.js';
import asyncHandler from 'express-async-handler';

const ingredientesApiRouter = express.Router();

ingredientesApiRouter.post('/lista', asyncHandler(listaIngredientes));
    
export default ingredientesApiRouter;