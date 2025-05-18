import { validationResult, matchedData } from 'express-validator';
import { render } from '../utils/render.js';
import { Pedido, PedidoContiene } from './Pedidos.js';
import { logger } from '../logger.js';
import { RolesEnum } from '../usuarios/Usuario.js';
import { Ingrediente } from '../ingrediente/Ingrediente.js';
import { errorAjax } from '../middleware/error.js';

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
        req.session.hasPedido = true;
        return next(err, req, res);
    }

    try {
        const newPedido = Pedido.insertPedido(username);
        logger.info("Pedido '%i' registrado para el usuario %s. Fecha de creación: %s)", newPedido.id, newPedido.user, newPedido.fecha);

        req.session.hasPedido = true; //Guardo en la sesión que el usuario tiene un pedido, para el enlace de pedidos en la cabecera

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
        req.session.hasPedido = false;
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

export function updatePedido(req, res, next) {

    const requestWith = req.get('X-Requested-With');
    const esAjax = requestWith != undefined && ['xmlhttprequest', 'fetch'].includes(requestWith.toLowerCase());
    if (esAjax)
        logger.debug("Petición AJAX recibida para updatePedido()");

    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);

        if (esAjax) {
            logger.debug("Devuelto código 400 a la petición AJAX");
            return res.status(400).json({ status: 400, errores });
        }

        return render(req, res, `paginas/index`, {
            datos,
            errores,
        });
    }

    const username = req.session.username;

    if (!Pedido.exists(username)) {
        const err = {};
        err.statusCode = 403;
        err.message = "El usuario no tiene un pedido creado";
        req.session.hasPedido = true;
        return next(err, req, res);
    }

    const { id, cantidad } = matchedData(req);

    try {
        const pedido = Pedido.getPedidoByUsername(username);

        const id_pedido = pedido.id;

        PedidoContiene.cambiaCantidad(cantidad, id, id_pedido);

        logger.debug("El usuario %s ha cambiado la cantidad del ingrediente %i de su pedido (nueva cantidad: %i)", username, id, cantidad);

        if (esAjax) {
            const ingrediente = Ingrediente.getIngredienteById(id);
            const nuevoPrecio = ingrediente.precio * cantidad;
            logger.debug("Devuelto código 200 a la petición AJAX");
            return res.status(200).json({ ok: true , nuevoPrecio });
        }

        // Redirigir al finalizar
        return res.redirect(`/pedido/verPedido`);  //TODO: CAMBIAR URL
    }
    catch (e) {
        logger.error("Error al cambiar la cantidad del ingrediente %i del pedido de %s: %s'", id,  username, e.message);

        const err = {};

        err.statusCode = 500;
        err.message = "Error al cambiar la cantidad del ingrediente del pedido";

        if (esAjax)
            return errorAjax(err, res);

        return next(err, req, res);
    }
}

export function removeIngrediente(req, res, next){
    const requestWith = req.get('X-Requested-With');
    const esAjax = requestWith != undefined && ['xmlhttprequest', 'fetch'].includes(requestWith.toLowerCase());
    if (esAjax)
        logger.debug("Petición AJAX recibida para updatePedido()");

    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);

        if (esAjax) {
            logger.debug("Devuelto código 400 a la petición AJAX");
            return res.status(400).json({ status: 400, errores });
        }

        return render(req, res, `paginas/index`, {
            datos,
            errores,
        });
    }

    const username = req.session.username;

    if (!Pedido.exists(username)) {
        const err = {};
        err.statusCode = 403;
        err.message = "El usuario no tiene un pedido creado";
        req.session.hasPedido = true;
        return next(err, req, res);
    }

    const { id } = matchedData(req);

    try {
        const pedido = Pedido.getPedidoByUsername(username);

        const id_pedido = pedido.id;

        PedidoContiene.delete(id, id_pedido);

        if (esAjax) {
            logger.debug("Devuelto código 200 a la petición AJAX");
            return res.status(200).json({ ok: true });
        }

        // Redirigir al finalizar
        return res.redirect(`/pedido/verPedido`);  //TODO: CAMBIAR URL
    }
    catch (e) {
        logger.error("Error al eliminar el ingrediente %i del pedido de %s: %s'", id,  username, e.message);

        const err = {};

        err.statusCode = 500;
        err.message = "Error al eliminar el ingrediente del pedido";

        if (esAjax)
            return errorAjax(err, res);

        return next(err, req, res);
    }
}

// Añadir un ingrediente a un pedido
export function addIngredientes(req, res, next) {

    const requestWith = req.get('X-Requested-With');
    const esAjax = requestWith != undefined && ['xmlhttprequest', 'fetch'].includes(requestWith.toLowerCase());
    if (esAjax)
        logger.debug("Petición AJAX recibida para addIngredientes(Pedidos)");


    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);


        if (esAjax) {
            logger.debug("Devuelto código 400 a la petición AJAX");
            return res.status(400).json({ status: 400, errores });
        }

        return render(req, res, `paginas/index`, { //TODO: CAMBIAR URL
            datos,
            errores,
        });
    }

    const { ingredientes_id, username, ingredientes_cantidad } = matchedData(req);

    if (username !== req.session.username)
        return render(req, res, "paginas/noPermisos");

    try {
        let pedido;

        if (!Pedido.exists(username)) { // Si el usuario no tiene un pedido, se crea uno nuevo
            pedido = Pedido.insertPedido(username);
            logger.info("Pedido '%i' registrado para el usuario %s. Fecha de creación: %s)", pedido.id, pedido.user, pedido.fecha);
            req.session.hasPedido = true;
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

        if (esAjax) {
            logger.debug("Devuelto código 200 a la petición AJAX");
            return res.status(200).json({ ok: true });
        }

        // Redirigir al finalizar
        return res.redirect(`paginas/index`);  //TODO: CAMBIAR URL
    }
    catch (e) {
        logger.error("Error al añadir los ingredientes al pedido de %s: %s'", username, e.message);

        const err = {};

        err.statusCode = 500;
        err.message = "Error al añadir los ingredientes al pedido";

        if (esAjax)
            return errorAjax(err, res);

        return next(err, req, res);
    }
}

export function mostrarPagarPedido(req, res, next) {
    if (Pedido.exists(req.session.username)) // Si el usuario tiene pedido se muestra el formulario de pago
        return render(req, res, 'paginas/pagarPedido', {
            errores: []
        });
    else
        return res.redirect('/'); // Si no tiene pedido se envía al index
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

            req.session.hasPedido = false;

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


export function viewPedido(req, res, next) {
    const username = req.session.username;
    if (Pedido.exists(username)) {
        const pedido = Pedido.getPedidoByUsername(username);

        const arrayIngredientes = PedidoContiene.getIngredientesByPedido(pedido.id);

        let precioTotal = 0;

        for (let ingredienteContenido of arrayIngredientes) {
            precioTotal += ingredienteContenido.cantidad * ingredienteContenido.ingrediente.precio;
            ingredienteContenido.ingrediente.precio = ingredienteContenido.cantidad * ingredienteContenido.ingrediente.precio;
        }

        //Truncamos el precio del pedido a sólo dos decimales
        precioTotal = Math.trunc(precioTotal * 100) / 100;

        return render(req, res, 'paginas/miPedido', {
            pedido,
            arrayIngredientes,
            precioTotal
        });
    }
    else {
        const err = {};
        err.statusCode = 400;
        err.message = "No tienes pedido";
        return next(err, req, res);
    }
}