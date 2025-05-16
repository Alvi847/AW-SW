import { Ingrediente } from "../ingrediente/Ingrediente.js";
import { logger } from "../logger.js";

/**
 * Clase para los pedidos
 */
export class Pedido {
    static #insertStmt = null;
    static #getAllStmt = null;
    static #deleteStmt = null;
    static #getStmt = null;

    static initStatements(db) {
        if (this.#getStmt !== null) return;

        //*Crear un nuevo pedido
        this.#insertStmt = db.prepare('INSERT INTO Pedidos (usuario, creacion) VALUES (@user, @creacion)');

        //*Seleccionar todos los pedidos de la tabla
        this.#getAllStmt = db.prepare('SELECT * FROM Pedidos');

        //*Eliminar pedido
        this.#deleteStmt = db.prepare('DELETE FROM Pedidos WHERE id = @id');

        //*Seleccionar un pedido de la tabla
        this.#getStmt = db.prepare('SELECT * FROM Pedidos WHERE usuario = @user');
    }

    /**
     * Inserta un pedido con el usuario y fecha de creacion dados
     * @param {string} usuario 
     * @param {Date} creacionPedido 
     * @returns {Pedido} Una instancia del pedido insertado
     * @throws {ErrorInsertPedido} Un error de inserción
     */
    static #insert(usuario, creacionPedido) {
        try {
            const result = this.#insertStmt.run({
                user: usuario,
                creacion: creacionPedido
            });
            return new Pedido(usuario, result.lastInsertRowid, creacionPedido);
        }
        catch (e) {
            if (this.#insertStmt == null)
                console.log("insert stmt null");
            throw new ErrorInsertPedido(usuario, { cause: e });
        }
    }

    /**
     * Función para acceder a la inserción de un pedido desde fuera, calcula la fecha de creación de este
     * @param {string} usuario 
     * @returns Una instancia del pedido insertado
     * @throws {Error} Un error de inserción
     */
    static insertPedido(usuario) {
        try {
            const creacionPedido = new Date().toLocaleString();
            return Pedido.#insert(usuario, creacionPedido);
        }
        catch (e) {
            logger.error(e.cause);
            throw new Error(`Error al insertar el pedido en la base de datos: ${e.message}`);
        }
    }

    /**
     * Borra un pedido con el id dado
     * @param {int} id 
     * @throws {Error} Un error de borrado
     */
    static deletePedido(id) {
        const result = this.#deleteStmt.run({ id });
        if (result.changes === 0) {
            logger.error("Error al borrar pedido de la base de datos");
            throw new Error(`No se encontró el pedido con id ${id}`);
        }
    }

    /**
     * Devuelve el pedido actual del usuario dado 
     * @param {string} usuario 
     * @returns {Pedido} Una instancia del pedido en la base de datos
     * @throws {Error} Un error de acceso a la base de datos (p. e. no existe el pedido)
     */
    static getPedidoByUsername(usuario) {
        try {
            const result = this.#getStmt.get({ user: usuario });
            return new Pedido(result.user, result.id, result.creacion);
        }
        catch (e) {
            logger.error(e.message);
            throw new Error("Error al obtener el pedido de la base de datos");
        }
    }

    /**
     * Devuelve un booleano dependiendo de si el usuario dado tiene un pedido en la base de datos o no
     * @param {string} usuario 
     * @returns {boolean} true si el usuario tiene un pedido, false en caso contrario 
     */
    static exists(usuario){
        try{
            Pedido.getPedidoByUsername(usuario);
            return true;
        }
        catch(e){
            return false;
        }
    }

    /**
     * Devuelve todos los pedidos de la base de datos 
     * @returns {Pedido[]}
     * @throws {Error} Un error de acceso a la base de datos
     */
    static getAllPedidos() {
        try {
            const result = this.#getAllStmt.all();

            let pedidos = [];

            for (const rawPedido of result) {
                const { usuario, id, creacion } = rawPedido;
                const pedido = new Pedido(usuario, id, creacion);
                pedidos.push(pedido);
            }

            return pedidos;
        }
        catch (e) {
            logger.error(e.message);
            throw new Error("Error al obtener los pedidos de la base de datos");
        }
    }

    #user; // Username del usuario dueño del pedido
    #id; // Id del pedido
    fecha; // Fecha de creación del pedido

    constructor(user, id, fecha) {
        this.#user = user;
        this.#id = id;
        this.fecha = fecha;
    }

    get user() {
        return this.#user;
    }

    get id() {
        return this.#id;
    }
}

/**
 * Clase que representa la relación de contención entre un pedido y un pedido
 */
export class PedidoContiene {
    static #insertStmt = null;
    static #deleteStmt = null;
    static #deleteAllByIngredienteStmt = null;
    static #deleteAllByPedidoStmt = null;
    static #getAllByPedidoStmt = null;
    static #updateStmt = null;
    static #sumaCantidadStmt = null;

    static initStatements(db) {
        if (this.#getAllByPedidoStmt !== null) return;

        // Añadir un ingrediente a un pedido
        this.#insertStmt = db.prepare('INSERT INTO Pedidos_Contiene (id_pedido, id_ingrediente, cantidad) VALUES (@id_pedido, @id_ingrediente, @cantidad)');

        // Borrar un ingrediente de un pedido
        this.#deleteStmt = db.prepare('DELETE FROM Pedidos_Contiene WHERE id_pedido = @id_pedido AND id_ingrediente = @id_ingrediente');

        // Borrar un ingrediente de todos los pedidos a los que pertenece
        this.#deleteAllByIngredienteStmt = db.prepare('DELETE FROM Pedidos_Contiene WHERE id_ingrediente = @id_ingrediente');

        // Borrar todos los ingredientes que pertenecen al pedido
        this.#deleteAllByPedidoStmt = db.prepare('DELETE FROM Pedidos_Contiene WHERE id_pedido = @id_pedido');

        // Obtiene los ingredientes de un pedido
        this.#getAllByPedidoStmt = db.prepare('SELECT i.nombre, i.unidad, i.id, i.precio, c.cantidad FROM Ingredientes i JOIN Pedidos_Contiene c ON i.id = c.id_ingrediente WHERE c.id_pedido = @id_pedido');

        // Cambia la cantidad de un ingrediente en un pedido
        this.#updateStmt = db.prepare('UPDATE Pedidos_Contiene SET cantidad = @cantidad WHERE id_pedido = @id_pedido AND id_ingrediente = @id_ingrediente');
    
        // Incrementa la cantidad de un ingrediente en un pedido
        this.#sumaCantidadStmt = db.prepare('UPDATE Pedidos_Contiene SET cantidad = cantidad + @cantidad WHERE id_pedido = @id_pedido AND id_ingrediente = @id_ingrediente');
    }

    /**
     * Inserta el ingrediente dado en el pedido dado en la base de datos con la cantidad dada
     * @param {int} id_ingrediente 
     * @param {int} id_pedido 
     * @param {int} cantidad 
     * @throws {ErrorInsertPedidoContiene} Un error de inserción
     */
    static #insert(id_ingrediente, id_pedido, cantidad) {
        try {
            this.#insertStmt.run({
                id_pedido: id_pedido,
                id_ingrediente: id_ingrediente,
                cantidad: cantidad
            });
        }
        catch (e) {
            if(e.code === 'SQLITE_CONSTRAINT_PRIMARYKEY')
                throw new ErrorIngredienteYaContenido(id_pedido, id_ingrediente, { cause: e });
            throw new ErrorInsertPedidoContiene(id_pedido, id_ingrediente, { cause: e });
        }
    }

    /**
     * Función para insertar ingredientes en pedidos desde fuera de la clase
     * @param {int} id_ingrediente 
     * @param {int} id_pedido 
     * @param {int} cantidad 
     * @throws {Error} Un error de inserción en la base de datos
     */
    static insertaIngredienteEnPedido(id_ingrediente, id_pedido, cantidad) {
        try {
            PedidoContiene.#insert(id_ingrediente, id_pedido, cantidad);
        }
        catch (e) {
            if(e instanceof ErrorIngredienteYaContenido){ // Si el ingrediente ya está incrementamos su cantidad
                try{
                    PedidoContiene.#incrementaCantidad(cantidad, id_ingrediente, id_pedido);
                }
                catch(e){
                    logger.error(e.cause);
                    throw Error("Error al incrementar la cantidad del ingrediente en el pedido");
                }
            }
            else{
                logger.error(e.cause);
                throw Error("Error al insertar el ingrediente en el pedido");
            }
        }
    }

    /**
     * Cambia la cantidad de un ingrediente en un pedido
     * @param {int} cantidad
     * @param {int} id_ingrediente
     * @param {int} id_pedido 
     * @throws {Error} Un error de acceso a la base de datos 
     */
    static #update(cantidad, id_ingrediente, id_pedido) {
        const result = this.#updateStmt.run({cantidad, id_ingrediente, id_pedido});
        if (result.changes === 0) throw new Error(`No se encontró el ingrediente con id ${id_ingrediente} en el pedido ${id_pedido}`);
    }

    /**
     * Incrementa la cantidad de un ingrediente en un pedido
     * @param {int} cantidad  // la cantidad a sumar a la que ya tenía el ingrediente
     * @param {int} id_ingrediente
     * @param {int} id_pedido 
     * @throws {Error} Un error de acceso a la base de datos 
     */
    static #incrementaCantidad(cantidad, id_ingrediente, id_pedido) {
        const result = this.#sumaCantidadStmt.run({cantidad, id_ingrediente, id_pedido});
        if (result.changes === 0) throw new Error(`No pudo incrementar la cantidad en ${cantidad} del ingrediente con id ${id_ingrediente} en el pedido ${id_pedido}`);
    }

    /**
     * Función para cambiar la cantidad de un ingrediente en un pedido desde fuera
     * @param {int} cantidad 
     * @param {int} id_ingrediente 
     * @param {int} id_pedido
     * @returns {boolean} true si éxito
     * @throws {Error} Un error de acceso a la base de datos 
     */
    static cambiaCantidad(cantidad, id_ingrediente, id_pedido) {
        try {
            PedidoContiene.#update(cantidad, id_ingrediente, id_pedido)
            return true;
        }
        catch (e) {
            logger.error(e.message);
            throw new Error(`Error al actualizar la cantidad del ingrediente en el pedido ${id_pedido} de la base de datos`);
        }
    }

    /**
     * Borra un ingrediente de un pedido
     * @param {int} id_ingrediente 
     * @param {int} id_pedido 
     * @throws {Error} Un error de acceso a la base de datos
     */
    static delete(id_ingrediente, id_pedido) {
        const result = this.#deleteStmt.run({
            id_ingrediente: id_ingrediente,
            id_pedido: id_pedido
        });
        if (result.changes === 0) throw new Error(`No se encontró el ingrediente con id ${id} en el pedido ${id_pedido}`);
    }

    /**
     * Borra el ingrediente dado de todos los pedidos en los que está
     * @param {int} id_ingrediente 
     */
    static deleteAllByIngrediente(id_ingrediente) {
        const result = this.#deleteAllByIngredienteStmt.run({
            id_ingrediente: id_ingrediente,
        });
    }

    /**
     * Borra todos los ingredientes contenidos en el pedido dado
     * @param {int} id_pedido 
     * @throws {Error} Un error de acceso a la base de datos o si el pedido está vacío
     */
    static deleteAllByPedido(id_pedido) {
        const result = this.#deleteAllByPedidoStmt.run({
            id_pedido,
        });
        if (result.changes === 0) throw new Error(`No se encontró el pedido ${id_pedido}`);
    }

    /**
     * Obtiene todos los ingredientes contenidos en un pedido
     * @param {int} id_pedido 
     * @returns {PedidoContiene[]} Un array de ingredientes del pedido con sus cantidades
     */
    static getIngredientesByPedido(id_pedido) {
        const arrayIngredientes = this.#getAllByPedidoStmt.all({ id_pedido });

        let ingredientesContenidos = [];

        for (const rawIngrediente of arrayIngredientes) {
            const { cantidad, nombre, unidad, id, precio } = rawIngrediente;
            const ingredienteContenido = new Ingrediente(nombre, precio, unidad, id);
            const contingencia = new PedidoContiene(ingredienteContenido, cantidad);
            ingredientesContenidos.push(contingencia);
        }

        return ingredientesContenidos;
    }

    cantidad; // Cantidad del ingrediente
    #ingrediente // Instancia del ingrediente contenido

    /**
     * 
     * @param {Ingrediente} ingrediente 
     * @param {int} cantidad 
     */
    constructor(ingrediente, cantidad) {
        this.#ingrediente = ingrediente;
        this.cantidad = cantidad;
    }

    get ingrediente() {
        return this.#ingrediente;
    }
}

export class ErrorInsertPedido extends Error {
    /**
     * 
     * @param {id} username
     * @param {ErrorOptions} [options]
     */
    constructor(username, options) {
        super(`El pedido de ${username} no pudo ser insertado en la base de datos`, options);
        this.name = 'ErrorInsertPedido';
    }
}

export class ErrorInsertPedidoContiene extends Error {
    /**
     * 
     * @param {int} id_pedido
     * @param {int} id_ingrediente 
     * @param {ErrorOptions} [options]
     */
    constructor(id_pedido, id_ingrediente, options) {
        super(`El ingrediente ${id_ingrediente} no pudo ser adjuntado al pedido ${id_pedido}`, options);
        this.name = 'ErrorInsertPedidoContiene';
    }
}

export class ErrorIngredienteYaContenido extends Error{
     /**
     * 
     * @param {int} id_pedido
     * @param {int} id_ingrediente 
     * @param {ErrorOptions} [options]
     */
    constructor(id_pedido, id_ingrediente, options) {
        super(`El ingrediente ${id_ingrediente} ya está contenido en el pedido ${id_pedido}`, options);
        this.name = 'ErrorIngredienteYaContenido';
    }
}