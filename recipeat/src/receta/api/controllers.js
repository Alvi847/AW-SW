import { validationResult, matchedData } from 'express-validator';
import { Receta } from '../Receta.js';

/**
 * Recibe una request para ver si una receta existe o no
 * 
 * Los datos enviados por el cliente son JSON de la forma:
 * {
 *  id: <id de la receta>
 * } 
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns Un código de estado HTTP indicando el resultado
 */
export async function checkReceta(req, res) {
    const result = validationResult(req);
    const datos = matchedData(req, { includeOptionals: true });
    if (!result.isEmpty()) {
        const errores = result.array();
        return res.status(400).json({ status: 400, errores });
    }
    const { id } = datos;
    const existe = Receta.exists(id);

    return res.status(200).json(existe);
}

/**
 * Busca las recetas que el cliente pida según los filtros elegidos en la barra de búsqueda
 * 
 * @param {*} req 
 * @param {*} res 
 */
export function buscarRecetas(req, res) {

    const { tipo, q } = req.query;
    const recetas = Receta.getAllRecetas();

    const filtro = q.toLowerCase().trim();

    const recetasFiltradas = recetas.filter(r => {
        if (tipo === 'nombre') {
            return r.nombre.toLowerCase().includes(filtro);
        } else if (tipo === 'ingrediente') {
            // Si quieres más realismo tendrías que buscar en r.ingredientes
            return (r.ingredientes || []).some(ing => ing.toLowerCase().includes(filtro));
        }
        return false;
    });

    // Esto porque no se envía el campo id al cliente con res.json(recetasFiltradas) ya que el campo es privado de la clase
    res.json(recetasFiltradas.map(r => ({
        id: r.id,
        nombre: r.nombre,
        descripcion: r.descripcion,
        modo_preparacion: r.modo_preparacion,
        likes: r.likes,
        user: r.user,
        user_liked: r.user_liked,
        imagen: r.imagen,
        gusto: r.gusto,
        nivel: r.nivel,
        dieta: r.dieta,
        ingredientes: r.ingredientes,
    })));
}