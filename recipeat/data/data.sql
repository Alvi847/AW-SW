-- Insertar datos en la tabla Usuarios
INSERT INTO "Usuarios" (username, password, rol, nombre, email, foto) VALUES
('carlos_apaza', '1234', 'A', 'Carlos Apaza', 'carlos@example.com', NULL),
('alejandro_garcia', '1234', 'A', 'Alejandro García', 'alejandro@example.com', NULL),
('alejandro_ramos', '1234', 'A', 'Alejandro Ramos', 'ramos@example.com', NULL),
('nicolae_caliman', '1234', 'A', 'Nicolae Caliman', 'nicolae@example.com', NULL),
('user', 'userpass', 'U', 'user', 'blalba@protonmail', NULL),
('admin', 'adminpass', 'A', 'admin', 'blalba@protonmail', NULL),
('alvaro_cepeda', '1234', 'A', 'Álvaro Cepeda', 'alvaro@example.com', NULL);

-- Insertar datos en la tabla Recetas
INSERT INTO "Recetas" (nombre, descripcion, likes, user, modo_preparacion, foto_receta) VALUES
('Pasta Carbonara', 'Deliciosa pasta con salsa cremosa', 10, 'carlos_apaza', 'Cocinar pasta y mezclar con salsa', NULL),
('Ensalada César', 'Ensalada con pollo, crutones y aderezo', 5, 'alejandro_garcia', 'Mezclar ingredientes y servir', NULL),
('Tacos al Pastor', 'Tacos mexicanos con carne marinada', 20, 'alejandro_ramos', 'Marinar carne, asar y servir en tortillas', NULL),
('Sopa de Lentejas', 'Sopa caliente y nutritiva', 8, 'nicolae_caliman', 'Cocinar lentejas con verduras y especias', NULL),
('Pizza Margarita', 'Pizza italiana con tomate y albahaca', 15, 'alvaro_cepeda', 'Hornear la masa con salsa y queso', NULL);
