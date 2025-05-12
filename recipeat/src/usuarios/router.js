import { body } from 'express-validator';
import express from 'express';
import { viewLogin, doLogin, doLogout, viewHome, viewRegistro, doRegistro, viewPerfil, viewUpdatePerfil, updatePerfil, deleteUsuario, viewAdministrar, cambiarRolUsuario, viewPerfilUser, viewFavoritosUser, viewRecetasUser, viewPreferencias, guardarPreferencias } from './controllers.js';
import { autenticado } from '../middleware/auth.js';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'url';
//import { soloAdmins } from '../middleware/auth.js'; 

const __dirname = dirname(fileURLToPath(import.meta.url));
export const UPLOAD_PATH = join(__dirname, "../../uploads");

const multerFactory = multer({ dest: join(UPLOAD_PATH) });

const usuariosRouter = express.Router();





usuariosRouter.get('/login', autenticado(null), asyncHandler(viewLogin)); //TODO: Si estás logueado no deberia mostrar el formulario de inicio de sesión autenticado(null, '/usuarios/home')
usuariosRouter.post('/login', autenticado(null, '/usuarios/home')
    , body('username', 'No puede ser vacío').trim().notEmpty()
    , body('password', 'No puede ser vacío').trim().notEmpty()
    , asyncHandler(doLogin));
usuariosRouter.get('/logout', doLogout);

usuariosRouter.get('/home', autenticado('/usuarios/home'), asyncHandler(viewHome));
usuariosRouter.get('/registro', autenticado(null, '/usuarios/home'), asyncHandler(viewRegistro));
usuariosRouter.post('/registro', multerFactory.single("imagen")
    , body('username', 'Sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i)
    , body('username', 'No puede ser vacío').trim().notEmpty()
    , body('nombre', 'No puede ser vacío').trim().notEmpty()
    , body('password', 'La contraseña no tiene entre 6 y 10 caracteres').trim().isLength({ min: 6, max: 10 })
    , asyncHandler(doRegistro));

usuariosRouter.get('/verPerfil', autenticado('/usuarios/home'), asyncHandler(viewPerfil));
usuariosRouter.get('/updatePerfil', autenticado('/usuarios/home'), asyncHandler(viewUpdatePerfil));
usuariosRouter.post('/updatePerfil', multerFactory.single("imagen")
    , body('username', 'Sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i)
    , body('username', 'No puede ser vacío').trim().notEmpty()
    , body('nombre', 'No puede ser vacío').trim().notEmpty()
    , body('email', 'No es un email válido').isEmail()
    , asyncHandler(updatePerfil));

usuariosRouter.post('/removeUsuario', autenticado('/usuarios/home'), asyncHandler(deleteUsuario));
usuariosRouter.get('/administrar', autenticado('/usuarios/home'), asyncHandler(viewAdministrar));
usuariosRouter.post('/cambiarRol', autenticado('/usuarios/home'), asyncHandler(cambiarRolUsuario));

usuariosRouter.get('/misPreferencias', autenticado('/login'), asyncHandler(viewPreferencias));
usuariosRouter.post('/misPreferencias',
  autenticado('/login'),
  body('gusto').trim().optional({ checkFalsy: true }),
  body('nivel').trim().optional({ checkFalsy: true }),
  body('dieta').trim().optional({ checkFalsy: true }),
  asyncHandler(guardarPreferencias)
);

usuariosRouter.get('/:username/recetas', autenticado('/usuarios/home'), asyncHandler(viewRecetasUser));
usuariosRouter.get('/:username/favoritos', autenticado('/usuarios/home'), asyncHandler(viewFavoritosUser));
usuariosRouter.get('/:username', autenticado('/usuarios/home'), asyncHandler(viewPerfilUser)); //ver perfil de users dinamico
  

export default usuariosRouter;