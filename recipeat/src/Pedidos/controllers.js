import { validationResult, matchedData } from 'express-validator';
import { render } from '../utils/render.js';
import { Pedido, PedidoContiene } from './Pedidos.js';
import { Ingrediente } from '../ingrediente/Ingrediente.js';

// Agregar un nuevo pedido
export function doCreatePedido(req, res, next) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        return render(req, res, 'paginas/index', { //TODO: CAMBIAR URL
            datos,
            errores,
        });
    }

    const { username } = matchedData(req);
    try{
        const newPedido = Pedido.insertPedido(username);
    }
    catch(e){
        req.log.error(e.message);
        
        const err = {};

        err.statusCode = 500;
        err.message = "Error al crear el pedido";

        next(err, req, res);
    }
    req.log.info("Pedido '%i' registrado para el usuario %s. Fecha de creación: %s)", newPedido.id, newPedido.user, newPedido.fecha);

    // Redirigir al finalizar
    res.redirect(`paginas/index`);  //TODO: CAMBIAR URL
}

// Eliminar un pedido
export function deletePedido(req, res, next) {

    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        return render(req, res, `paginas/index`, { //TODO: CAMBIAR URL
            datos,
            errores,
        });
    }

    const username = matchedData(req);

    try{
        const id_pedido = Pedido.getPedidoByUsername(username).id;
        Pedido.deletePedido(id_pedido);
    }
    catch(e){
        req.log.error("Error al eliminar el pedido '%i': %s ", id_pedido, e.message);
    
        const err = {};

        err.statusCode = 500;
        err.message = "Error al borrar el pedido";

        next(err, req, res);
    }

    // Redirigir al finalizar
    res.redirect(`paginas/index`);  //TODO: CAMBIAR URL
}

// Añadir un ingrediente a un pedido
export function addIngrediente(req, res, next){

    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        return render(req, res, `paginas/index`, { //TODO: CAMBIAR URL
            datos,
            errores,
        });
    }

    const {nombre_ingrediente, username, cantidad} = matchedData(req);

    try{
        const id_ingrediente = Ingrediente.getIngredienteByName(nombre_ingrediente).id;
        const id_pedido = Pedido.getPedidoByUsername(username);
        PedidoContiene.insertaIngredienteEnPedido(id_ingrediente, id_pedido, cantidad);
    }
    catch(e){
        req.log.error("Error al añadir el ingrediente '%i': %s a la receta '%i'", id_ingrediente, e.message, id_receta);
    
        const err = {};

        err.statusCode = 500;
        err.message = "Error al añadir el ingrediente al pedido el pedido";

        next(err, req, res);
    }

    // Redirigir al finalizar
    res.redirect(`paginas/index`);  //TODO: CAMBIAR URL
}