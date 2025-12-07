const API_BASE = 'https://prueba-proyecto-repositorio-carrera.onrender.com';

const form = document.getElementById('formProyecto');
const mensajeEl = document.getElementById('mensaje');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensajeEl.textContent = '';

  const formData = new FormData(form);

  const titulo = formData.get('titulo').trim();
  const descripcion = formData.get('descripcion').trim();
  const asignatura = formData.get('asignatura').trim();
  const autoresTexto = formData.get('autores').trim();
  const enlaceExterno = formData.get('enlaceExterno').trim();
  const curso = formData.get('curso').trim();

  const autores = autoresTexto
    ? autoresTexto.split(',').map((a) => a.trim()).filter(Boolean)
    : [];

  const body = {
    titulo,
    descripcion,
    asignatura,
    autores,
    enlaceExterno,
    imagenes: [],
    videos: [],
    curso,
  };

  try {
    const res = await fetch(`${API_BASE}/proyectos/solicitud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      mensajeEl.textContent = 'Error al enviar el proyecto.';
      return;
    }

    mensajeEl.textContent = 'Proyecto enviado. Quedará pendiente de aprobación.';
    form.reset();
  } catch (err) {
    console.error(err);
    mensajeEl.textContent = 'Error de conexión con el servidor.';
  }
});
