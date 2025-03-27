import express from 'express';
import { viewContenidoAdmin, viewContenidoNormal } from './controllers.js';
import { autenticado, tieneRol } from '../middleware/auth.js';
import { RolesEnum } from '../usuarios/Usuario.js';
import asyncHandler from 'express-async-handler';

const contenidoRouter = express.Router();

contenidoRouter.use(autenticado('/usuarios/login'));

contenidoRouter.get('/normal', asyncHandler(viewContenidoNormal));

contenidoRouter.get('/admin', tieneRol(RolesEnum.ADMIN), asyncHandler(viewContenidoAdmin));

export default contenidoRouter;