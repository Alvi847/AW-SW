import express from 'express';
import { viewContenidoAdmin, viewContenidoNormal } from './controllers.js';

const contenidoRouter = express.Router();

contenidoRouter.get('/normal', viewContenidoNormal);

contenidoRouter.get('/admin', viewContenidoAdmin);

export default contenidoRouter;