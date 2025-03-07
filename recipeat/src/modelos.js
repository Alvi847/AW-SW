import { Usuario } from "./usuarios/Usuario.js";
import { Receta } from "./receta/Receta.js";

export function inicializaModelos(db) {
    Usuario.initStatements(db);
    Receta.initStatements(db);

}
