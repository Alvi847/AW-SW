export class Comentario{
    static #insertStmt = null;
    static #getAllStmt = null;

    static initStatements(db) {
        if (this.#getAllStmt !== null) return;

        //TODO: inicializar correctamente los statements
    }

    //TODO: Escribir las funciones

    #id;
    user;
    receta;
    valoracion; //??
    descripcion;

    constructor(user, receta, valoracion = null, descripcion, id){
        this.user = user;
        this.receta = receta;
        this.valoracion = valoracion;
        this.descripcion = descripcion;
        this.#id = id;
    }

    get id() {
        return this.#id;
    }
}