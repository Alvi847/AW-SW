import { body } from 'express-validator';
import express from 'express';
import { viewLogin, doLogin, doLogout, viewHome, viewRegistro, doRegistro, viewPerfil, viewUpdatePerfil, updatePerfil } from './controllers.js';
import { autenticado } from '../middleware/auth.js';
import asyncHandler from 'express-async-handler';

const usuariosRouter = express.Router();

usuariosRouter.get('/login', autenticado(null), asyncHandler(viewLogin));
usuariosRouter.post('/login', autenticado(null, '/usuarios/home')
    , body('username', 'No puede ser vacío').trim().notEmpty()
    , body('password', 'No puede ser vacío').trim().notEmpty()
    , asyncHandler(doLogin));
usuariosRouter.get('/logout', doLogout);

usuariosRouter.get('/home', autenticado('/usuarios/home'), asyncHandler(viewHome));
usuariosRouter.get('/registro', autenticado(null, '/usuarios/home'), asyncHandler(viewRegistro));
usuariosRouter.post('/registro'
    , body('username', 'Sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i)
    , body('username', 'No puede ser vacío').trim().notEmpty()
    , body('nombre', 'No puede ser vacío').trim().notEmpty()
    , body('password', 'La contraseña no tiene entre 6 y 10 caracteres').trim().isLength({ min: 6, max: 10 })
    , asyncHandler(doRegistro));

usuariosRouter.get('/verPerfil', autenticado('/usuarios/home'), asyncHandler(viewPerfil));
usuariosRouter.get('/updatePerfil', autenticado('/usuarios/home'), asyncHandler(viewUpdatePerfil));
usuariosRouter.post('/updatePerfil'
    , body('username', 'Sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i)
    , body('username', 'No puede ser vacío').trim().notEmpty()
    , body('nombre', 'No puede ser vacío').trim().notEmpty()
    , body('email', 'No es un email válido').isEmail()
    , asyncHandler(updatePerfil));


export default usuariosRouter;