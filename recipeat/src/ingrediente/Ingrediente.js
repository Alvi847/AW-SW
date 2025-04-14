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
        this.#deleteStmt = db.prepare('DELETE FROM Ingredientes WHERE nombre = @nombre');

        //*Cambiar el precio del ingrediente
        this.#changePrecioStmt = db.prepare('UPDATE Ingredientes SET precio = @precio WHERE nombre = @nombre');
    }

    static insertIngrediente(ingrediente) {
        try {
            this.#insertStmt.run({
                nombre: ingrediente.nombre,
                precio: ingrediente.precio,
                unidad: ingrediente.unidad
            });
        }
        catch (e) {
            console.log("Error al insertar ingrediente");
            if (this.#insertStmt == null)
                console.log("insert result null");
            throw new ErrorInsertIngrediente(ingrediente.nombre, { cause: e });
        }
    }

    static cambiaPrecio(ingrediente) {
        const result = this.#changePrecioStmt.run({ precio: ingrediente.precio, nombre: ingrediente.nombre });
        if (result.changes === 0) throw new Error(`No se encontró el ingrediente con nombre ${ingrediente.nombre}`);
    }

    static deleteIngrediente(nombre) {
        const result = this.#deleteStmt.run({ nombre });
        if (result.changes === 0) throw new Error(`No se encontró el ingrediente con nombre ${nombre}`);
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

        const ingredientes = this.#getAllStmt.all();

        return ingredientes;
    }

    #nombre; // Nombre del ingrediente
    precio; // Precio del ingrediente
    unidad; // Cadena que indica en qué unidad se mide el ingrediente, DE MOMENTO LO DEJO EN GRAMOS POR DEFECTO

    constructor(nombre, precio, unidad = 'g') {
        this.nombre = nombre;
        this.precio = precio;
        this.unidad = unidad;
    }

    get nombre() {
        return this.#nombre;
    }
}

/**
 * Clase que representa la relación de contención entre una receta y un ingrediente
 */
export class Contiene {
    static #insertStmt = null;
    static #deleteStmt = null;

    static initStatements(db) {
        if (this.#deleteStmt !== null) return;

        // Añadir un ingrediente a una receta
        this.#insertStmt = db.prepare('INSERT INTO Contiene (id_receta, nombre_ingrediente, cantidad) VALUES (@id_receta, @nombre_ingrediente, @cantidad)');

        // Borrar un ingrediente de una receta
        this.#deleteStmt = db.prepare('DELETE FROM Contiene WHERE id_receta = @id_receta AND nombre_ingrediente = @nombre_ingrediente');
    }

    static insert(n_ingrediente, id_receta, cantidad) {
        try {
            this.#insertStmt.run({
                id_receta: id_receta,
                nombre_ingrediente: n_ingrediente,
                cantidad: cantidad
            });
        }
        catch (e) {
            console.log("Error al insertar en la tabla Contiene");
            if (this.#insertStmt == null)
                console.log("insert result null");
            throw new ErrorInsertContiene(n_ingrediente, id_receta, { cause: e });
        }
    }

    static delete(n_ingrediente, id_receta) {
        const result = this.#deleteStmt.run({ 
            nombre_ingrediente: n_ingrediente,
            id_receta: id_receta 
            });
        if (result.changes === 0) throw new Error(`No se encontró el ingrediente con nombre ${nombre} en la receta ${id_receta}`);
    }

    cantidad; // Cantidad del ingrediente

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
     * @param {string} n_ingrediente
     * @param {int} id_receta 
     * @param {ErrorOptions} [options]
     */
    constructor(n_ingrediente, id_receta, options) {
        super(`El ingrediente ${n_ingrediente} no pudo ser adjuntado a la receta ${id_receta}`, options);
        this.name = 'ErrorInsertContiene';
    }
}