import { Usuario } from "./usuarios/Usuario.js";
import { Receta, Like } from "./receta/Receta.js";

export function inicializaModelos(db) {

    //db.exec('CREATE TABLE "main"."Likes"( "id_receta" INTEGER NOT NULL REFERENCES "Recetas"("id"), "user" TEXT NOT NULL REFERENCES "Usuarios"("username"))');

    Usuario.initStatements(db);
    Receta.initStatements(db);
    Like.initStatements(db);
}
