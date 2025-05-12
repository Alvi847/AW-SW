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

export async function eliminarEventoUsuario(req, res) {
  try {
    const { id } = req.params;
    const user = req.session.username;

    const result = Evento.eliminarEvento(id, user);

    if (result.changes > 0) {
      res.json({ ok: true });
    } else {
      res.status(404).json({ error: 'Evento no encontrado o no autorizado' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
}

export async function actualizarEventoUsuario(req, res) {
  try {
    const { id, titulo, fecha, descripcion } = req.body;
    await Evento.actualizarEvento({ id, titulo, fecha, descripcion, user: req.session.username });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
}

