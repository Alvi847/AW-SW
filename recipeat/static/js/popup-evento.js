document.getElementById("formEvento")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();
    const fecha = document.getElementById("fecha").value;
    const descripcion = document.getElementById("descripcion").value.trim();

    if (!titulo || !fecha) return alert("Título y fecha son obligatorios");

    try {
      const res = await fetch("/eventos/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ titulo, fecha, descripcion }),
      });

      if (res.ok) {
        alert("Evento creado correctamente");
        location.reload(); // o calendar.refetchEvents();
      } else {
        alert("Error al crear evento");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red");
    }
  });