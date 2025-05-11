import { Comentario } from "../comentario/Comentario.js";
import { Contiene } from "../ingrediente/Ingrediente.js"

export class Receta {
    static #getAllStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #deleteStmt = null;
    static #addLikeStmt = null;
    static #removeLikeStmt = null;
    static #getByIdStmt = null;
    static #getFavoritosByUserStmt = null;
    static #getRecetasByUserStmt = null;

    static initStatements(db) {
        if (this.#getAllStmt !== null) return;

        //*seleccionar todas las recetas de la tabla
        this.#getAllStmt = db.prepare('SELECT * FROM Recetas');
        //*insertar nueva receta
        this.#insertStmt = db.prepare('INSERT INTO Recetas (nombre, descripcion, modo_preparacion, user, imagen, gusto, nivel, dieta) VALUES (@nombre, @descripcion, @modo_preparacion, @user, @imagen, @gusto, @nivel, @dieta)');
        //*modificar receta del usuario 
        this.#updateStmt = db.prepare('UPDATE Recetas SET nombre = @nombre, descripcion = @descripcion, modo_preparacion = @modo_preparacion, likes = @likes, imagen = @imagen, gusto = @gusto, nivel = @nivel, dieta = @dieta WHERE id = @id');
        //*eliminar recetas del usuario
        this.#deleteStmt = db.prepare('DELETE FROM Recetas WHERE id = @id');
        //*actualizar likes de la receta
        this.#addLikeStmt = db.prepare('UPDATE Recetas SET likes = likes + 1 WHERE id = @id');
        //*eliminar like del usuario sobre una receta 
        this.#removeLikeStmt = db.prepare('UPDATE Recetas SET likes = likes - 1 WHERE id = @id');
        //*seleccionar la receta por id (unica)
        this.#getByIdStmt = db.prepare('SELECT * FROM Recetas WHERE id = @id'); 
        //seleccionar favoritos 
        this.#getFavoritosByUserStmt = db.prepare(`
            SELECT r.* FROM Recetas r
            INNER JOIN Likes l ON r.id = l.id_receta
            WHERE l.user = @username
        `);
        //seleccionar recetas por usuario
        this.#getRecetasByUserStmt = db.prepare(`
            SELECT * FROM Recetas WHERE user = @username
        `);

    }

    // Obtener recetas por usuario
    static getRecetasPorUsuario(username) {
        const recetas = this.#getRecetasByUserStmt.all({ username });
        return recetas;
    }

    static getFavoritosPorUsuario(username) {
        const favoritos = this.#getFavoritosByUserStmt.all({ username });
        return favoritos;
    }
    
    /**
     * Obtener una receta por ID
     * 
     * @param { int } id 
     * @param { string } user Nombre de usuario al que se va a mostrar la receta
     * @returns 
     */
    static getRecetaById(id, user) {
        const receta = this.#getByIdStmt.get({ id });
        if (receta === undefined)
            throw new Error(`No se encontró la receta con ID ${id}`);
        else {
            let user_liked = false;
            if (user)
                user_liked = Like.usuarioYaHaDadoLike(id, user);

            return new Receta(receta.nombre, receta.descripcion, receta.modo_preparacion, receta.likes, receta.id, receta.user, user_liked, receta.imagen, receta.gusto, receta.nivel, receta.dieta);
        }
    }

    /**
     *Obtener todas las recetas
     * @returns Una lista con todas las recetas
     */
    static getAllRecetas() {

        const recetas = this.#getAllStmt.all();
        return recetas;
    }

    /**
     * Insertar una nueva receta
     * @param {Receta} receta Una receta con los datos que se tienen que insertar en la tabla  
     * @returns 
     */
    static insertReceta(receta) {
        let result;
        try {
            let user = receta.user;
            if (user == null)
                user = "admin";
            const safeGusto = receta.gusto && receta.gusto.trim() !== '' ? receta.gusto : null;
            const safeNivel = receta.nivel && receta.nivel.trim() !== '' ? receta.nivel : null;
            const safeDieta = receta.dieta && receta.dieta.trim() !== '' ? receta.dieta : null;
            
            console.log("⏳ Insertando receta con los datos:");
            console.log({
                nombre: receta.nombre,
                descripcion: receta.descripcion,
                modo_preparacion: receta.modo_preparacion,
                user: user, // ojo: estabas usando receta.user, pero defines arriba `user = receta.user`
                imagen: receta.imagen,
                gusto: safeGusto,
                nivel: safeNivel,
                dieta: safeDieta
            });
            result = this.#insertStmt.run({
                nombre: receta.nombre,
                descripcion: receta.descripcion,
                modo_preparacion: receta.modo_preparacion,
                user: user,
                imagen: receta.imagen,
                gusto: receta.gusto,
                nivel: receta.nivel,
                dieta: receta.dieta
            });
            console.log("✅ Resultado del insert:", result);
        }
        catch (e) {
            e.message += "Error al crear la receta";
            if (this.#insertStmt == null)
                e.message += "insert result null";
            throw new ErrorInsertReceta(receta.id, { cause: e });
        }

        return new Receta(receta.nombre, receta.descripcion, receta.modo_preparacion,
            receta.likes, result.lastInsertRowid, null, false, receta.imagen, receta.gusto, receta.nivel, receta.dieta);
    }

    /**
     * Añade un like a una receta
     * @param {int} id id de la receta
     * @param {string} user username del usuario 
     */
    static addLikeReceta(id, user) {
        Like.addLike(id, user);

        this.#addLikeStmt.run({
            id
        });
    }

    /**
     * Mira si el usuario ya ha dado like o no a la receta para decidir si se ha de eliminar o de añadir el like
     * @param {int} id id de la receta
     * @param {string} user username del usuario
     */
    static processLike(id, user) {
        if (Like.usuarioYaHaDadoLike(id, user))
            this.removeLikeReceta(id, user);
        else
            this.addLikeReceta(id, user);
    }

    /**
     * Elimina un like a la receta
     * @param {int} id id de la receta
     * @param {string} user username del usuario
     */
    static removeLikeReceta(id, user) {
        Like.retiraLike(id, user);

        this.#removeLikeStmt.run({
            id
        });
    }

    /**
     *Cambia los datos de la receta por los de la nueva receta de entrada
     *
     * @param {Receta} receta receta DE MISMO ID con los nuevos datos
     */
    static updateReceta(receta) {
        let result
        try {
            result = this.#updateStmt.run({
                id: receta.id,
                nombre: receta.nombre,
                modo_preparacion: receta.modo_preparacion,
                descripcion: receta.descripcion,
                likes: receta.likes,
                imagen: receta.imagen,
                gusto: receta.gusto,
                nivel: receta.nivel,
                dieta: receta.dieta
            });
        }
        catch (e) {
            e.message += " Error al actualizar la receta";
            if (this.#insertStmt == null)
                e.message += " update result null";
            throw new ErrorUpdateReceta(receta.id, { cause: e });
        }

        if (result.changes === 0) throw new Error(`No se encontró la receta con ID ${receta.id}`);
        return receta;
    }

    /**
     * Eliminar una receta por ID
     * @param {int} id 
     */
    static deleteReceta(id) {
        Contiene.deleteAllByReceta(id);
        Comentario.deleteAllComentarios(id);
        Like.retiraTodosLikes(id);
        const result = this.#deleteStmt.run({ id });
        if (result.changes === 0) throw new Error(`No se encontró la receta con ID ${id}`);
    }

    /**
     * Elimina todas las recetas de un usuario, no es muy eficiente
     * @param { Usuario } username 
     */
    static deleteAllRecetas(username) {
        const recetas = getRecetasPorUsuario(username);
        recetas.forEach(element => {
            const id = element.id;
            Contiene.deleteAllByReceta(id);
            Comentario.deleteAllComentarios(id);
            Like.retiraTodosLikes(id);
            const result = this.#deleteStmt.run({ id });
            if (result.changes === 0) throw new Error(`No se encontró la receta con ID ${id}`); 
        });
    }

    #id; // El id de la receta
    descripcion; // La descripción de la receta
    nombre; // El nombre de la receta
    likes;  // El numero de likes que tiene la receta
    user; // El usuario que crea la receta
    user_liked; // El usuario (el que hace la petición) ha dado like
    modo_preparacion;   // Pasos a seguir para realizar la receta
    imagen; // RUTA de la imagen de la receta
    ingredientes; // Ingredientes de la receta (array de ingredientes)
    gusto;  // gusto: dulce o salado
    nivel;  // nivel: fácil, medio, difícil
    dieta;  // tipo de dieta: vegana, sin gluten, carnívora

    constructor(nombre, descripcion, modo_preparacion, likes = null, id = null, user, user_liked = false, filename = null, gusto = null, nivel = null, dieta = null) {
        this.nombre = nombre.toUpperCase();
        this.descripcion = descripcion;
        this.modo_preparacion = modo_preparacion;
        this.likes = likes;
        this.#id = id;
        this.user = user;
        this.user_liked = user_liked;
        this.imagen = filename;
        this.gusto = gusto;
        this.nivel = nivel;
        this.dieta = dieta;
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
    static #getAllByUserStmt = null;

    static initStatements(db) {
        if (this.#getLikeStmt !== null) return;

        this.#getAllByUserStmt = db.prepare('SELECT * FROM Likes WHERE user = @username');
        this.#getLikeStmt = db.prepare('SELECT * FROM Likes WHERE id_receta = @id_receta AND user = @username');
        this.#insertLikeStmt = db.prepare('INSERT INTO Likes (id_receta, user) VALUES (@id_receta, @username)');
        this.#removeLikeStmt = db.prepare('DELETE FROM Likes WHERE id_receta = @id_receta AND user = @username;');
        this.#removeAllStmt = db.prepare('DELETE FROM Likes WHERE id_receta = @id_receta');
    }

    /**
     * Añade un like a una receta
     * 
     * @param {int} id_receta id de la receta
     * @param {string} username username del usuario
     */
    static addLike(id_receta, username) {
        try {
            this.#insertLikeStmt.run({
                id_receta,
                username
            });
        }
        catch (e) {
            console.log("Error al crear like");
            if (this.#insertLikeStmt == null)
                console.log("insert result null");
            else
                console.log(this.#insertLikeStmt);
            throw new ErrorInsertLike(id_receta, { cause: e });
        }
    }
    /**
     * Obtén una lista de recetas a las que el usuario ha dado like
     * @param {string} username username del usuario
     * @returns lista de ids de recetas
     */
    static getAllLikedPorUsuario(username){
        const result = this.#getAllByUserStmt.get({
            username
        });

        return result;
    }

    /**
     * Devuelve true o false dependiendo de si el usuario ha dado like a la receta o no
     * 
     * @param {int} id_receta id de la receta a analizar
     * @param {string} username username del usuario
     * @returns 
     */
    static usuarioYaHaDadoLike(id_receta, username) {
        const result = this.#getLikeStmt.get({
            id_receta,
            username
        });

        if (result)
            return true;
        else
            return false;
    }

    /**
     * Retira un like de la receta
     * @param {int} id_receta id de la receta
     * @param {string} username username del usuario
     */
    static retiraLike(id_receta, username) {
        this.#removeLikeStmt.run({
            id_receta,
            username
        });
    }

    /**
     * Retira todos los likes de la receta
     * @param {int} id_receta id de la receta
     */
    static retiraTodosLikes(id_receta) {
        this.#removeAllStmt.run({
            id_receta,
        });
    }
}


export class ErrorInsertReceta extends Error {
    /**
     * 
     * @param {int} id 
     * @param {ErrorOptions} [options]
     */
    constructor(id, options) {
        super(`La receta ${id} no pudo ser insertada en la base de datos`, options);
        this.name = 'ErrorInsertReceta';
    }
}


export class ErrorInsertLike extends Error {
    /**
     * 
     * @param {int} id 
     * @param {ErrorOptions} [options]
     */
    constructor(id, options) {
        super(`No se pudo añadir un like a la receta ${id}`, options);
        this.name = 'ErrorInsertLike';
    }
}

export class ErrorUpdateReceta extends Error {
    /**
     * 
     * @param {int} id 
     * @param {ErrorOptions} [options]
     */
    constructor(id, options) {
        super(`La receta ${id} no pudo ser actualizada en la base de datos`, options);
        this.name = 'ErrorUpdateReceta';
    }
}