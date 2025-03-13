CREATE TABLE "Recetas"(
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT NOT NULL,
  "likes" INTEGER NOT NULL DEFAULT '0',
  "user" TEXT DEFAULT NULL REFERENCES "Usuarios"("username"),
  "modo_preparacion" TEXT,
  "foto_receta" TEXT)

CREATE TABLE "Usuarios" (
	"id"	INTEGER NOT NULL,
	"username"	TEXT NOT NULL UNIQUE,
	"password"	TEXT NOT NULL,
    "foto"  TEXT ,
	"rol"	TEXT NOT NULL DEFAULT 'U' CHECK("rol" IN ('U', 'A')),
	"nombre"	TEXT NOT NULL,
    "email" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT))

CREATE TABLE "Likes" (
    "id_receta" INTEGER NOT NULL,
    "user" TEXT NOT NULL, FOREIGN KEY ("id_receta") REFERENCES "Recetas"("id") ON DELETE CASCADE, FOREIGN KEY ("user") REFERENCES "Usuarios"("username") 
    ON DELETE CASCADE,PRIMARY KEY ("id_receta", "user"))