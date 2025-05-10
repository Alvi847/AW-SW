import express from 'express';
import usuariosApiRouter from './usuarios/api/router.js';
import recetasApiRouter from './receta/api/router.js';
import ingredientesApiRouter from './ingrediente/api/router.js';

const apiRouter = express.Router();
apiRouter.use(express.json());

apiRouter.use('/usuarios', usuariosApiRouter);
apiRouter.use('/recetas', recetasApiRouter);
apiRouter.use('/ingredientes', ingredientesApiRouter);

export default apiRouter;