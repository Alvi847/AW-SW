BEGIN TRANSACTION;
INSERT INTO "Comentarios" ("id","id_receta","user","valoracion","descripcion") VALUES (1,3,'Alvi47',1,'Muy weno el gato');
INSERT INTO "Contiene" ("id_receta","id_ingrediente","cantidad") VALUES (3,5,2);
INSERT INTO "Contiene" ("id_receta","id_ingrediente","cantidad") VALUES (3,6,3);
INSERT INTO "Contiene" ("id_receta","id_ingrediente","cantidad") VALUES (4,5,1);
INSERT INTO "Contiene" ("id_receta","id_ingrediente","cantidad") VALUES (5,5,40);
INSERT INTO "Contiene" ("id_receta","id_ingrediente","cantidad") VALUES (5,7,0.01);
INSERT INTO "Contiene" ("id_receta","id_ingrediente","cantidad") VALUES (5,6,20);
INSERT INTO "Contiene" ("id_receta","id_ingrediente","cantidad") VALUES (6,5,40);
INSERT INTO "Contiene" ("id_receta","id_ingrediente","cantidad") VALUES (6,7,20);
INSERT INTO "Contiene" ("id_receta","id_ingrediente","cantidad") VALUES (6,6,10);
INSERT INTO "Eventos" ("id","titulo","fecha","descripcion","user") VALUES (1,'Comprar pan','2025-05-21','Compra pan 👍','user');
INSERT INTO "Ingredientes" ("id","nombre","unidad","precio") VALUES (5,'azúcar','gr',25);
INSERT INTO "Ingredientes" ("id","nombre","unidad","precio") VALUES (6,'sal','uds',1);
INSERT INTO "Ingredientes" ("id","nombre","unidad","precio") VALUES (7,'pimienta','gr',0.01);
INSERT INTO "Ingredientes" ("id","nombre","unidad","precio") VALUES (9,'Patata','gr',0.5);
INSERT INTO "Likes" ("id_receta","user") VALUES (3,'Alvi47');
INSERT INTO "Pedidos" ("id","usuario","creacion") VALUES (12,'Alvi47','17/5/2025, 14:20:46');
INSERT INTO "Pedidos_Contiene" ("id_pedido","id_ingrediente","cantidad") VALUES (12,5,100);
INSERT INTO "Preferencias" ("user","gusto","nivel","dieta") VALUES ('Alvi47','dulce','fácil',NULL);
INSERT INTO "Preferencias" ("user","gusto","nivel","dieta") VALUES ('user',NULL,NULL,NULL);
INSERT INTO "Recetas" ("id","nombre","descripcion","likes","user","modo_preparacion","imagen","gusto","nivel","dieta") VALUES (1,'HABICHUELAS','123',0,'Alvi47','123','ba1026e12d9da08a1abd391a2ffde2af','dulce','medio','vegana');
INSERT INTO "Recetas" ("id","nombre","descripcion","likes","user","modo_preparacion","imagen","gusto","nivel","dieta") VALUES (3,'ASD','asd',1,'Alvi47','asd','9b1115e567c2954ebc31443fc512da22','dulce','fácil','vegana');
INSERT INTO "Recetas" ("id","nombre","descripcion","likes","user","modo_preparacion","imagen","gusto","nivel","dieta") VALUES (4,'UNO','1',0,'Alvi47','1','6b9b63ebd57a120b3751f3755ad65738','dulce','fácil','vegana');
INSERT INTO "Recetas" ("id","nombre","descripcion","likes","user","modo_preparacion","imagen","gusto","nivel","dieta") VALUES (5,'HABICHUELAS','<p>Unas habichuelas bien wenas </p>

<p>jejejejeje</p>',0,'Alvi47','<p>Bueno, lo del bol, la sal y el azúcar</p>

<p>Y luego eso, la pimienta :D</p>','54b94a4ce7dd5a995ff95815325ed105','dulce','difícil','sin gluten');
INSERT INTO "Recetas" ("id","nombre","descripcion","likes","user","modo_preparacion","imagen","gusto","nivel","dieta") VALUES (6,'HABICHUELAS','<p>Hola</p>

<p>adiós</p>',0,'Alvi47','<p>Hola</p>

<p>Adiós</p>','261caac48d17ecdef0fffc5c471a749d','dulce','difícil','sin gluten');
INSERT INTO "Usuarios" ("id","username","password","rol","nombre","email","imagen") VALUES (1,'Alvi47','$2b$10$XSg2gVUni0me.Z2NfR1KAu2vwilA0Rwi4Z3IcQPHKLRiAfew98zgK','A','Álvaro','alvi@alvi.com',NULL);
INSERT INTO "Usuarios" ("id","username","password","rol","nombre","email","imagen") VALUES (2,'user','$2b$10$JpCymbAe3/cTSO.AuHDOae8hP3l267UVvFM8Cum3CRom4cdY80t1W','U','Usuario','usuario@usuario.com',NULL);
INSERT INTO "Valoraciones_Comentarios" ("id_comentario","user","id_receta") VALUES (1,'Alvi47',3);
COMMIT;
