import express from 'express';
import { viewLogin, doLogin, doLogout, viewRegister, doRegister } from './controllers.js';

const usuariosRouter = express.Router();

usuariosRouter.get('/login', viewLogin);
usuariosRouter.post('/login', doLogin);
usuariosRouter.get('/logout', doLogout);

//!2 rutas adicionales
//* *viewRegister: muestra al usuario la interfaz para poder registrarse en la app (VISTA)
usuariosRouter.get('/register', viewRegister);
//* *doRegister: recopila los datos que el usuario ha ingresado para poder ser registrado (ACCION)
usuariosRouter.post('/register', doRegister);

export default usuariosRouter;