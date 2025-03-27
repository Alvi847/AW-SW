import { Usuario } from "./usuarios/Usuario.js";
import { Receta, Like } from "./receta/Receta.js";
import { Comentario, Valoracion } from "./comentario/Comentario.js"

export function inicializaModelos(db) {
    Usuario.initStatements(db);
    Receta.initStatements(db);
    Like.initStatements(db);
    Comentario.initStatements(db);
    Valoracion.initStatements(db);
}

