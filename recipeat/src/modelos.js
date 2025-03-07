import { Usuario } from "./usuarios/Usuario.js";
import { Receta, Like } from "./receta/Receta.js";

export function inicializaModelos(db) {
    Usuario.initStatements(db);
    Receta.initStatements(db);
    Like.initStatements(db);
}
