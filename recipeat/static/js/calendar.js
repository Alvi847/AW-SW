document.addEventListener("DOMContentLoaded", async function () {
    const calendarEl = document.getElementById("calendar");
    let eventoSeleccionado = null;

    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      locale: "es",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek",
      },
      events: async function (info, successCallback, failureCallback) {
        try {
          const res = await fetch(`/eventos/${USERNAME}`);
          const data = await res.json();

          const eventos = data.map((e) => ({
            id: e.id,
            title: e.titulo,
            start: e.fecha,
            descripcion: e.descripcion,
          }));

          successCallback(eventos);
        } catch (err) {
          console.error("Error al cargar eventos:", err);
          failureCallback(err);
        }
      },
      eventClick: function (info) {
        const event = info.event;
        eventoSeleccionado = event;

        if (window.activeTippy) window.activeTippy.destroy();

        const content = document.createElement("div");
        content.innerHTML = `
  <div style="padding: 14px 16px; max-width: 300px; font-family: 'Montserrat', sans-serif;">
    <h3 style="margin: 0; font-size: 18px; color: #ffbd3a;">${event.title}</h3>
    <p style="margin: 8px 0 4px; font-size: 14px; color: #ccc;">${event.extendedProps.descripcion || "Sin descripción"}</p>
    <p style="margin: 0 0 12px; font-size: 13px; color: #888;">📅 ${new Date(event.start).toLocaleDateString("es-ES")}</p>
    <div style="display: flex; justify-content: flex-end; gap: 10px;">
      <button id="tippyEditar" class="popup-btn editar">✏️ Editar</button>
      <button id="tippyEliminar" class="popup-btn eliminar">🗑️ Eliminar</button>
    </div>
  </div>
`;


        const tip = tippy(info.el, {
          content,
          allowHTML: true,
          interactive: true,
          placement: 'right',
          trigger: 'manual',
          appendTo: document.body,
          theme: 'light-border',
          arrow: true,
          onHidden() {
            tip.destroy();
            window.activeTippy = null;
          }
        });

        tip.show();
        window.activeTippy = tip;

        content.querySelector("#tippyEliminar").addEventListener("click", async () => {
          if (confirm("¿Seguro que quieres eliminar este evento?")) {
            const res = await fetch(`/eventos/${event.id}`, { method: "DELETE" });
            if (res.ok) {
              calendar.refetchEvents();
              tip.hide();
            } else {
              alert("Error al eliminar");
            }
          }
        });

        content.querySelector("#tippyEditar").addEventListener("click", () => {
          document.getElementById("editId").value = event.id;
          document.getElementById("editTitulo").value = event.title;
          document.getElementById("editFecha").value = event.startStr;
          document.getElementById("editDescripcion").value = event.extendedProps.descripcion || "";
          document.getElementById("editModal").classList.remove("hidden");
          tip.hide();
        });
      }
    });

    calendar.render();

    const editForm = document.getElementById("editForm");
    if (editForm) {
      editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = document.getElementById("editId").value;
        const titulo = document.getElementById("editTitulo").value;
        const fecha = document.getElementById("editFecha").value;
        const descripcion = document.getElementById("editDescripcion").value;

        try {
          const res = await fetch(`/eventos/actualizar`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id, titulo, fecha, descripcion }),
          });

          if (res.ok) {
            alert("Evento actualizado");
            calendar.refetchEvents();
            document.getElementById("editModal").classList.add("hidden");
          } else {
            alert("No se pudo actualizar");
          }
        } catch (err) {
          console.error(err);
          alert("Error de red");
        }
      });
    }
  });