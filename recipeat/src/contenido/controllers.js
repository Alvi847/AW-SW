//!como funciona (NAV)
export function viewContenidoNormal(req, res) {
    let contenido = 'paginas/normal';

    res.render('pagina', {
        contenido,
        session: req.session,
    });
}

export function viewContenidoAdmin(req, res) {
    let contenido = 'paginas/noPermisos';
    if (req.session != null && req.session.login && req.session.nombre === 'Administrador') {
        contenido = 'paginas/admin';
    }
    res.render('pagina', {
        contenido,
        session: req.session,
    });
}