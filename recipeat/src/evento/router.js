import express from 'express';
import asyncHandler from 'express-async-handler';
import { getEventosUsuario, crearEventoUsuario, eliminarEventoUsuario, actualizarEventoUsuario } from './controllers.js';
import { autenticado } from '../middleware/auth.js';

const router = express.Router();

router.get('/:username', autenticado('/usuarios/home'), asyncHandler(getEventosUsuario));
router.post('/crear', autenticado('/usuarios/home'), asyncHandler(crearEventoUsuario));
router.post('/actualizar', autenticado('/usuarios/home'), asyncHandler(actualizarEventoUsuario));
router.delete('/:id', autenticado('/usuarios/home'), asyncHandler(eliminarEventoUsuario));

export default router;
