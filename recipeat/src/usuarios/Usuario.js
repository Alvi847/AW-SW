
import bcrypt from "bcryptjs";
import { ErrorDatos } from "../db.js";

export const RolesEnum = Object.freeze({
    USUARIO: 'U',
    ADMIN: 'A'
});

export class Usuario {
    static #getByUsernameStmt = null;
    static #insertStmt = null;
    static #updateStmt = null;
    static #getUserByIdStmt = null;
    static initStatements(db) {
        if (this.#getByUsernameStmt !== null) return;

        this.#getByUsernameStmt = db.prepare('SELECT * FROM Usuarios WHERE username = @username');
        this.#insertStmt = db.prepare('INSERT INTO Usuarios(username, password, nombre, rol, email, imagen) VALUES (@username, @password, @nombre, @rol, @email, @imagen)');
        this.#updateStmt = db.prepare('UPDATE Usuarios SET username = @username, password = @password, rol = @rol, nombre = @nombre, email = @email, imagen = @imagen WHERE id = @id');
        this.#getUserByIdStmt = db.prepare( 'SELECT * FROM Usuarios WHERE id = @id');
    }

    static getUsuarioByUsername(username) {
        const usuario = this.#getByUsernameStmt.get({ username });
        if (usuario === undefined) throw new UsuarioNoEncontrado(username);

        const { password, rol, nombre, id, email } = usuario;

        return new Usuario(username, password, nombre, email, rol, id, usuario.imagen);
    }

    static getUsuarioById( iduser ) {
        const usuario = this.#getUserByIdStmt.get({ iduser });
        if (usuario === undefined) throw new UsuarioNoEncontrado(username);

        const { username, password, rol, nombre, email } = usuario; //quiza quitar el pasword de aqui

        return new Usuario(username, password, nombre, email, rol, iduser, usuario.imagen);
    }

    static #insert(usuario) {
        let result = null;
        try {
            const username = usuario.#username;
            const password = usuario.#password;
            const nombre = usuario.nombre;
            const rol = usuario.rol;
            const email = usuario.#email;
            const imagen = usuario.imagen;
            const datos = {username, password, nombre, email, rol, imagen};

            result = this.#insertStmt.run(datos);

            usuario.#id = result.lastInsertRowid;
        } catch(e) { // SqliteError: https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md#class-sqliteerror
            if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                throw new UsuarioYaExiste(usuario.#username);
            }
            throw new ErrorDatos('No se ha insertado el usuario', { cause: e });
        }
        return usuario;
    }

    static #update(usuario) {
        const id = usuario.#id;
        const username = usuario.#username;
        const password = usuario.#password;
        const nombre = usuario.nombre;
        const rol = usuario.rol;
        const email = usuario.#email;
        const imagen = usuario.imagen;
        const datos = {username, password, nombre, email, rol, id, imagen};

        const result = this.#updateStmt.run(datos);
        if (result.changes === 0) throw new UsuarioNoEncontrado(username);

        return usuario;
    }


    static async login(username, password) {
        let usuario = null;
        try {
            usuario = this.getUsuarioByUsername(username);
        } catch (e) {
            throw new UsuarioOPasswordNoValido(username, { cause: e });
        }

        const passwordMatch = await bcrypt.compare(password, usuario.#password);
        if ( ! passwordMatch ) throw new UsuarioOPasswordNoValido(username);

        return usuario;
    }

    static async creaUsuario(username, password, nombre, email, imagen) {
        const usuario = new Usuario(username, password, nombre, email, imagen);
        await usuario.cambiaPassword(password);
        usuario.persist();
        return usuario;
    }

    #id;
    #username;
    #password;
    #email;
    rol;
    nombre;
    imagen;

    constructor(username, password, nombre, email = '', rol = RolesEnum.USUARIO, id = null, filename = null) {
        this.#username = username;
        this.#password = password;
        this.nombre = nombre;
        this.rol = rol;
        this.#id = id;
        this.#email = email;
        this.imagen = filename;
    }

    get email() {
        return this.#email;
      }
    
    set email(valor) {
        this.#email = valor;
    }
      
      
    get id() {
        return this.#id;
    }

    async cambiaPassword(nuevoPassword) {
        /* Nota: este método reemplaza set password() { } ya 
        que no se pueden hacer asíncronos los métodos get / set
        */
        this.#password = bcrypt.hashSync(nuevoPassword);    
    }

    get username() {
        return this.#username;
    }

    persist() {
        if (this.#id === null) return Usuario.#insert(this);
        return Usuario.#update(this);
    }
}

export class UsuarioNoEncontrado extends Error {
    /**
     * 
     * @param {string} username 
     * @param {ErrorOptions} [options]
     */
    constructor(username, options) {
        super(`Usuario no encontrado: ${username}`, options);
        this.name = 'UsuarioNoEncontrado';
    }
}

export class UsuarioOPasswordNoValido extends Error {
    /**
     * 
     * @param {string} username 
     * @param {ErrorOptions} [options]
     */
    constructor(username, options) {
        super(`Usuario o password no válido: ${username}`, options);
        this.name = 'UsuarioOPasswordNoValido';
    }
}


export class UsuarioYaExiste extends Error {
    /**
     * 
     * @param {string} username 
     * @param {ErrorOptions} [options]
     */
    constructor(username, options) {
        super(`Usuario ya existe: ${username}`, options);
        this.name = 'UsuarioYaExiste';
    }
}
