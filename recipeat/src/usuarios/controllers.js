import { body } from 'express-validator';
import { Usuario, RolesEnum, UsuarioNoEncontrado} from './Usuario.js';

export function viewLogin(req, res) {
    let contenido = 'paginas/login';
    if (req.session != null && req.session.login) {
        contenido = 'paginas/home'
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
}

export function doLogin(req, res) {
    body('username').escape();
    body('password').escape();
    // Capturo las variables username y password
    const username = req.body.username.trim();
    const password = req.body.password.trim();

    try {
        const usuario = Usuario.login(username, password);
        req.session.login = true;
        req.session.nombre = usuario.nombre;
        req.session.username = usuario.username;    //!guardamos la informacion de username 
        req.session.esAdmin = usuario.rol === RolesEnum.ADMIN;

        return res.render('pagina', {
            contenido: 'paginas/home',
            session: req.session
        });

    } catch (e) {
        res.render('pagina', {
            contenido: 'paginas/login',
            error: 'El usuario o contraseña no son válidos'
        })
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
    req.session.esAdmin = null;
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

//!2 nuevas funciones (register)

//* *ver interfaz de registro
export function viewRegister(req, res)
{
    let contenido = 'paginas/register';
    if (req.session != null && req.session.login) {
        contenido = 'paginas/home'
    }
    res.render('pagina', {
        contenido,
        session: req.session
    });
}

//* *recopilar datos del usuario
export function doRegister(req, res)
{
     // Sanitizar los datos de entrada
     body('username').escape();
     body("nombre").escape();
     body('email').escape();
     body('password').escape();
 
     //*3 parametros que se piden al usuario
     const username = req.body.username.trim(); //*nombre de usuario
     const nombre = req.body.nombre.trim();     //*nombre
     const email = req.body.email.trim();       //*correo electronico
     const password = req.body.password.trim(); //*password
 
    //! Expresión regular para validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@(gmail\.com|hotmail\.com|yahoo\.com|gmail\.es|yahoo\.es|hotmail\.es)$/;

     // Validar que los campos no estén vacíos
     if (!username || !email || !password || !nombre) {
         return res.render('pagina', {
             contenido: 'paginas/register',
             error: 'Todos los campos son obligatorios'
         });
     }

    // Validar que el email tenga un formato válido
    if (!emailRegex.test(email)) {
        return res.render('pagina', {
            contenido: 'paginas/register',
            error: 'El correo electrónico no tiene un formato válido'
        });
    }
 
     try {
         // Verificar si el usuario ya existe
         try {
             Usuario.getUsuarioByUsername(username);
             return res.render('pagina', {
                 contenido: 'paginas/register',
                 error: 'El usuario ya existe'
             });
         } catch (e) {
             if (!(e instanceof UsuarioNoEncontrado)) {
                 throw e; // Si es otro error, lo lanzamos
             }
         }
 
         // Crear un nuevo usuario
         const nuevoUsuario = new Usuario(username, password, nombre, email, "U", null);  //!rol de usuario(U) por defecto
         nuevoUsuario.password = password; // Esto hashea la contraseña
         nuevoUsuario.persist();    //*insertar usuario en la base de datos
  
         //*redireccionar al usuario a la pagina login
         return res.render('pagina', {
             contenido: 'paginas/login',
             session: req.session
         });
 
     } catch (e) {
         return res.render('pagina', {
             contenido: 'paginas/register',
             error: 'Error al registrar el usuario'
         });
     }
}