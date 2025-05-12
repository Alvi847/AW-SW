import { Ingrediente } from "../Ingrediente.js";
import { validationResult, matchedData } from 'express-validator';
import { pick } from 'lodash-es';

/**
 * Responde a una petición del cliente devolviéndole la lista de ingredientes creados en la aplicación
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export function listaIngredientes(req, res) {
    const result = validationResult(req);
    const datos = matchedData(req, { includeOptionals: true });

    if (!result.isEmpty()) {
        const errores = result.array();
        return res.status(400).json({ status: 400, errores });
    }

    const ingredientes = Ingrediente.getAllIngredientes();
    const data = ingredientes.map((ingrediente) => pick(ingrediente, ['id', 'nombre', 'unidad']));

    return res.status(200).json({
        data
    });
}