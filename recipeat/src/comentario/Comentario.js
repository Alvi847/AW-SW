export class Comentario {
    static #insertStmt = null;
    static #getAllStmt = null;
    static #getByIdStmt = null;
    static #deleteStmt = null;
    static #addValoracionStmt = null;
    static #removeValoracionStmt = null;

    static initStatements(db) {
        if (this.#getAllStmt !== null) return;

        this.#insertStmt = db.prepare('INSERT INTO Comentarios (valoracion, descripcion, id_receta, user) VALUES (@valoracion, @descripcion, @id_receta, @user)');

        //*seleccionar la receta por id (unica)
        this.#getByIdStmt = db.prepare('SELECT * FROM Comentarios WHERE id = @id');

        //*seleccionar todas las recetas de la tabla
        this.#getAllStmt = db.prepare('SELECT * FROM Comentarios WHERE id_receta = @id_receta');

        //*eliminar recetas del usuario
        this.#deleteStmt = db.prepare('DELETE FROM Comentarios WHERE id = @id');

        //*actualizar likes de la receta
        this.#addValoracionStmt = db.prepare('UPDATE Comentarios SET valoracion = valoracion + 1 WHERE id = @id');

        //*eliminar like del usuario sobre una receta 
        this.#removeValoracionStmt = db.prepare('UPDATE Comentarios SET valoracion = valoracion - 1 WHERE id = @id');
    }

    //TODO: Escribir las funciones

    static insertComentario(comentario) {

        try {
            if (comentario.valoracion)
                this.#insertStmt.run({
                    valoracion: comentario.valoracion,
                    descripcion: comentario.descripcion,
                    id_receta: comentario.id_receta,
                    user: comentario.user
                });
            else
                this.#insertStmt.run({
                    valoracion: 0,
                    descripcion: comentario.descripcion,
                    id_receta: comentario.id_receta,
                    user: comentario.user
                });
        }
        catch (e) {
            console.log("Error al crear insertar comentario");
            if (this.#insertStmt == null)
                console.log("insert result null");
            else
                console.log(this.#insertStmt);
            throw new ErrorInsertComentario(comentario.id, { cause: e });
        }
    }

    // Añade un like al comentario
    static addLikeComentario(id, user) {
        Valoracion.addValoracion(id, user);

        this.#addValoracionStmt.run({
            id
        });
    }

    // Mira si el usuario ya ha dado like o no al comentario para decidir si se ha de eliminar o de añadir el like
    static processLike(id, user) {
        if (Valoracion.usuarioYaHaValorado(id, user))
            this.removeLikeComentario(id, user);
        else
            this.addLikeComentario(id, user);
    }

    // Elimina un like al comentario.
    static removeLikeComentario(id, user) {
        Valoracion.retiraValoracion(id, user);

        this.#removeValoracionStmt.run({
            id
        });
    }

    static deleteComentario(id) {
        Valoracion.retiraTodosValoraciones(id);
        const result = this.#deleteStmt.run({ id });
        if (result.changes === 0) throw new Error(`No se encontró el comentario con ID ${id}`);
    }

    static deleteAllComentarios(id_receta){
        const comentarios = this.getAllComentarios(id_receta, null);

        comentarios.forEach(comentario => {
            this.deleteComentario(comentario.id);
        });
    }

    // Obtener una comentario por ID
    static getComentarioById(id, user) {
        const comentario = this.#getByIdStmt.get({ id });
        if (comentario === undefined)
            throw new Error(`No se encontró el comentario con ID ${id}`);
        else {
            let user_liked = false;
            if (user)
                user_liked = Valoracion.usuarioYaHaValorado(id, user); // Como en las recetas, se guarda si el usuario ha valorado el comentario (Como son likes, se guarda un bool. Si fueran estrellas se guardaría el valor)

                return new Comentario(comentario.user, comentario.id_receta, comentario.valoracion, comentario.descripcion, comentario.id, user_liked);

        }
    }

    // Obtener todos los comentarios
    static getAllComentarios(id_receta, user) {

        const comentarios = this.#getAllStmt.all({ id_receta });

        comentarios.forEach(comentario => {
            if (user)
                comentario.user_liked = Valoracion.usuarioYaHaValorado(comentario.id, user); // En este caso, hay que devolver si el usuario ha dado like porque, a diferencia de las recetas, 
                                                                                  //a los comentarios se le puede dar like desede la misma lista

        });
        
        return comentarios;
    }

    #id;
    user;
    id_receta;
    valoracion; // Valoraciones de otros usuarios sobre el comentario
    descripcion;
    user_liked; // Indica si ha valorado el usuario el comentario (en caso de ser un comentario ya existente)

    constructor(user, id_receta, valoracion = null, descripcion, id = null, user_liked = false) {
        this.user = user;
        this.id_receta = id_receta;
        this.valoracion = valoracion;
        this.descripcion = descripcion;
        this.#id = id;
        this.user_liked = user_liked;
    }

    get id() {
        return this.#id;
    }
}

export class Valoracion {
    static #getValoracionStmt = null;
    static #insertValoracionStmt = null;
    static #removeValoracionStmt = null
    static #removeAllStmt = null;

    static initStatements(db) {
        if (this.#getValoracionStmt !== null) return;

        this.#getValoracionStmt = db.prepare('SELECT * FROM Valoraciones_Comentarios WHERE id_comentario = @id_comentario AND user = @username');
        this.#insertValoracionStmt = db.prepare('INSERT INTO Valoraciones_Comentarios (id_comentario, user) VALUES (@id_comentario, @username)');
        this.#removeValoracionStmt = db.prepare('DELETE FROM Valoraciones_Comentarios WHERE id_comentario = @id_comentario AND user = @username;');
        this.#removeAllStmt = db.prepare('DELETE FROM Valoraciones_Comentarios WHERE id_comentario = @id_comentario');
    }

    static addValoracion(id_comentario, username) {
        try {
            this.#insertValoracionStmt.run({
                id_comentario,
                username
            });
        }
        catch (e) {
            console.log("Error al crear Valoracion");
            if (this.#insertValoracionStmt == null)
                console.log("insert result null");
            else
                console.log(this.#insertValoracionStmt);
            throw new ErrorInsertValoracion(id_comentario, { cause: e });
        }
    }

    static usuarioYaHaValorado(id_comentario, username) {
        const result = this.#getValoracionStmt.get({
            id_comentario,
            username
        });

        if (result)
            return true;
        else
            return false;
    }

    static retiraValoracion(id_comentario, username) {
        this.#removeValoracionStmt.run({
            id_comentario,
            username
        });
    }

    static retiraTodosValoraciones(id_comentario) {
        this.#removeAllStmt.run({
            id_comentario,
        });
    }
}


export class ErrorInsertComentario extends Error {
    /**
     * 
     * @param {int} id 
     * @param {ErrorOptions} [options]
     */
    constructor(id, options) {
        super(`El comentario ${id} no pudo ser insertado en la base de datos`, options);
        this.name = 'ErrorInsertComentario';
    }
}

export class ErrorInsertValoracion extends Error {
    /**
     * 
     * @param {int} id 
     * @param {ErrorOptions} [options]
     */
    constructor(id, options) {
        super(`No se pudo añadir una valoracion al comentario ${id}`, options);
        this.name = 'ErrorInsertValoracion';
    }
}