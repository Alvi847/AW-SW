BEGIN TRANSACTION;
DROP TABLE IF EXISTS "Comentarios";
CREATE TABLE "Comentarios" (
	"id"	INTEGER NOT NULL,
	"id_receta"	INTEGER NOT NULL,
	"user"	TEXT NOT NULL,
	"valoracion"	INTEGER,
	"descripcion"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("id_receta") REFERENCES "Recetas"("id"),
	FOREIGN KEY("user") REFERENCES "Usuarios"("username")
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
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "Valoraciones_Comentarios";
CREATE TABLE "Valoraciones_Comentarios" (
	"id_comentario"	INTEGER,
	"user"	TEXT,
	FOREIGN KEY("id_comentario") REFERENCES "Comentarios"("id"),
	FOREIGN KEY("user") REFERENCES "Usuarios"("username")
);
COMMIT;
