import { logger } from "../logger.js";

/**
 * Clase de los ingredientes de las recetas, tambien se utiliza en los pedidos de ingredientes
 */
export class Ingrediente {
    static #insertStmt = null;
    static #getAllStmt = null;
    static #getByNameStmt = null;
    static #deleteStmt = null;
    static #changePrecioStmt = null;

    static initStatements(db) {
        if (this.#getAllStmt !== null) return;

        //*Crear un nuevo ingrediente
        this.#insertStmt = db.prepare('INSERT INTO Ingredientes (nombre, precio, unidad) VALUES (@nombre, @precio, @unidad)');

        //*Seleccionar el ingrediente por nombre (unico)
        this.#getByNameStmt = db.prepare('SELECT * FROM Ingredientes WHERE nombre = @nombre');

        //*Seleccionar todos los ingredientes de la tabla
        this.#getAllStmt = db.prepare('SELECT * FROM Ingredientes');

        //*Eliminar ingredientes
        this.#deleteStmt = db.prepare('DELETE FROM Ingredientes WHERE id = @id');

        //*Cambiar el precio del ingrediente
        this.#changePrecioStmt = db.prepare('UPDATE Ingredientes SET precio = @precio WHERE nombre = @nombre');
    }

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
                console.log("insert result null");
            const nombre = ingrediente.nombre;
            throw new ErrorInsertIngrediente(nombre, { cause: e });
        }
    }

    static insertIngrediente(ingrediente){
        try{
            Ingrediente.#insert(ingrediente);
        }
        catch(e){
            logger.error(e.message);
            throw new Error("Error al insertar ingrediente en la base de datos");
        }
    }

    static cambiaPrecio(ingrediente) {
        const result = this.#changePrecioStmt.run({ precio: ingrediente.precio, nombre: ingrediente.nombre });
        if (result.changes === 0) throw new Error(`No se encontró el ingrediente con nombre ${ingrediente.nombre}`);
    }

    static deleteIngrediente(id) {
        Contiene.deleteAllByIngrediente(id);
        const result = this.#deleteStmt.run({ id });
        if (result.changes === 0) throw new Error(`No se encontró el ingrediente con id ${nombre}`);
    }

    // Obtener un ingrediente por nombre
    static getIngredienteByName(nombre) {
        const ingrediente = this.#getByNameStmt.get({ nombre });
        if (ingrediente === undefined)
            throw new Error(`No se encontró el ingrediente con nombre ${nombre}`);
        else
            return new Ingrediente(ingrediente.nombre, ingrediente.precio, ingrediente.unidad);
    }

    // Obtener todos los ingredientes
    static getAllIngredientes() {

        const arrayIngredientes = this.#getAllStmt.all();

        let ingredientes = [];

        for (const rawIngrediente of arrayIngredientes) {
            const { id, nombre, precio, unidad } = rawIngrediente;
            const ingrediente = new Ingrediente( nombre, precio, unidad, id);
            ingredientes.push(ingrediente);
        }

        return ingredientes;
    }

    #nombre; // Nombre del ingrediente
    precio; // Precio del ingrediente
    unidad; // Cadena que indica en qué unidad se mide el ingrediente, DE MOMENTO LO DEJO EN GRAMOS POR DEFECTO
    #id; // Id del ingrediente

    constructor(nombre, precio, unidad = 'g', id = null) {
        this.#nombre = nombre;
        this.precio = precio;
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

/**
 * Clase que representa la relación de contención entre una receta y un ingrediente
 */
export class Contiene {
    static #insertStmt = null;
    static #deleteStmt = null;
    static #deleteAllByIngredienteStmt = null;
    static #deleteAllByRecetaStmt = null;
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
        this.#getAllByRecetaStmt = db.prepare('SELECT i.nombre, i.unidad, c.cantidad FROM Ingredientes i JOIN Contiene c ON i.id = c.id_ingrediente WHERE c.id_receta = @id_receta');
    }

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
                console.log("insert result null");
            throw new ErrorInsertContiene(id_ingrediente, id_receta, { cause: e });
        }
    }

    static insertContiene(id_ingrediente, id_receta, cantidad){
        try{
            Contiene.#insert(id_ingrediente, id_receta, cantidad);
        }
        catch(e){
            logger.error(e.message);
            throw new Error("Error al insertar en la tabla Contiene");
        }
    }

    static delete(id_ingrediente, id_receta) {
        const result = this.#deleteStmt.run({
            id_ingrediente: id_ingrediente,
            id_receta: id_receta
        });
        if (result.changes === 0) throw new Error(`No se encontró el ingrediente con nombre ${nombre} en la receta ${id_receta}`);
    }

    static deleteAllByIngrediente(id_ingrediente) {
        const result = this.#deleteAllByIngredienteStmt.run({
            id_ingrediente: id_ingrediente,
        });
        if (result.changes === 0) throw new Error(`No se encontró el ingrediente con nombre ${nombre}`);
    }

    static deleteAllByReceta(id_receta) {
        const result = this.#deleteAllByRecetaStmt.run({
            id_receta,
        });
    }

    static getIngredientesByReceta(id_receta) {
        const arrayIngredientes = this.#getAllByRecetaStmt.all({ id_receta });

        let ingredientesContenidos = [];

        for (const rawIngrediente of arrayIngredientes) {
            const { cantidad, nombre, unidad } = rawIngrediente;
            const contingencia = new Contiene( nombre, unidad, cantidad);
            ingredientesContenidos.push(contingencia);
        }

        return ingredientesContenidos;
    }

    cantidad; // Cantidad del ingrediente contenido
    #nombre; // Nombre del ingrediente contenido
    unidad; // Unidad del ingrediente contenido

    constructor(nombre, unidad, cantidad) {
        this.#nombre = nombre;
        this.cantidad = cantidad;
        this.unidad = unidad;
    }

    get nombre() {
        return this.#nombre;
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