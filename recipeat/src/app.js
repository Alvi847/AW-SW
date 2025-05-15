/*
https://www.digitalocean.com/community/tutorials/nodejs-express-basics
https://www.digitalocean.com/community/tutorials/how-to-use-ejs-to-template-your-node-application
https://ejs.co/
https://expressjs.com/en/starter/hello-world.html
https://appsupport.academy/play-by-play-nodejs-express-sessions-storage-configuration
*/
import express from 'express';
import session from 'express-session';
import { config } from './config.js';
import usuariosRouter from './usuarios/router.js';
import contenidoRouter from './contenido/router.js';
import recetasRouter from './receta/router.js';
import comentariosRouter from './comentario/router.js';
import eventoRouter from './evento/router.js';

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';
import pinoHttp from 'pino-http';
const pinoMiddleware = pinoHttp(config.logger.http(logger));
import { flashMessages } from './middleware/flash.js';
import { errorHandler } from './middleware/error.js';
import apiRouter from './apiRouter.js';
import ingredientesRouter from './ingrediente/router.js';
import { render } from './utils/render.js';
import pedidosRouter from './Pedidos/router.js';

const __dirname = dirname(fileURLToPath(import.meta.url));


export const app = express();

app.set('view engine', 'ejs');
app.set('views', config.vistas);

app.use(pinoMiddleware);
app.use(express.urlencoded({ extended: false }));
app.use(session(config.session));
app.use(flashMessages);

app.use('/', express.static(config.recursos));
app.use(express.json());


app.get('/', (req, res) => {
    res.render('pagina', {
        contenido: 'paginas/index',
        session: req.session
    });
})
app.use('/usuarios', usuariosRouter);
app.use('/contenido', contenidoRouter);
app.use('/receta', recetasRouter);
app.use('/comentario', comentariosRouter);
app.use('/eventos', eventoRouter);
app.use('/ingrediente', ingredientesRouter);
app.use('/api', apiRouter);
app.use('/pedido', pedidosRouter);

app.get("/imagen/:id", (request, response) => {
    const __filename = fileURLToPath(import.meta.url);  // He visto que esto es necesario para poder obtener la ruta del script en ES
    let pathImg = join(dirname(__filename), "../uploads", request.params.id);
    request.log.debug("Recibida peticion para la foto: '%s'", pathImg);
    response.sendFile(pathImg);
});

app.use(errorHandler);

// Un middleware que se encarga de notificar al usuario de que no se ha encontrado la página que busca
app.use('*', (req, res) => {
    res.render('pagina',    //No devuelvo el código 404 porque si lo hago, en el VPS se muestra una página predeterminada
        {
            contenido: "paginas/error",
            session: req.session,
            message: `La página que buscas no existe`
        })
});