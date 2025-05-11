import { Usuario } from "./usuarios/Usuario.js";
import { Receta, Like } from "./receta/Receta.js";
import { Comentario, Valoracion } from "./comentario/Comentario.js"
import { Evento } from "./evento/Evento.js";
import { Contiene, Ingrediente } from "./ingrediente/Ingrediente.js";



export function inicializaModelos(db) {
    Usuario.initStatements(db);
    Receta.initStatements(db);
    Like.initStatements(db);
    Comentario.initStatements(db);
    Valoracion.initStatements(db);
    Evento.initStatements(db);
    Ingrediente.initStatements(db);
    Contiene.initStatements(db);
}

