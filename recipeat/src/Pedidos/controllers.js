import { validationResult, matchedData } from 'express-validator';
import { render } from '../utils/render.js';
import { Pedido, PedidoContiene } from './Pedidos.js';
import { logger } from '../logger.js';
import { RolesEnum } from '../usuarios/Usuario.js';

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

    if (username !== req.session.username && req.session.rol !== RolesEnum.ADMIN)
        return render(req, res, "paginas/noPermisos");

    if (Pedido.exists(username)) {
        const err = {};
        err.statusCode = 403;
        err.message = "El usuario ya tiene un pedido creado";
        return next(err, req, res);
    }

    try {
        const newPedido = Pedido.insertPedido(username);
        logger.info("Pedido '%i' registrado para el usuario %s. Fecha de creación: %s)", newPedido.id, newPedido.user, newPedido.fecha);

        // Redirigir al finalizar
        return res.redirect(`paginas/index`);  //TODO: CAMBIAR URL
    }
    catch (e) {
        req.log.error(e.message);

        const err = {};

        err.statusCode = 500;
        err.message = "Error al crear el pedido";

        return next(err, req, res);
    }
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

    const { username } = matchedData(req);

    if (username !== req.session.username && req.session.rol !== RolesEnum.ADMIN)
        return render(req, res, "paginas/noPermisos");

    if (!Pedido.exists(username)) {
        const err = {};
        err.statusCode = 403;
        err.message = "El usuario no tiene un pedido creado";
        return next(err, req, res);
    }

    try {
        const id_pedido = Pedido.getPedidoByUsername(username).id;
        Pedido.deletePedido(id_pedido);
        logger.info("Pedido de %s borrado con éxito", username);

        // Redirigir al finalizar
        return res.redirect(`paginas/index`);  //TODO: CAMBIAR URL
    }
    catch (e) {
        req.log.error("Error al eliminar el pedido de '%s': %s ", username, e.message);

        const err = {};

        err.statusCode = 500;
        err.message = "Error al borrar el pedido";

        return next(err, req, res);
    }
}

// Añadir un ingrediente a un pedido
export function addIngredientes(req, res, next) {

    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        return render(req, res, `paginas/index`, { //TODO: CAMBIAR URL
            datos,
            errores,
        });
    }

    const { ingredientes_id, username, ingredientes_cantidad } = matchedData(req);

    if (username !== req.session.username && req.session.rol !== RolesEnum.ADMIN)
        return render(req, res, "paginas/noPermisos");

    
    
    try {
        let pedido;

        if(!Pedido.exists(username)){ // Si el usuario no tiene un pedido, se crea uno nuevo
            pedido = Pedido.insertPedido(username);
        }
        else
            pedido = Pedido.getPedidoByUsername(username);

        const id_pedido = pedido.id;

        const longitud = (ingredientes_id.length || 1);

        for (let i = 0; i < longitud; i++) {
            const id_ingrediente = ingredientes_id[i];
            const cantidad = ingredientes_cantidad[i];

            PedidoContiene.insertaIngredienteEnPedido(id_ingrediente, id_pedido, cantidad);

            logger.debug("El usuario %s ha añadido el ingrediente %i a su pedido (cantidad añadida: %i)", username, id_ingrediente, cantidad);

        }
        // Redirigir al finalizar
        return res.redirect(`paginas/index`);  //TODO: CAMBIAR URL
    }
    catch (e) {
        logger.error("Error al añadir los ingredientes al pedido de %s: %s'", username, e.message);

        const err = {};

        err.statusCode = 500;
        err.message = "Error al añadir los ingredientes al pedido";

        return next(err, req, res);
    }
}

export function mostrarPagarPedido(req, res, next) {
    return render(req, res, 'paginas/pagarPedido', {
        errores: []
    });
}

export function doPagarPedido(req, res, next) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        return render(req, res, 'paginas/pagarPedido', { //TODO: CAMBIAR URL
            datos,
            errores,
        });
    }

    // Este código simula un pago de un pedido

    const username = req.session.username;

    if (Pedido.exists(username)) {
        try {
            const pedido = Pedido.getPedidoByUsername(username);

            const ingredientesContenidos = PedidoContiene.getIngredientesByPedido(pedido.id);

            let precioTotal = 0;

            for (const ingredienteContenido of ingredientesContenidos) {
                precioTotal += ingredienteContenido.cantidad * ingredienteContenido.ingrediente.precio;
            }

            //Truncamos el precio del pedido a sólo dos decimales
            precioTotal = Math.trunc(precioTotal * 100) / 100;

            logger.info("El usuario %s ha pagado su pedido con un precio de %d€", username, precioTotal);

            //Se elimina el pedido
            Pedido.deletePedido(pedido.id);

            return res.redirect("/");

        }
        catch (e) {
            logger.error("Se produjo un error al intentar pagar el pedido de %s: %s", username, e.message);

            const err = {};
            err.message = "Hubo un problema al intentar pagar el pedido";
            err.statusCode = 500;
            return next(err, req, res);
        }
    }
    else {
        const err = {};
        err.statusCode = 400;
        err.message = "No tienes pedido";
        return next(err, req, res);
    }
}