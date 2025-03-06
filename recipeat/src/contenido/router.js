import express from 'express';
import { viewContenidoAdmin, viewContenidoNormal } from './controllers.js';

const contenidoRouter = express.Router();

contenidoRouter.get('/normal', viewContenidoNormal);

contenidoRouter.get('/admin', viewContenidoAdmin);

contenidoRouter.get('/', (req, res) => {
    res.render('paginas/home', { session: req.session });
});

export default contenidoRouter;