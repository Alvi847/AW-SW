/**
 * API de usuarios
 * 
 * Aquí van los controladores de URLs que no van a mostrar una página (como puede ser ver si un username está disponible o no)
 * 
 * Servirán para comunicarnos con clientes mediante peticiones AJAX
 */

import express from 'express';
import { body } from 'express-validator';
import { checkUsername } from './controllers.js';
import asyncHandler from 'express-async-handler';

const usuariosApiRouter = express.Router();

usuariosApiRouter.post('/disponible'
    , body('username', 'Falta el username')
    , asyncHandler(checkUsername));
    
export default usuariosApiRouter;