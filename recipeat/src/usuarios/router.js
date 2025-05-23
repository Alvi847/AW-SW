import { body, check, param } from 'express-validator';
import express from 'express';
import { viewLogin, doLogin, doLogout, viewHome, viewRegistro, doRegistro, viewUpdatePerfil, updatePerfil, deleteUsuario, viewAdministrar, cambiarRolUsuario, viewPerfilUser, viewFavoritosUser, viewRecetasUser, viewPreferencias, guardarPreferencias } from './controllers.js';
import { autenticado, tieneRol } from '../middleware/auth.js';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'url';
//import { soloAdmins } from '../middleware/auth.js'; 

const __dirname = dirname(fileURLToPath(import.meta.url));
export const UPLOAD_PATH = join(__dirname, "../../uploads");

const multerFactory = multer({ dest: join(UPLOAD_PATH) });

const usuariosRouter = express.Router();

usuariosRouter.get('/perfil/:username', autenticado('/usuarios/home'), asyncHandler(viewPerfilUser)); //ver perfil de users dinamico

usuariosRouter.get('/login', autenticado(null), asyncHandler(viewLogin));
usuariosRouter.post('/login', autenticado(null, '/usuarios/home')
    , body('username', 'No puede ser vacío').trim().notEmpty()
    , body('password', 'No puede ser vacío').trim().notEmpty()
    , asyncHandler(doLogin));
usuariosRouter.get('/logout', doLogout);

usuariosRouter.get('/home', autenticado('/usuarios/login'), asyncHandler(viewHome));
usuariosRouter.get('/registro', autenticado(null, '/usuarios/home'), asyncHandler(viewRegistro));
usuariosRouter.post('/registro', multerFactory.single("imagen")
    , body('username', 'Sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i)
    , body('username', 'No puede ser vacío').trim().notEmpty()
    , body('nombre', 'No puede ser vacío').trim().notEmpty()
    , body('password', 'La contraseña no tiene entre 6 y 10 caracteres').trim().isLength({ min: 6, max: 10 })
    , asyncHandler(doRegistro));

usuariosRouter.get('/updatePerfil', autenticado('/usuarios/login'), asyncHandler(viewUpdatePerfil));
usuariosRouter.post('/updatePerfil', multerFactory.single("imagen")
    , body('username', 'Sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i)
    , body('username', 'No puede ser vacío').trim().notEmpty()
    , body('nombre', 'No puede ser vacío').trim().notEmpty()
    , body('email', 'No es un email válido').isEmail()
    , check('imagen', "Archivo inválido").custom((value, { req }) => {
        if (!req.file) return true; 
        const tiposPermitidos = ["image/jpeg", "image/png"];
        return tiposPermitidos.includes(req.file.mimetype);
    }).withMessage("Sólo se permiten imágenes jpg o png")
    , asyncHandler(updatePerfil));

usuariosRouter.post('/removeUsuario'
    , body('username', 'Sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i)
    , body('username', 'No puede ser vacío').trim().notEmpty()
    , autenticado('/usuarios/login')
    , tieneRol()
    , asyncHandler(deleteUsuario));

usuariosRouter.get('/administrar', autenticado('/usuarios/login'), tieneRol(), asyncHandler(viewAdministrar));

usuariosRouter.post('/cambiarRol'
    , body('username', 'Sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i)
    , body('username', 'No puede ser vacío').trim().notEmpty()
    , autenticado('/usuarios/login')
    , tieneRol()
    , asyncHandler(cambiarRolUsuario));

usuariosRouter.get('/misPreferencias', autenticado('/usuarios/login'), asyncHandler(viewPreferencias));

usuariosRouter.post('/misPreferencias',
  autenticado('/usuarios/login'),
  body('gusto').trim().optional({ checkFalsy: true }),
  body('nivel').trim().optional({ checkFalsy: true }),
  body('dieta').trim().optional({ checkFalsy: true }),
  asyncHandler(guardarPreferencias)
);

usuariosRouter.get('/:username/recetas', autenticado('/usuarios/login')
, param('username', 'El nombre de usuario no puede ser vacío').trim().notEmpty()
, param('username', 'El nombre de usuario sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i)
, asyncHandler(viewRecetasUser));
usuariosRouter.get('/:username/favoritos', autenticado('/usuarios/login')
, param('username', 'El nombre de usuario no puede ser vacío').trim().notEmpty()
, param('username', 'El nombre de usuario sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i)
, asyncHandler(viewFavoritosUser));
usuariosRouter.get('/:username', autenticado('/usuarios/login')
, param('username', 'El nombre de usuario no puede ser vacío').trim().notEmpty()
, param('username', 'El nombre de usuario sólo puede contener números y letras').trim().matches(/^[A-Z0-9]*$/i)
, asyncHandler(viewPerfilUser)); //ver perfil de users dinamico
  

export default usuariosRouter;
