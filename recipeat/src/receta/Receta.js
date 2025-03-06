export class Receta {

    static #getAllStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;

    static initStatements(db) {
        if (this.#getAllStmt !== null) return;

        this.#getAllStmt = db.prepare('SELECT * FROM Recetas');
        this.#insertStmt = db.prepare('INSERT INTO Recetas (nombre, descripcion) VALUES (@nombre, @descripcion)');
        this.#updateStmt = db.prepare('UPDATE Recetas SET nombre = @nombre, descripcion = @descripcion, likes = @likes WHERE id = @id');
        this.#deleteStmt = db.prepare('DELETE FROM Recetas WHERE id = @id');
    }

    // Obtener todas las recetas
    static getAllRecetas() {
        const recetas = this.#getAllStmt.all();
        return recetas.map(({ id, nombre, descripcion, likes }) => new Receta(nombre, descripcion, likes, id));
    }

    // Insertar una nueva receta
    static insertReceta(receta) {
        try {
            const result = this.#insertStmt.run({
                nombre: receta.nombre,
                descripcion: receta.descripcion
            });
        }
        catch (e) {
            if (this.#insertStmt == null)
                console.log("insert result null");
            else
                console.log(this.#insertStmt);
            throw new ErrorInsert(receta.nombre, { cause: e });
        }

        return new Receta(receta.nombre, receta.descripcion, receta.likes, result.lastInsertRowid);
    }

    static updateReceta(receta) {
        const result = this.#updateStmt.run({
            //id: receta.id,
            nombre: receta.nombre,
            descripcion: receta.descripcion,
            likes: receta.likes
        });

        if (result.changes === 0) throw new Error(`No se encontró la receta con ID ${receta.id}`);
        return receta;
    }

    // Eliminar una receta por ID
    static deleteReceta(id) {
        const result = this.#deleteStmt.run({ id });
        if (result.changes === 0) throw new Error(`No se encontró la receta con ID ${id}`);
    }

    #id;
    descripcion;
    nombre;
    likes;

    constructor(nombre, descripcion, likes, id = null) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.likes = likes;
        this.#id = id;
    }

    get id() {
        return this.#id;
    }
}

export class ErrorInsert extends Error {
    /**
     * 
     * @param {string} receta 
     * @param {ErrorOptions} [options]
     */
    constructor(receta, options) {
        super(`No se ha podido crear la receta ${receta}`, options);
        this.name = 'ErrorInsert';
    }
}