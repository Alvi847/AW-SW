export function redirige(req, res, next, url = '/usuarios/login') {
    return res.redirect(url);
}