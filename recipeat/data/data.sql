BEGIN TRANSACTION;
INSERT INTO "Comentarios" ("id","id_receta","user","valoracion","descripcion") VALUES (3,7,'Alvi47',0,'Adoro');
INSERT INTO "Contiene" ("id_receta","id_ingrediente","cantidad") VALUES (3,5,2);
INSERT INTO "Contiene" ("id_receta","id_ingrediente","cantidad") VALUES (3,6,3);
INSERT INTO "Contiene" ("id_receta","id_ingrediente","cantidad") VALUES (4,5,1);
INSERT INTO "Contiene" ("id_receta","id_ingrediente","cantidad") VALUES (7,10,200);
INSERT INTO "Contiene" ("id_receta","id_ingrediente","cantidad") VALUES (7,6,2);
INSERT INTO "Contiene" ("id_receta","id_ingrediente","cantidad") VALUES (7,11,10);
INSERT INTO "Contiene" ("id_receta","id_ingrediente","cantidad") VALUES (7,5,2);
INSERT INTO "Contiene" ("id_receta","id_ingrediente","cantidad") VALUES (7,7,2);
INSERT INTO "Ingredientes" ("id","nombre","unidad","precio") VALUES (5,'Azúcar','gr',25);
INSERT INTO "Ingredientes" ("id","nombre","unidad","precio") VALUES (6,'Sal','uds',1);
INSERT INTO "Ingredientes" ("id","nombre","unidad","precio") VALUES (7,'Pimienta','gr',0.01);
INSERT INTO "Ingredientes" ("id","nombre","unidad","precio") VALUES (9,'Patata','gr',0.5);
INSERT INTO "Ingredientes" ("id","nombre","unidad","precio") VALUES (10,'Pasta','gr',1);
INSERT INTO "Ingredientes" ("id","nombre","unidad","precio") VALUES (11,'Tomate triturado','gr',1);
INSERT INTO "Ingredientes" ("id","nombre","unidad","precio") VALUES (12,'Aceite de oliva','gr',1);
INSERT INTO "Likes" ("id_receta","user") VALUES (3,'Alvi47');
INSERT INTO "Pedidos" ("id","usuario","creacion") VALUES (12,'Alvi47','17/5/2025, 14:20:46');
INSERT INTO "Pedidos_Contiene" ("id_pedido","id_ingrediente","cantidad") VALUES (12,6,2);
INSERT INTO "Pedidos_Contiene" ("id_pedido","id_ingrediente","cantidad") VALUES (12,7,2);
INSERT INTO "Preferencias" ("user","gusto","nivel","dieta") VALUES ('Alvi47','dulce','fácil',NULL);
INSERT INTO "Preferencias" ("user","gusto","nivel","dieta") VALUES ('user',NULL,NULL,NULL);
INSERT INTO "Preferencias" ("user","gusto","nivel","dieta") VALUES ('admin',NULL,NULL,NULL);
INSERT INTO "Recetas" ("id","nombre","descripcion","likes","user","modo_preparacion","imagen","gusto","nivel","dieta") VALUES (3,'TACOS AL PASTOR','Jugosos y sabrosos tacos elaborados con carne de cerdo marinada en achiote y especias, asada al estilo tradicional y servida en tortillas de maíz con piña, cebolla y cilantro fresco.',1,'Alvi47','asd','b3aa41bbf26b43371aa668191e5fdebe','dulce','fácil','vegana');
INSERT INTO "Recetas" ("id","nombre","descripcion","likes","user","modo_preparacion","imagen","gusto","nivel","dieta") VALUES (4,'Pizza Margarita','Clásica pizza italiana con base fina, salsa de tomate natural, mozzarella derretida y hojas frescas de albahaca. Sencilla, aromática y deliciosa.',0,'Alvi47','<h2>Modo de preparación</h2>
  <ol>
    <li><strong>Precalienta</strong> el horno a 220 °C (428 °F).</li>
    <li><strong>Estira</strong> la masa de pizza sobre una bandeja o piedra para hornear.</li>
    <li><strong>Unta</strong> una capa uniforme de salsa de tomate sobre la base.</li>
    <li><strong>Distribuye</strong> la mozzarella fresca en rodajas por encima.</li>
    <li><strong>Agrega</strong> unas hojas de albahaca fresca y un chorrito de aceite de oliva.</li>
    <li><strong>Hornea</strong> durante 10-15 minutos o hasta que el borde esté dorado y el queso fundido.</li>
    <li><strong>Sirve caliente</strong> y disfruta.</li>
  </ol>','11402b18bdee34d2a2a78eed4847ad73','dulce','fácil','vegana');
INSERT INTO "Recetas" ("id","nombre","descripcion","likes","user","modo_preparacion","imagen","gusto","nivel","dieta") VALUES (7,'MACARRONES CON TOMATE','<p>Un plato clásico y reconfortante: macarrones al dente mezclados con una suave salsa de tomate casera. Sencillo, sabroso y perfecto para cualquier día de la semana.</p>
',1,'Alvi47','<p></p><h2>Preparación de los macarrones con tomate</h2><br />
<ol><br />
  <li><strong>Cocer la pasta:</strong> Hierve los macarrones en agua con sal hasta que estén al dente. Escurre y reserva.</li><br />
  <li><strong>Preparar la salsa:</strong> Añade tomate triturado, sal, pimienta y una pizca de azúcar. Cocina a fuego lento 10-15 min.</li><br />
  <li><strong>Mezclar:</strong> Incorpora los macarrones a la salsa y remueve bien. Cocina un par de minutos más.</li><br />
  <li><strong>Servir:</strong> Sirve caliente y disfruta :D.</li><br />
</ol><br />
 <p></p>
','55df092d3b8f5d35b29136b1293ce0c3','salado','fácil','vegana');
INSERT INTO "Usuarios" ("id","username","password","rol","nombre","email","imagen") VALUES (1,'Alvi47','$2b$10$XSg2gVUni0me.Z2NfR1KAu2vwilA0Rwi4Z3IcQPHKLRiAfew98zgK','A','Álvaro','alvi@alvi.com',NULL);
INSERT INTO "Usuarios" ("id","username","password","rol","nombre","email","imagen") VALUES (4,'user','$2b$10$ni6pJGyoLJSo.JgDKlddLuF4br23gjVD9Npc3k0YyGT0ZwOYKAKpS','U','Usuario','usuario@usuario.com',NULL);
INSERT INTO "Usuarios" ("id","username","password","rol","nombre","email","imagen") VALUES (6,'admin','$2b$10$n0DL2D6/psGzP2ogB33AUut4zn9eb5qNen5z4kOk5w9qGAfWrkud.','A','Administrador','admin@admin.com',NULL);
COMMIT;
