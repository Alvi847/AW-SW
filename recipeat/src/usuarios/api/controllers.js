import { validationResult, matchedData } from 'express-validator';
import { Usuario } from '../Usuario.js';

/**
 * Recibe una request para ver si un usuario ya existe o no
 * 
 * Los datos enviados por el cliente son JSON de la forma:
 * {
 *  username: <nombre de usuario>
 * } 
 * 
 * Devuelve al cliente un booleano indicando si puede usar ese nombre de usuario o no
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns Un código de estado HTTP indicando el resultado y un booleano 
 */
export async function checkUsername(req, res) {
    const result = validationResult(req);
    const datos = matchedData(req, { includeOptionals: true });
    if (! result.isEmpty()) {
        const errores = result.array();
        return res.status(400).json({ status: 400, errores });
    }
    const { username } = datos;
    const disponible = ! Usuario.exists(username);

    return res.status(200).json(disponible);
}