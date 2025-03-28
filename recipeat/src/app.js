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
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'url';  
import { logger } from './logger.js';
import pinoHttp  from 'pino-http';
const pinoMiddleware = pinoHttp(config.logger.http(logger));
import { flashMessages } from './middleware/flash.js';
import { errorHandler } from './middleware/error.js'; 

export const app = express();

app.set('view engine', 'ejs');
app.set('views', config.vistas);

app.use(pinoMiddleware);
app.use(express.urlencoded({ extended: false }));
app.use(session(config.session));
app.use(flashMessages);

app.use('/', express.static(config.recursos));
app.get('/', (req, res) => {
    res.render('pagina', {
        contenido: 'paginas/index',
        session: req.session
    });
})
app.use('/usuarios', usuariosRouter);
app.use('/contenido', contenidoRouter);
app.use('/receta', recetasRouter);

app.get("/imagen/:id", (request, response) => {
    const __filename = fileURLToPath(import.meta.url);  // He visto que esto es necesario para poder obtener la ruta del script en ES
    let pathImg = join( dirname(__filename), "/receta/uploads", request.params.id);
    console.log("Recibida peticion para la foto: ", pathImg);
    response.sendFile(pathImg);
});

app.use(errorHandler);
