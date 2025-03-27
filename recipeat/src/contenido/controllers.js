import { render } from '../utils/render.js';

export function viewContenidoNormal(req, res) {
    render(req, res, 'paginas/normal');
}

export function viewContenidoAdmin(req, res) {
    render(req, res, 'paginas/admin');
}