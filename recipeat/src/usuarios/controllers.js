import { Usuario, Preferencias, UsuarioYaExiste } from './Usuario.js';
import { render } from '../utils/render.js';
import { validationResult, matchedData } from 'express-validator';
import { Receta } from '../receta/Receta.js';
import { logger } from '../logger.js';
import { Ingrediente } from '../ingrediente/Ingrediente.js';
import { Pedido } from '../Pedidos/Pedidos.js';

export function viewLogin(req, res, next) {
    render(req, res, 'paginas/login', {
        datos: {},
        errores: {}
    });
}

export function viewHome(req, res, next) {
    return render(req, res, 'paginas/home');
}

export async function doLogin(req, res, next) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        return render(req, res, 'paginas/login', {
            errores,
            datos
        });
    }
    // Capturo las variables username y password
    const username = req.body.username;
    const password = req.body.password;

    try {
        const usuario = Usuario.login(username, password);
        req.session.login = true;
        req.session.nombre = usuario.nombre;
        req.session.username = username; // Se tiene que guardar el nombre de usuario en la sesión, porque este es la clave identificativa
        req.session.rol = usuario.rol;
        req.session.hasPedido = Pedido.exists(username); // Si el usuario tiene un pedido o no

        res.setFlash(`Encantado de verte de nuevo: ${usuario.nombre}`);

        return res.redirect('/');

    } catch (e) {
        const datos = matchedData(req);
        req.log.warn("Problemas al hacer login del usuario '%s'", username);
        logger.debug('El usuario %s, no ha podido logarse: %s', username, e.message);
        render(req, res, 'paginas/login', {
            error: 'El usuario o contraseña no son válidos',
            datos,
            errores: {}
        });
    }
}

export function doLogout(req, res, next) {
    // https://expressjs.com/en/resources/middleware/session.html
    // logout logic

    // clear the user from the session object and save.
    // this will ensure that re-using the old session id
    // does not have a logged in user
    req.session.login = null
    req.session.nombre = null;
    req.session.rol = null;
    req.session.username = null;
    req.session.save((err) => {
        if (err) next(err);

        // regenerate the session, which is good practice to help
        // guard against forms of session fixation
        req.session.regenerate((err) => {
            if (err) next(err)
            res.redirect('/');
        })
    })
}

export function viewRegistro(req, res, next) {
    render(req, res, 'paginas/registro', {
        datos: {},
        errores: {}
    });
}

export async function doRegistro(req, res, next) {
    const result = validationResult(req);


    const requestWith = req.get('X-Requested-With');
    const esAjax = requestWith != undefined && ['xmlhttprequest', 'fetch'].includes(requestWith.toLowerCase());
    if (esAjax)
        logger.debug("Petición AJAX recibida para doRegistro()");

    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);

        if (esAjax) {
            logger.debug("Devuelto código 400 a la petición AJAX");
            return res.status(400).json({ status: 400, errores });
        }

        return render(req, res, 'paginas/registro', {
            datos,
            errores
        });
    }

    // Capturo las variables username y password
    const username = req.body.username;
    const password = req.body.password;
    const nombre = req.body.nombre;
    const email = req.body.email;
    const imagen = req.file;

    try {
        const usuario = await Usuario.creaUsuario(username, password, nombre, email, imagen);

        Preferencias.insertPreferencia({
            user: usuario.username,
            gusto: null,
            nivel: null,
            dieta: null
        });

        req.session.login = true;
        req.session.nombre = usuario.nombre;
        req.session.rol = usuario.rol;
        req.session.username = usuario.username;
        req.session.email = usuario.email;
        req.session.imagen = usuario.imagen;
        req.session.hasPedido = false;

        if (esAjax) {
            logger.debug("Devuelto código 200 a la petición AJAX");
            return res.status(200).json({ ok: true });
        }

        logger.info("Usuario %s registrado con éxito", usuario.username);

        return res.redirect('/usuarios/home');
    } catch (e) {
        let error = 'No se ha podido crear el usuario';
        if (e instanceof UsuarioYaExiste) {
            error = 'El nombre de usuario ya está utilizado';
        }
        const datos = matchedData(req);
        delete datos.password;
        delete datos.passwordConfirmacion;
        req.log.error("Problemas al registrar un nuevo usuario '%s'", username);
        logger.debug('El usuario no ha podido registrarse: %s', e);
        render(req, res, 'paginas/registro', {
            error,
            datos: {},
            errores: {}
        });
    }
}
/*      YA NO SE USA
export async function viewPerfil(req, res, next) {

    try {

        const usuario = await Usuario.getUsuarioByUsername(req.session.username);

        render(req, res, 'paginas/verPerfil', { usuario });

    } catch (error) {
        req.log.error(error);

        const err = {};

        err.statusCode = 500;
        err.message = 'Hubo un problema al cargar tu perfil';

        return next(err, req, res);
    }
}*/

export async function viewPerfilUser(req, res, next) {  // ver perfil de usuario concreto, pasado por params en url
    const result = validationResult(req);
    const err = {};

    if (!result.isEmpty()) {
        const errores = result.mapped();

        err.statusCode = 400;
        err.message = errores['username'].msg;

        return next(err, req, res); // Mostramos al usuario el error correspondiente
    }

    try {
        const { username } = req.params;

        const usuario = Usuario.getUsuarioByUsername(username);

        render(req, res, 'paginas/verPerfil', {
            usuario
        });

    } catch (error) {
        req.log.error(error);
        err.statusCode = 400;
        err.message = 'Hubo un problema al cargar el perfil del usuario';

        return next(err, req, res); // Mostramos al usuario el error correspondiente

    }
}

export async function viewFavoritosUser(req, res, next) {

    const result = validationResult(req);
    const err = {};

    if (!result.isEmpty()) {
        const errores = result.mapped();

        err.statusCode = 400;
        err.message = errores['username'].msg;

        return next(err, req, res); // Mostramos al usuario el error correspondiente 
    }

    const { username } = req.params;

    if (!username) {
        return render(req, res, 'paginas/home', { error: 'Usuario no encontrado' });
    }
    const usuario = Usuario.getUsuarioByUsername(username);
    let recetas = Receta.getFavoritosPorUsuario(username);

    //  Strip de etiquetas HTML en la descripción (podria venir enriquecido por CKEditor) 
    const stripTags = (input) =>
        input.replace(/(<([^>]+)>)/gi, "").replace(/&nbsp;/g, " ").trim();

    recetas = recetas.map(r => ({
        ...r,
        id: r.id,
        descripcion: stripTags(r.descripcion)
    }));


    render(req, res, 'paginas/misRecetas', {
        recetas,
        usuario
    });
}

export async function viewRecetasUser(req, res, next) {

    const result = validationResult(req);
    const err = {};

    if (!result.isEmpty()) {
        const errores = result.mapped();

        err.statusCode = 400;
        err.message = errores['username'].msg;

        return next(err, req, res); // Mostramos al usuario el error correspondiente 
    }

    const { username } = req.params;

    try {
        const usuario = Usuario.getUsuarioByUsername(username);
        if (!usuario) {
            return res.redirect('/usuarios/login');  // Si no se encuentra el usuario, redirigir al login
        }

        let recetas = Receta.getRecetasPorUsuario(username);
        //  Strip de etiquetas HTML en la descripción (podria venir enriquecido por CKEditor) 
        const stripTags = (input) =>
            input.replace(/(<([^>]+)>)/gi, "").replace(/&nbsp;/g, " ").trim();

        recetas = recetas.map(r => ({
            ...r,
            id: r.id,
            descripcion: stripTags(r.descripcion)
        }));

        render(req, res, 'paginas/misRecetas', {
            usuario,
            recetas,
        });
    } catch (error) {
        console.error(error);
        render(req, res, 'paginas/perfil', {
            error: 'Hubo un problema al cargar tu perfil',
            usuario: {},
            errores: {}
        });
    }
}

export async function viewUpdatePerfil(req, res, next) {
    try {
        const usuario = Usuario.getUsuarioByUsername(req.session.username);
        if (!usuario) {
            return res.redirect('/usuarios/login');
        }

        render(req, res, 'paginas/updatePerfil', { usuario, errores: {} });
    } catch (error) {
        console.error(error);
        render(req, res, 'paginas/updatePerfil', {
            error: 'No se pudo cargar el formulario de edición',
            usuario: {},
            errores: {}
        });
    }
}

export async function updatePerfil(req, res, next) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        if (req.file)
            await fs.unlink(req.file.path); // En la actualización también borramos la foto si el usuario ha subido alguna
        return render(req, res, 'paginas/updatePerfil', {
            usuario: datos,
            errores
        });
    }

    const { username, nombre, email, password } = req.body;
    /*const imagen = (req.file && req.file.filename) ? req.file.filename : null;*/
    /*let imagen = null;
    if (req.file && typeof req.file.filename === 'string') {
        imagen = req.file.filename;
    }*/


    try {
        const usuario = Usuario.getUsuarioByUsername(req.session.username);
        usuario.nombre = nombre;
        //usuario.#username = username; 
        usuario.email = email;
        //usuario.imagen = imagen.filename;
        if (req.file) {
            usuario.imagen = req.file.filename;
        }

        if (password && password.trim() !== '') {
            await usuario.cambiaPassword(password);
        }

        usuario.persist();

        req.session.username = username;
        req.session.nombre = nombre;

        res.setFlash('Perfil actualizado correctamente');
        return res.redirect('/usuarios/verPerfil');

    } catch (error) {
        console.error(error);
        render(req, res, 'paginas/updatePerfil', {
            error: 'No se pudo actualizar el perfil',
            usuario: req.body,
            errores: {}
        });
    }
}

export async function viewAdministrar(req, res, next) {
    try {
        const usuarios = Usuario.getAllUsuarios();
        const ingredientes = Ingrediente.getAllIngredientes();
        render(req, res, 'paginas/administrar', { errores: [], usuarios, ingredientes });
    } catch (error) {
        req.log.error(error.message);

        const err = {};

        err.statusCode = 500;
        err.message = 'No se pudo cargar la vista de administración';

        next(err, req, res);
    }
}

export async function deleteUsuario(req, res, next) {

    const result = validationResult(req);

    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);

        const err = {};

        err.statusCode = 400;
        err.message = "El nombre de usuario debe no estar vacío y estar contenido solo por letras y números";

        return next(err, req, res);
    }

    const { username } = req.body;
    try {
        Usuario.delete(username);
        res.redirect('/usuarios/administrar');
    } catch (error) {
        console.error(error);
        res.setFlash('No se pudo eliminar el usuario');
        res.redirect('/usuarios/administrar');
    }
}

export async function cambiarRolUsuario(req, res, next) {

    const result = validationResult(req);

    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);

        const err = {};

        err.statusCode = 400;
        err.message = "El nombre de usuario debe no estar vacío y estar contenido solo por letras y números";

        return next(err, req, res);
    }

    const { username, rol } = req.body;

    if (!['U', 'A'].includes(rol)) {
        res.setFlash('Rol no válido');
        return res.redirect('/usuarios/administrar');
    }

    try {
        const usuario = Usuario.getUsuarioByUsername(username);
        usuario.rol = rol;
        usuario.persist();
        res.setFlash('Rol actualizado correctamente');
    } catch (error) {
        console.error(error);
        res.setFlash('No se pudo actualizar el rol');
    }

    return res.redirect('/usuarios/administrar');
}

/**
 * Mostrar la vista de preferencias para el usuario logueado
 */
export async function viewPreferencias(req, res, next) {
    const user = req.session.username;

    if (!user) {
        return res.redirect('/login');
    }

    try {
        const preferencias = Preferencias.getPreferenciasUsuario(user);
        return render(req, res, 'paginas/misPreferencias', {
            preferencias,
            errores: {}
        });
    } catch (e) {
        req.log.error("Error al obtener preferencias para '%s': %s", user, e.message);
        return res.status(500).send("Error interno del servidor");
    }
}

/**
 * Procesar y guardar las preferencias del usuario
 */
export function guardarPreferencias(req, res, next) {
    const result = validationResult(req);
    const esAjax = ['xmlhttprequest', 'fetch'].includes((req.get('X-Requested-With') || '').toLowerCase());
    const user = req.session.username;

    if (!user) {
        return res.redirect('/login');
    }

    if (esAjax)
        logger.debug("Petición AJAX recibida para guardarPreferencias()");

    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);

        if (esAjax) {
            logger.debug("Errores de validación: %o", errores);
            return res.status(400).json({ status: 400, errores });
        }

        return render(req, res, 'paginas/misPreferencias', {
            preferencias: datos,
            errores
        });
    }

    const datos = matchedData(req);

    try {
        // Borrar preferencias anteriores si existen
        Preferencias.deletePreferencias(user);

        // Crear y guardar nuevas preferencias
        const nuevaPreferencia = new Preferencias(user, datos.gusto, datos.nivel, datos.dieta);
        Preferencias.insertPreferencia(nuevaPreferencia);

        logger.info("Preferencias actualizadas para '%s'", user);

        if (esAjax) {
            return res.status(200).json({ ok: true });
        }

        return res.redirect('/usuarios/misPreferencias');
    } catch (e) {
        req.log.error("Error al guardar preferencias para '%s': %s", user, e.message);

        if (esAjax) {
            return res.status(500).json({ status: 500, message: 'Error interno del servidor' });
        }

        return render(req, res, 'paginas/misPreferencias', {
            preferencias: datos,
            errores: { general: { msg: 'No se pudieron guardar las preferencias' } }
        });
    }
}






