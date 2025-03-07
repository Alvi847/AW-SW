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
        this.#insertStmt = db.prepare('INSERT INTO Recetas (nombre, descripcion, user) VALUES (@nombre, @descripcion, @user)');
        this.#updateStmt = db.prepare('UPDATE Recetas SET nombre = @nombre, descripcion = @descripcion, likes = @likes WHERE id = @id');
        this.#deleteStmt = db.prepare('DELETE FROM Recetas WHERE id = @id');
        this.#addLikeStmt = db.prepare('UPDATE Recetas SET likes = likes + 1 WHERE id = @id;');
        this.#removeLikeStmt = db.prepare('UPDATE Recetas SET likes = likes - 1 WHERE id = @id;');
        this.#getByIdStmt = db.prepare('SELECT * FROM Recetas WHERE id = @id');
    }

    // Obtener una receta por ID
    static getRecetaById(id, user) {
        const receta = this.#getByIdStmt.get({ id });
        if (receta === undefined) 
            throw new Error(`No se encontró la receta con ID ${id}`);
        else{ 
            let user_liked = Like.usuarioYaHaDadoLike(id, user);
            return new Receta(receta.nombre, receta.descripcion, receta.likes, receta.id, receta.user, user_liked);
        }
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
                descripcion: receta.descripcion,
                user: receta.user
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

    // Añade un like a la receta
    static addLikeReceta(id, user){
        Like.addLike(id, user);

        this.#addLikeStmt.run({
            id
        });
    }

    // Mira si el usuario ya ha dado like o no a la receta para decidir si se ha de eliminar o de añadir el like
    static processLike(id, user){
        if(Like.usuarioYaHaDadoLike(id, user))
            this.removeLikeReceta(id, user);
        else
            this.addLikeReceta(id, user);
    }

    // Elimina un like a la receta. En desuso hasta que podamos llevar la cuenta de quién da like a qué recetas
    static removeLikeReceta(id, user){
        Like.retiraLike(id, user);

        this.#removeLikeStmt.run({
            id
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

    #id; // El id de la receta
    descripcion; // La descripción de la receta
    nombre; // El nombre de la receta
    likes;  // El numero de likes que tiene la receta
    user; // El usuario que crea la receta
    user_liked; // El usuario (el que hace la petición) ha dado like

    constructor(nombre, descripcion, likes = null, id = null, user, user_liked = false) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.likes = likes;
        this.#id = id;
        this.user = user
        this.user_liked = user_liked;
    }

    get id() {
        return this.#id;
    }
}

export class Like {

    static #getLikeStmt = null;
    static #insertLikeStmt = null;
    static #removeLikeStmt = null
    static #removeAllStmt = null;

    static initStatements(db) {
        if (this.#getLikeStmt !== null) return;

        this.#getLikeStmt = db.prepare('SELECT * FROM Likes WHERE id_receta = @id_receta AND user = @username');
        this.#insertLikeStmt = db.prepare('INSERT INTO Likes (id_receta, user) VALUES (@id_receta, @username)');
        this.#removeLikeStmt = db.prepare('DELETE FROM Likes WHERE id_receta = @id_receta AND user = @username;');
        this.#removeAllStmt = db.prepare('DELETE FROM Likes WHERE id_receta = @id_receta');
    }

    static addLike(id_receta, username){
        this.#insertLikeStmt.run({
            id_receta,
            username
        });
    }
    
    static usuarioYaHaDadoLike(id_receta, username){
        const result = this.#getLikeStmt.get({
            id_receta,
            username
        });

        if(result)
            return true;
        else
            return false;
    }

    static retiraLike(id_receta, username) {
        this.#removeLikeStmt.run({
            id_receta,
            username
        });
    }

    static retiraTodosLikes(id_receta) {
        this.#removeAllStmt.run({
            id_receta,
        });
    }
}
