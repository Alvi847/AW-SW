import { Usuario } from "./usuarios/Usuario.js";
import { Receta, /*CreadaPor*/ } from "./receta/Receta.js";

export function inicializaModelos(db) {
    Usuario.initStatements(db);
    Receta.initStatements(db);
    //CreadaPor.initStatements(db);

}
