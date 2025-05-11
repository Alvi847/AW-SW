BEGIN TRANSACTION;
DROP TABLE IF EXISTS "Comentarios";
CREATE TABLE "Comentarios" (
	"id"	INTEGER NOT NULL,
	"id_receta"	INTEGER NOT NULL,
	"user"	TEXT NOT NULL,
	"valoracion"	INTEGER NOT NULL DEFAULT 0,
	"descripcion"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("id_receta") REFERENCES "Recetas"("id"),
	FOREIGN KEY("user") REFERENCES "Usuarios"("username")
);
DROP TABLE IF EXISTS "Contiene";
CREATE TABLE "Contiene" (
	"id_receta"	INTEGER,
	"id_ingrediente"	INTEGER,
	"cantidad"	INTEGER NOT NULL,
	FOREIGN KEY("id_ingrediente") REFERENCES "Ingredientes"("id"),
	FOREIGN KEY("id_receta") REFERENCES "Recetas"("id")
);
DROP TABLE IF EXISTS "Eventos";
CREATE TABLE "Eventos" (
	"id"	INTEGER,
	"titulo"	TEXT NOT NULL,
	"fecha"	TEXT NOT NULL,
	"descripcion"	TEXT,
	"user"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("user") REFERENCES "Usuarios"("username")
);
DROP TABLE IF EXISTS "Ingredientes";
CREATE TABLE "Ingredientes" (
	"nombre"	TEXT,
	"unidad"	TEXT NOT NULL DEFAULT 'g',
	"precio"	NUMERIC NOT NULL DEFAULT 0.01,
	"id"	INTEGER NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "Likes";
CREATE TABLE "Likes" (
	"id_receta"	INTEGER NOT NULL,
	"user"	TEXT NOT NULL,
	PRIMARY KEY("id_receta","user"),
	FOREIGN KEY("id_receta") REFERENCES "Recetas"("id") ON DELETE CASCADE,
	FOREIGN KEY("user") REFERENCES "Usuarios"("username") ON DELETE CASCADE
);
DROP TABLE IF EXISTS "Recetas";
CREATE TABLE "Recetas" (
	"id"	INTEGER NOT NULL,
	"nombre"	TEXT NOT NULL,
	"descripcion"	TEXT NOT NULL,
	"likes"	INTEGER NOT NULL DEFAULT '0',
	"user"	TEXT DEFAULT NULL,
	"modo_preparacion"	TEXT,
	"imagen"	VARCHAR(255),
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("user") REFERENCES "Usuarios"("username")
);
DROP TABLE IF EXISTS "Usuarios";
CREATE TABLE "Usuarios" (
	"id"	INTEGER NOT NULL,
	"username"	TEXT NOT NULL UNIQUE,
	"password"	TEXT NOT NULL,
	"rol"	TEXT NOT NULL DEFAULT 'U' CHECK("rol" IN ('U', 'A')),
	"nombre"	TEXT NOT NULL,
	"email"	TEXT,
	"imagen"	VARCHAR(255),
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "Valoraciones_Comentarios";
CREATE TABLE "Valoraciones_Comentarios" (
	"id_comentario"	INTEGER,
	"user"	TEXT,
	"id_receta"	INTEGER,
	FOREIGN KEY("id_comentario") REFERENCES "Comentarios"("id"),
	FOREIGN KEY("id_receta") REFERENCES "Recetas"("id"),
	FOREIGN KEY("user") REFERENCES "Usuarios"("username")
);
COMMIT;
