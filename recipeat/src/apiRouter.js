import express from 'express';
import usuariosApiRouter from './usuarios/api/router.js';
import recetasApiRouter from './receta/api/router.js';

const apiRouter = express.Router();
apiRouter.use(express.json());

apiRouter.use('/usuarios', usuariosApiRouter);
apiRouter.use('/recetas', recetasApiRouter)

export default apiRouter;