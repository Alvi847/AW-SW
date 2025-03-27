/*CREATE TABLE "Recetas"(
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
    ON DELETE CASCADE,PRIMARY KEY ("id_receta", "user"))*/

--
-- File generated with SQLiteStudio v3.4.4 on ju. mar. 27 10:35:10 2025
--
-- Text encoding used: System
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: Comentario
CREATE TABLE IF NOT EXISTS Comentario (id INTEGER PRIMARY KEY, dueño INTEGER REFERENCES Usuarios (id) ON DELETE CASCADE, likes INTEGER, descripcion TEXT, receta INTEGER REFERENCES Recetas (id) ON DELETE CASCADE);

-- Table: Likes
CREATE TABLE IF NOT EXISTS "Likes" ("id_receta" INTEGER NOT NULL, "user" TEXT NOT NULL, FOREIGN KEY ("id_receta") REFERENCES "Recetas"("id") ON DELETE CASCADE, FOREIGN KEY ("user") REFERENCES "Usuarios"("username") ON DELETE CASCADE,PRIMARY KEY ("id_receta", "user"));
INSERT INTO Likes (id_receta, user) VALUES (3, 'Alvi47');

-- Table: Recetas
CREATE TABLE IF NOT EXISTS Recetas (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, nombre TEXT NOT NULL, descripcion TEXT NOT NULL, likes INTEGER NOT NULL DEFAULT '0', user TEXT DEFAULT NULL REFERENCES Usuarios (username), modo_preparacion TEXT, foto TEXT);

-- Table: Usuarios
CREATE TABLE IF NOT EXISTS "Usuarios" (
	"id"	INTEGER NOT NULL,
	"username"	TEXT NOT NULL UNIQUE,
	"password"	TEXT NOT NULL,
	"rol"	TEXT NOT NULL DEFAULT 'U' CHECK("rol" IN ('U', 'A')),
	"nombre"	TEXT NOT NULL, "email" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
