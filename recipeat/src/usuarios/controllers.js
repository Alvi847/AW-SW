import { Usuario, UsuarioYaExiste } from './Usuario.js';
import { render } from '../utils/render.js';
import { validationResult, matchedData } from 'express-validator';
import { Receta } from '../receta/Receta.js';

export function viewLogin(req, res) {
    render(req, res, 'paginas/login', {
        datos: {},
        errores: {}
    });
}

export function viewHome(req, res) {
    return render(req, res, 'paginas/home');
}

export async function doLogin(req, res) {
    const result = validationResult(req);
    if (! result.isEmpty()) {
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
        const usuario = await Usuario.login(username, password);
        req.session.login = true;
        req.session.nombre = usuario.nombre;
        req.session.username = username; // Se tiene que guardar el nombre de usuario en la sesión, porque este es la clave identificativa
        req.session.rol = usuario.rol;

        res.setFlash(`Encantado de verte de nuevo: ${usuario.nombre}`);
        return render(req, res, 'paginas/home');

    } catch (e) {
        const datos = matchedData(req);
        req.log.warn("Problemas al hacer login del usuario '%s'", username);
        req.log.debug('El usuario %s, no ha podido logarse: %s', username, e.message);
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

export function viewRegistro(req, res) {
    render(req, res, 'paginas/registro', {
        datos: {},
        errores: {}
    });
}

export async function doRegistro(req, res) {
    const result = validationResult(req);
    if (! result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
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
        req.session.login = true;
        req.session.nombre = usuario.nombre;
        req.session.rol = usuario.rol;
        req.session.username = usuario.username;
        req.session.email = usuario.email;
        req.session.imagen = usuario.imagen;
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
        req.log.debug('El usuario no ha podido registrarse: %s', e);
        render(req, res, 'paginas/registro', {
            error,
            datos: {},
            errores: {}
        });
    }
}

export async function viewPerfil(req, res) {
  
    try {
        
        const usuario = await Usuario.getUsuarioByUsername(req.session.username);

        if (!usuario) {
            return res.redirect('/usuarios/login');  // Si no se encuentra el usuario, redirigir al login
        }

         render(req, res, 'paginas/verPerfil', { usuario });

    } catch (error) {
        console.error(error);
        render(req, res, 'paginas/perfil', {
            error: 'Hubo un problema al cargar tu perfil',
            usuario: {},
            errores: {}
        });
    }
}

export async function viewPerfilUser(req, res) {  // ver perfil de usuario concreto, pasado por params en url
    try {
        const { username } = req.params;

        const usuario = await Usuario.getUsuarioByUsername(username);
        if (!usuario) {
            return res.redirect('/usuarios/login');  // Si no se encuentra el usuario, redirigir al login
        }

        

        render(req, res, 'paginas/verPerfil', {
            usuario
        });

    } catch (error) {
        console.error(error);
        render(req, res, 'paginas/misRecetas', {
            error: 'Hubo un problema al cargar el perfil del usuario',
            usuario: {},
            errores: {}
        });
    }
}

export async function viewFavoritosUser(req, res) {
    const { username } = req.params;
  
    if (!username) {
      return render(req, res , 'paginas/error', { error: 'Usuario no encontrado' });
    }
    const usuario = await Usuario.getUsuarioByUsername(username);
    const recetas = await Receta.getFavoritosPorUsuario(username);
  
    render(req, res, 'paginas/misRecetas', {
        recetas,
        usuario
    });
}

export async function viewRecetasUser(req, res) {
    const { username } = req.params;
  
    try {
      const usuario = await Usuario.getUsuarioByUsername(username);
      if (!usuario) {
        return res.redirect('/usuarios/login');  // Si no se encuentra el usuario, redirigir al login
         }
  
      const recetas = await Receta.getRecetasPorUsuario(username);
  
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

export async function viewUpdatePerfil(req, res) {
    try {
        const usuario = await Usuario.getUsuarioByUsername(req.session.username);
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

export async function updatePerfil(req, res) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errores = result.mapped();
        const datos = matchedData(req);
        if(req.file)
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
        const usuario = await Usuario.getUsuarioByUsername(req.session.username);
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

        await usuario.persist();

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

export async function viewAdministrar(req, res) {
    try {
        const usuarios = Usuario.getAllUsuarios();
        render(req, res, 'paginas/administrar', { usuarios });
    } catch (error) {
        console.error(error);
        render(req, res, 'paginas/home', {
            error: 'No se pudo cargar la vista de administración'
        });
    }
}

export async function deleteUsuario(req, res) {
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

export async function cambiarRolUsuario(req, res) {
    const { username, rol } = req.body;

    if (!['U', 'A'].includes(rol)) {
        res.setFlash('Rol no válido');
        return res.redirect('/usuarios/administrar');
    }

    try {
        const usuario = await Usuario.getUsuarioByUsername(username);
        usuario.rol = rol;
        await usuario.persist();
        res.setFlash('Rol actualizado correctamente');
    } catch (error) {
        console.error(error);
        res.setFlash('No se pudo actualizar el rol');
    }

    return res.redirect('/usuarios/administrar');
}



  
