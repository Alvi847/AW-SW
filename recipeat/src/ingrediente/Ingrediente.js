import { logger } from "../logger.js";

/**
 * Clase de los ingredientes de las recetas, tambien se utiliza en los pedidos de ingredientes
 */
export class Ingrediente {
    static #insertStmt = null;
    static #getAllStmt = null;
    static #getByNameStmt = null;
    static #getByIdStmt = null;
    static #deleteStmt = null;
    static #updateStmt = null;

    static initStatements(db) {
        if (this.#getAllStmt !== null) return;

        //*Crear un nuevo ingrediente
        this.#insertStmt = db.prepare('INSERT INTO Ingredientes (nombre, precio, unidad) VALUES (@nombre, @precio, @unidad)');

        //*Seleccionar un ingrediente por nombre (puede haber varios con el mismo nombre)
        this.#getByNameStmt = db.prepare('SELECT * FROM Ingredientes WHERE nombre = @nombre');

        //*Seleccionar el ingrediente por id
        this.#getByIdStmt = db.prepare('SELECT * FROM Ingredientes WHERE id = @id');

        //*Seleccionar todos los ingredientes de la tabla
        this.#getAllStmt = db.prepare('SELECT * FROM Ingredientes');

        //*Eliminar ingredientes
        this.#deleteStmt = db.prepare('DELETE FROM Ingredientes WHERE id = @id');

        //*Cambiar el precio y/o unidad del ingrediente
        this.#updateStmt = db.prepare('UPDATE Ingredientes SET nombre = @nombre, precio = @precio, unidad = @unidad WHERE id = @id');
    }

    /**
     * Inserta un ingrediente en la base de datos
     * @param {Ingrediente} ingrediente Una instancia del ingrediente a insertar
     * @throws {ErrorInsertIngrediente} Un error de inserción
     */
    static #insert(ingrediente) {
        try {
            this.#insertStmt.run({
                nombre: ingrediente.nombre,
                precio: ingrediente.precio,
                unidad: ingrediente.unidad
            });
        }
        catch (e) {
            if (this.#insertStmt == null)
                logger.error("insert result null");
            const nombre = ingrediente.nombre;
            throw new ErrorInsertIngrediente(nombre, { cause: e });
        }
    }

    /**
     * Inserta un ingrediente en la base de datos desde fuera
     * @param {Ingrediente} ingrediente Una instancia del ingrediente a insertar
     * @throws {Error} Un error de inserción
     */
    static insertIngrediente(ingrediente) {
        try {
            Ingrediente.#insert(ingrediente);
        }
        catch (e) {
            logger.error(e.message);
            throw new Error("Error al insertar el ingrediente en la base de datos");
        }
    }

    /**
     * Actualiza el ingrediente con id dado en la base de datos con los datos nuevos
     * @param {int} precio 
     * @param {int} unidad 
     * @param {int} id 
     * @param {string} nombre 
     * @throws {Error} Un error si no existe el ingrediente
     */
    static #update(precio, unidad, id, nombre) {
        const result = this.#updateStmt.run({ nombre, precio, unidad, id });
        if (result.changes === 0) throw new Error(`No se encontró el ingrediente con id ${id}`);
    }

    /**
     * Función para actualizar un ingrediente en la base de datos desde fuera
     * @param {Ingrediente} ingrediente El objeto del ingrediente ya existente en la base de datos con sus nuevos datos 
     * @returns {boolean} true si éxito
     * @throws {Error} Un error de acceso a la base de datos
     */
    static cambiaIngrediente(ingrediente) {
        try {
            Ingrediente.#update(ingrediente.precio, ingrediente.unidad, ingrediente.id, ingrediente.nombre)
            return true;
        }
        catch (e) {
            logger.error(e.message);
            throw new Error("Error al actualizar el ingrediente en la base de datos");
        }

    }

    /**
     * Borra el ingrediente con el id dado
     * @param {int} id 
     * @throws {Error} Un error de acceso a la base de datos
     */
    static deleteIngrediente(id) {
        const result = this.#deleteStmt.run({ id });
        if (result.changes === 0) throw new Error(`No se encontró el ingrediente con id ${id}`);
    }

    /**
     * Obtiene todos los ingredientes de la base de datos con el nombre dado PUEDE HABER VARIOS
     * @param {string} nombre 
     * @returns {Ingrediente[]} Una lista con los ingredientes, puede ser vacía
     */
    static getIngredientesByName(nombre) {
        const arrayIngredientes = this.#getByNameStmt.all({ nombre });


        let ingredientes = [];

        for (const rawIngrediente of arrayIngredientes) {
            const { id, nombre, precio, unidad } = rawIngrediente;
            const ingrediente = new Ingrediente(nombre, precio, unidad, id);
            ingredientes.push(ingrediente);
        }

        return ingredientes;

    }

    /**
     * Obtiene un ingrediente por id
     * @param {int} id 
     * @returns El ingrediente con ese id
     * @throws {Error} Un error si no se encuentra ese ingrediente
     */
    static getIngredienteById(id) {
        const ingrediente = this.#getByIdStmt.get({ id });
        if (ingrediente === undefined)
            throw new Error(`No se encontró el ingrediente con id ${id}`);
        else
            return new Ingrediente(ingrediente.nombre, ingrediente.precio, ingrediente.unidad, ingrediente.id);
    }

    /**
     * Obtiene todos los ingredientes de la base de datos
     * @returns {Ingrediente[]} Una lista con todos los ingredientes, puede ser vacía
     */
    static getAllIngredientes() {

        const arrayIngredientes = this.#getAllStmt.all();

        let ingredientes = [];

        for (const rawIngrediente of arrayIngredientes) {
            const { id, nombre, precio, unidad } = rawIngrediente;
            const ingrediente = new Ingrediente(nombre, precio, unidad, id);
            ingredientes.push(ingrediente);
        }

        return ingredientes;
    }

    nombre; // Nombre del ingrediente
    precio; // Precio del ingrediente
    unidad; // Cadena que indica en qué unidad se mide el ingrediente, DE MOMENTO LO DEJO EN GRAMOS POR DEFECTO
    #id; // Id del ingrediente

    constructor(nombre, precio, unidad = 'g', id = null) {
        this.nombre = nombre;
        this.precio = precio;
        this.unidad = unidad;
        this.#id = id;
    }

    get id() {
        return this.#id;
    }
}

/**
 * Clase que representa la relación de contención entre una receta y un ingrediente
 */
export class Contiene {
    static #insertStmt = null;
    static #deleteStmt = null;
    static #deleteAllByIngredienteStmt = null;
    static #deleteAllByRecetaStmt = null;
    static #updateStmt = null;
    static #getAllByRecetaStmt = null;

    static initStatements(db) {
        if (this.#getAllByRecetaStmt !== null) return;

        // Añadir un ingrediente a una receta
        this.#insertStmt = db.prepare('INSERT INTO Contiene (id_receta, id_ingrediente, cantidad) VALUES (@id_receta, @id_ingrediente, @cantidad)');

        // Borrar un ingrediente de una receta
        this.#deleteStmt = db.prepare('DELETE FROM Contiene WHERE id_receta = @id_receta AND id_ingrediente = @id_ingrediente');

        // Borrar todas las recetas a las que pertenece un ingrediente
        this.#deleteAllByIngredienteStmt = db.prepare('DELETE FROM Contiene WHERE id_ingrediente = @id_ingrediente');

        // Borrar todos los ingredientes que pertenecen a la receta
        this.#deleteAllByRecetaStmt = db.prepare('DELETE FROM Contiene WHERE id_receta = @id_receta');

        // Obtiene los ingredientes de una receta
        this.#getAllByRecetaStmt = db.prepare('SELECT i.nombre, i.id, i.unidad, c.cantidad FROM Ingredientes i JOIN Contiene c ON i.id = c.id_ingrediente WHERE c.id_receta = @id_receta');

        //Cambia la cantidad de un ingrediente en una receta
        this.#updateStmt = db.prepare('UPDATE Contiene SET cantidad = @cantidad WHERE id_receta = @id_receta AND id_ingrediente = @id_ingrediente');
    }

    /**
     * Inserta un ingrediente en una receta con los datos dados
     * @param {int} id_ingrediente 
     * @param {int} id_receta 
     * @param {int} cantidad 
     * @throws {ErrorInsertContiene} Un error de inserción
     */
    static #insert(id_ingrediente, id_receta, cantidad) {
        try {
            this.#insertStmt.run({
                id_receta: id_receta,
                id_ingrediente: id_ingrediente,
                cantidad: cantidad
            });
        }
        catch (e) {
            if (this.#insertStmt == null)
                logger.error("insert result null");
            throw new ErrorInsertContiene(id_ingrediente, id_receta, { cause: e });
        }
    }

    /**
     * Inserta un ingrediente en una receta con los datos dados desde fuera
     * @param {int} id_ingrediente 
     * @param {int} id_receta 
     * @param {int} cantidad 
     * @throws {Error} Un error de inserción
     */
    static insertContiene(id_ingrediente, id_receta, cantidad) {
        try {
            Contiene.#insert(id_ingrediente, id_receta, cantidad);
        }
        catch (e) {
            logger.error(e.cause);
            throw new Error("Error al insertar en la tabla Contiene");
        }
    }

    /**
     * Cambia la cantidad de un ingrediente en una receta
     * @param {int} cantidad
     * @param {int} id_ingrediente
     * @param {int} id_receta 
     * @throws {Error} Un error de acceso a la base de datos 
     */
    static #update(cantidad, id_ingrediente, id_receta) {
        const result = this.#updateStmt.run({ cantidad, id_ingrediente, id_receta });
        if (result.changes === 0) throw new Error(`No se encontró el ingrediente con id ${id_ingrediente} en la receta ${id_receta}`);
    }

    /**
     * Función para cambiar la cantidad de un ingrediente en una receta desde fuera
     * @param {int} cantidad 
     * @param {int} id_ingrediente 
     * @param {int} id_receta
     * @returns {boolean} true si éxito
     * @throws {Error} Un error de acceso a la base de datos 
     */
    static cambiaCantidad(cantidad, id_ingrediente, id_receta) {
        try {
            Contiene.#update(cantidad, id_ingrediente, id_receta)
            return true;
        }
        catch (e) {
            logger.error(e.message);
            throw new Error(`Error al actualizar la cantidad del ingrediente en la receta ${id_receta} de la base de datos`);
        }
    }

    /**
     * Elimina un ingrediente de una receta
     * @param {int} id_ingrediente 
     * @param {int} id_receta
     * @throws {Error} Un error si el ingrediente no está en la receta dada 
     */
    static delete(id_ingrediente, id_receta) {
        const result = this.#deleteStmt.run({
            id_ingrediente: id_ingrediente,
            id_receta: id_receta
        });
        if (result.changes === 0) throw new Error(`No se encontró el ingrediente con id ${id_ingrediente} en la receta ${id_receta}`);
    }

    /**
     * Elimina un ingrediente de todas las recetas a las que pertenece
     * @param {int} id_ingrediente 
     */
    static deleteAllByIngrediente(id_ingrediente) {
        const result = this.#deleteAllByIngredienteStmt.run({
            id_ingrediente: id_ingrediente,
        });
    }

    /**
     * Elimina todos los ingredientes de una receta dada
     * @param {int} id_receta 
     */
    static deleteAllByReceta(id_receta) {
        const result = this.#deleteAllByRecetaStmt.run({
            id_receta,
        });
    }

    /**
     * Obtiene todos los ingredientes contenidos en una receta
     * @param {int} id_receta
     * @returns {Contiene[]} Un array de ingredientes de la receta con sus cantidades
     */
    static getIngredientesByReceta(id_receta) {
        const arrayIngredientes = this.#getAllByRecetaStmt.all({ id_receta });

        let ingredientesContenidos = [];

        for (const rawIngrediente of arrayIngredientes) {
            const { cantidad, nombre, unidad, id } = rawIngrediente;
            const contingencia = new Contiene(nombre, unidad, cantidad, id);
            ingredientesContenidos.push(contingencia);
        }

        return ingredientesContenidos;
    }

    cantidad; // Cantidad del ingrediente contenido
    #nombre; // Nombre del ingrediente contenido
    unidad; // Unidad del ingrediente contenido
    #id // Id del ingrediente contenido

    /**
     * 
     * @param {string} nombre 
     * @param {int} unidad 
     * @param {cantidad} cantidad 
     * @param {int} id 
     */
    constructor(nombre, unidad, cantidad, id) {
        this.#nombre = nombre;
        this.cantidad = cantidad;
        this.unidad = unidad;
        this.#id = id;
    }

    get nombre() {
        return this.#nombre;
    }

    get id() {
        return this.#id;
    }

}

export class ErrorInsertIngrediente extends Error {
    /**
     * 
     * @param {string} nombre 
     * @param {ErrorOptions} [options]
     */
    constructor(nombre, options) {
        super(`El ingrediente ${nombre} no pudo ser insertado en la base de datos`, options);
        this.name = 'ErrorInsertIngrediente';
    }
}

export class ErrorInsertContiene extends Error {
    /**
     * 
     * @param {string} id_ingrediente
     * @param {int} id_receta 
     * @param {ErrorOptions} [options]
     */
    constructor(id_ingrediente, id_receta, options) {
        super(`El ingrediente ${id_ingrediente} no pudo ser adjuntado a la receta ${id_receta}`, options);
        this.name = 'ErrorInsertContiene';
    }
}