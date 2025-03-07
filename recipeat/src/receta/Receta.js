export class Receta {

    static #getAllStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;
    static #addLikeStmt = null;
    static #removeLikeStmt = null;
    static #getByIdStmt = null;

    static initStatements(db) {
        if (this.#getAllStmt !== null) return;

        this.#getAllStmt = db.prepare('SELECT * FROM Recetas');
        this.#insertStmt = db.prepare('INSERT INTO Recetas (nombre, descripcion) VALUES (@nombre, @descripcion)');
        this.#updateStmt = db.prepare('UPDATE Recetas SET nombre = @nombre, descripcion = @descripcion, likes = @likes WHERE id = @id');
        this.#deleteStmt = db.prepare('DELETE FROM Recetas WHERE id = @id');
        this.#addLikeStmt = db.prepare('UPDATE Recetas SET likes = likes + 1 WHERE id = @id;');
        this.#removeLikeStmt = db.prepare('UPDATE Recetas SET likes = likes - 1 WHERE id = @id;');
        this.#getByIdStmt = db.prepare('SELECT * FROM Recetas WHERE id = @id');
    }

    // Obtener una receta por ID
    static getRecetaById(id) {
        const receta = this.#getAllStmt.get({ id });
        if (receta === undefined) throw new Error(`No se encontró la receta con ID ${id}`);
        return new Receta(receta.nombre, receta.descripcion, receta.likes, receta.id);
    }

    // Obtener todas las recetas
    static getAllRecetas() {
       
        const recetas = this.#getAllStmt.all();
        //return recetas.map(({ id, nombre, descripcion, likes }) => new Receta(nombre, descripcion, likes, id));
        return recetas;
    }

    // Insertar una nueva receta
    static insertReceta(receta) {
        let result;
        try {
            result = this.#insertStmt.run({
                nombre: receta.nombre,
                descripcion: receta.descripcion
            });
        }
        catch (e) {
            console.log("Error al crear la receta");
            if (this.#insertStmt == null)
                console.log("insert result null");
            else
                console.log(this.#insertStmt);
            throw new ErrorInsert(receta.nombre, { cause: e });
        }

        return new Receta(receta.nombre, receta.descripcion, receta.likes, result.lastInsertRowid);
    }

    //Añade un like a la receta
    static addLikeReceta(receta){
        this.#addLikeStmt.run({
            id: receta.id
        });
    }

    //Elimina un like a la receta
    static removeLikeReceta(receta){
        this.#removeLikeStmt.run({
            id: receta.id
        });
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

    constructor(nombre, descripcion, likes = null, id = null) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.likes = likes;
        this.#id = id;
    }

    get id() {
        return this.#id;
    }
}

/*export class CreadaPor {
    static #creadaPorStmt = null;
    static #getAllStmt = null;
    static #getIntervalStmt = null;

    static initStatements(db) {
        if (this.#getAllStmt !== null) return;

        this.#getAllStmt = db.prepare('SELECT * FROM Recetas');
        this.#getIntervalStmt = db.prepare('SELECT * FROM Recetas LIMIT @limite OFFSET @offset');
        this.#creadaPorStmt = db.prepare('INSERT INTO CreadaPor (id_receta, user) VALUES (@id_receta, @id_usuario)');
    }

    static relacionaConUsuario(id_receta, id_usuario){
        let result;
        try {
            result = this.#creadaPorStmt.run({
                id_receta: id_receta,
                id_usuario: id_usuario
            });
        }
        catch (e) {
            console.log("ERROR al relacionar la receta y el usuario");
            if (this.#creadaPorStmt == null)
                console.log("Error al hacer link con el usuario");
            else
                console.log(this.#creadaPorStmt);
            throw new ErrorInsert(id_receta, { cause: e });
        }
    }
}

export class ErrorInsert extends Error {
    /**
     * 
     * @param {string} receta 
     * @param {ErrorOptions} [options]
     */
   /* constructor(receta, options) {
        super(`No se ha podido crear la receta ${receta}`, options);
        this.name = 'ErrorInsert';
    }
}*/