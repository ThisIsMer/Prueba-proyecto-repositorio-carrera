const API_BASE = 'https://prueba-proyecto-repositorio-carrera.onrender.com';

const form = document.getElementById('formProyecto');
const mensajeEl = document.getElementById('mensaje');

// Elementos para edición por título
const editTituloInput = document.getElementById('editTitulo');
const btnCargarProyecto = document.getElementById('btnCargarProyecto');
const btnGuardarCambios = document.getElementById('btnGuardarCambios');
const btnBorrarProyecto = document.getElementById('btnBorrarProyecto');

// Guardamos el _id real del proyecto cargado para poder actualizar/borrar
let proyectoEditandoId = null;

// ---------------------
// Enviar nuevo proyecto
// ---------------------
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensajeEl.textContent = '';

  const body = construirBodyDesdeFormulario();
  if (!body.autorizacionLegal) {
    mensajeEl.textContent = 'Debes aceptar la autorización legal para enviar el proyecto.';
    return;
  }

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
    proyectoEditandoId = null;
  } catch (err) {
    console.error(err);
    mensajeEl.textContent = 'Error de conexión con el servidor.';
  }
});

// ---------------------
// Cargar proyecto por título
// ---------------------
btnCargarProyecto.addEventListener('click', async () => {
  const tituloBuscado = editTituloInput.value.trim();
  if (!tituloBuscado) {
    alert('Introduce el título del proyecto');
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/proyectos/buscar-por-titulo/${encodeURIComponent(tituloBuscado)}`
    );

    if (!res.ok) {
      alert('Proyecto no encontrado');
      return;
    }

    const p = await res.json();
    proyectoEditandoId = p._id;

    // Rellenar el formulario con los datos existentes
    form.elements['titulo'].value = p.titulo || '';
    form.elements['descripcion'].value = p.descripcion || '';
    form.elements['asignatura'].value = p.asignatura || '';
    form.elements['autores'].value = (p.autores || []).join(', ');
    form.elements['enlaceExterno'].value = p.enlaceExterno || '';
    form.elements['curso'].value = p.curso || '';
    form.elements['anio'].value = p.anio || '';
    form.elements['licencia'].value = p.licencia || '';
    form.elements['autorizacionLegal'].checked = !!p.autorizacionLegal;

    mensajeEl.textContent = 'Proyecto cargado. Ahora puedes modificar y guardar cambios.';
  } catch (err) {
    console.error(err);
    alert('Error al cargar el proyecto');
  }
});

// ---------------------
// Guardar cambios en proyecto cargado
// ---------------------
btnGuardarCambios.addEventListener('click', async () => {
  if (!proyectoEditandoId) {
    alert('Primero carga un proyecto por título');
    return;
  }

  const body = construirBodyDesdeFormulario();
  if (!body.autorizacionLegal) {
    mensajeEl.textContent = 'Debes aceptar la autorización legal para guardar cambios.';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/proyectos/${proyectoEditandoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      mensajeEl.textContent = 'Error al guardar cambios.';
      return;
    }

    mensajeEl.textContent = 'Proyecto actualizado correctamente.';
  } catch (err) {
    console.error(err);
    mensajeEl.textContent = 'Error de conexión al actualizar.';
  }
});

// ---------------------
// Eliminar proyecto cargado
// ---------------------
btnBorrarProyecto.addEventListener('click', async () => {
  if (!proyectoEditandoId) {
    alert('Primero carga un proyecto por título');
    return;
  }

  if (!confirm('¿Seguro que quieres eliminar este proyecto?')) return;

  try {
    const res = await fetch(`${API_BASE}/proyectos/${proyectoEditandoId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      mensajeEl.textContent = 'Error al eliminar el proyecto.';
      return;
    }

    mensajeEl.textContent = 'Proyecto eliminado.';
    form.reset();
    proyectoEditandoId = null;
  } catch (err) {
    console.error(err);
    mensajeEl.textContent = 'Error de conexión al eliminar.';
  }
});

// ---------------------
// Función común: leer el formulario
// ---------------------
function construirBodyDesdeFormulario() {
  const formData = new FormData(form);

  const titulo = formData.get('titulo').trim();
  const descripcion = formData.get('descripcion').trim();
  const asignatura = formData.get('asignatura').trim();
  const autoresTexto = formData.get('autores').trim();
  const enlaceExterno = formData.get('enlaceExterno').trim();
  const curso = formData.get('curso').trim();
  const anioTexto = formData.get('anio').trim();
  const licencia = formData.get('licencia').trim();
  const autorizacionLegal = formData.get('autorizacionLegal') === 'on';

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
    anio: anioTexto ? Number(anioTexto) : undefined,
    licencia,
    autorizacionLegal,
  };

  return body;
}
