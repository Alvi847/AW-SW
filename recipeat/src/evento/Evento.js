export class Evento {
    static #insertStmt;
    static #selectByUserStmt;
  
    static initStatements(db) {
      if (this.#insertStmt) return;
      this.#insertStmt = db.prepare(`INSERT INTO Eventos(titulo, fecha, descripcion, user) VALUES (@titulo, @fecha, @descripcion, @user)`);
      this.#selectByUserStmt = db.prepare(`SELECT * FROM Eventos WHERE user = @user`);
    }
  
    static crearEvento({ titulo, fecha, descripcion, user }) {
      return this.#insertStmt.run({ titulo, fecha, descripcion, user });
    }
  
    static obtenerEventosPorUsuario(user) {
      return this.#selectByUserStmt.all({ user });
    }
  }
  