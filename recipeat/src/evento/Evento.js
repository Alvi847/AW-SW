export class Evento {
  static #insertStmt;
  static #selectByUserStmt;
  static #deleteStmt;
  static #updateStmt;

  static initStatements(db) {
    if (this.#insertStmt) return;

    this.#insertStmt = db.prepare(`
      INSERT INTO Eventos(titulo, fecha, descripcion, user)
      VALUES (@titulo, @fecha, @descripcion, @user)
    `);

    this.#selectByUserStmt = db.prepare(`
      SELECT * FROM Eventos WHERE user = @user
    `);

    this.#deleteStmt = db.prepare(`
      DELETE FROM Eventos WHERE id = ? AND user = ?
    `);

    this.#updateStmt = db.prepare(`UPDATE Eventos SET titulo = @titulo, fecha = @fecha, descripcion = @descripcion WHERE id = @id AND user = @user`);
  }

  static crearEvento({ titulo, fecha, descripcion, user }) {
    return this.#insertStmt.run({ titulo, fecha, descripcion, user });
  }

  static obtenerEventosPorUsuario(user) {
    return this.#selectByUserStmt.all({ user });
  }

  static eliminarEvento(id, user) {
    return this.#deleteStmt.run(id, user);
  }

  static actualizarEvento({ id, titulo, fecha, descripcion, user }) {
    return this.#updateStmt.run({ id, titulo, fecha, descripcion, user });
  }
}
