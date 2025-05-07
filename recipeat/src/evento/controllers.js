import { Evento } from './Evento.js';

export async function getEventosUsuario(req, res) {
  try {
    const eventos = await Evento.obtenerEventosPorUsuario(req.params.username); // <-- await añadido
    res.json(eventos);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
}

export async function crearEventoUsuario(req, res) {
  try {
    const { titulo, fecha, descripcion } = req.body;
    await Evento.crearEvento({ // <-- await añadido
      titulo,
      fecha,
      descripcion,
      user: req.session.username,
    });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al crear evento' });
  }
}
