// FrontEnd/subir.js

const API_BASE = 'https://prueba-proyecto-repositorio-carrera.onrender.com';
const CLOUDINARY_CLOUD_NAME = 'dzl5pmsgc'; // ← CAMBIA AQUÍ por tu Cloud Name de Cloudinary

const form = document.getElementById('formProyecto');
const mensajeEl = document.getElementById('mensaje');

// Botones de toggle para editar/borrar
const btnToggleEditar = document.getElementById('btnToggleEditar');
const btnToggleBorrar = document.getElementById('btnToggleBorrar');

// Secciones de edición y borrado
const seccionEditar = document.getElementById('seccionEditar');
const seccionBorrar = document.getElementById('seccionBorrar');

// Elementos de EDICIÓN
const editTituloSearch = document.getElementById('editTituloSearch');
const btnCargarProyectoEditar = document.getElementById('btnCargarProyectoEditar');
const mensajeEditar = document.getElementById('mensajeEditar');
const formProyectoEditar = document.getElementById('formProyectoEditar');
const btnGuardarCambios = document.getElementById('btnGuardarCambios');
const mensajeGuardar = document.getElementById('mensajeGuardar');

// Elementos de BORRADO
const borrarTituloSearch = document.getElementById('borrarTituloSearch');
const btnCargarProyectoBorrar = document.getElementById('btnCargarProyectoBorrar');
const mensajeBorrarBusqueda = document.getElementById('mensajeBorrarBusqueda');
const tarjetaProyectoBorrar = document.getElementById('tarjetaProyectoBorrar');
const btnConfirmarBorrado = document.getElementById('btnConfirmarBorrado');
const mensajeBorrar = document.getElementById('mensajeBorrar');

// Variables de estado
let proyectoEditandoId = null;
let proyectoBorrandoId = null;
let archivosSubidos = { imagenes: [], videos: [] }; // Almacena URLs de Cloudinary

// ===== SUBIR ARCHIVOS A CLOUDINARY =====
async function subirArchivosACloudinary(files, tipo) {
  const urls = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned_preset'); // Sube sin autenticación (requiere config en Cloudinary)

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${tipo === 'imagenes' ? 'image' : 'video'}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!res.ok) {
        console.error(`Error subiendo ${file.name}:`, res.statusText);
        continue;
      }

      const data = await res.json();
      urls.push(data.secure_url); // URL pública del archivo
    } catch (err) {
      console.error(`Error con Cloudinary para ${file.name}:`, err);
    }
  }

  return urls;
}

// ===== ENVÍO DE NUEVA SOLICITUD DE ALTA =====
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensajeEl.textContent = 'Subiendo archivos...';

  const body = await construirBodyDesdeFormulario();
  if (!body.autorizacionLegal) {
    mensajeEl.textContent =
      'Debes aceptar la autorización legal para enviar el proyecto.';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/solicitudes/alta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      mensajeEl.textContent = 'Error al enviar la solicitud de alta.';
      return;
    }

    mensajeEl.textContent =
      'Solicitud enviada. El proyecto se publicará cuando sea aprobado por el gestor.';
    form.reset();
    archivosSubidos = { imagenes: [], videos: [] };
    proyectoEditandoId = null;
  } catch (err) {
    console.error(err);
    mensajeEl.textContent = 'Error de conexión con el servidor.';
  }
});

// ===== TOGGLE SECCIONES DE EDICIÓN/BORRADO =====
btnToggleEditar.addEventListener('click', () => {
  seccionEditar.style.display =
    seccionEditar.style.display === 'none' ? 'block' : 'none';
  seccionBorrar.style.display = 'none';
  formProyectoEditar.style.display = 'none';
  mensajeEditar.textContent = '';
});

btnToggleBorrar.addEventListener('click', () => {
  seccionBorrar.style.display =
    seccionBorrar.style.display === 'none' ? 'block' : 'none';
  seccionEditar.style.display = 'none';
  formProyectoEditar.style.display = 'none';
  tarjetaProyectoBorrar.style.display = 'none';
  mensajeBorrarBusqueda.textContent = '';
});

// ===== BUSCAR PROYECTO PARA EDITAR =====
btnCargarProyectoEditar.addEventListener('click', async () => {
  const tituloBuscado = editTituloSearch.value.trim();
  if (!tituloBuscado) {
    mensajeEditar.textContent = 'Introduce el título del proyecto';
    mensajeEditar.style.color = '#dc3545';
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/proyectos/buscar-por-titulo/${encodeURIComponent(
        tituloBuscado
      )}`
    );

    if (!res.ok) {
      mensajeEditar.textContent = 'Proyecto no encontrado';
      mensajeEditar.style.color = '#dc3545';
      return;
    }

    const p = await res.json();
    proyectoEditandoId = p._id;

    // Rellenar formulario de edición
    document.getElementById('editTitulo').value = p.titulo || '';
    document.getElementById('editDescripcion').value = p.descripcion || '';
    document.getElementById('editAsignatura').value = p.asignatura || '';
    document.getElementById('editAutores').value = (p.autores || []).join(', ');
    document.getElementById('editEnlaceExterno').value = p.enlaceExterno || '';
    document.getElementById('editCurso').value = p.curso || '';
    document.getElementById('editAnio').value = p.anio || '';
    document.getElementById('editLicencia').value = p.licencia || '';
    document.querySelector('input[name="autorizacionLegal"]').checked =
      !!p.autorizacionLegal;

    formProyectoEditar.style.display = 'block';
    mensajeEditar.textContent = 'Proyecto cargado. Modifica los datos que desees.';
    mensajeEditar.style.color = '#155724';
  } catch (err) {
    console.error(err);
    mensajeEditar.textContent = 'Error al cargar el proyecto';
    mensajeEditar.style.color = '#dc3545';
  }
});

// ===== GUARDAR CAMBIOS DE EDICIÓN =====
btnGuardarCambios.addEventListener('click', async () => {
  if (!proyectoEditandoId) {
    mensajeGuardar.textContent = 'Primero carga un proyecto';
    mensajeGuardar.style.color = '#dc3545';
    return;
  }

  mensajeGuardar.textContent = 'Subiendo archivos...';

  const body = await construirBodyDesdeFormularioEditar();
  if (!body.autorizacionLegal) {
    mensajeGuardar.textContent =
      'Debes aceptar la autorización legal para guardar cambios.';
    mensajeGuardar.style.color = '#dc3545';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/proyectos/${proyectoEditandoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      mensajeGuardar.textContent = 'Error al guardar cambios.';
      mensajeGuardar.style.color = '#dc3545';
      return;
    }

    mensajeGuardar.textContent = 'Proyecto actualizado correctamente.';
    mensajeGuardar.style.color = '#155724';
  } catch (err) {
    console.error(err);
    mensajeGuardar.textContent = 'Error de conexión.';
    mensajeGuardar.style.color = '#dc3545';
  }
});

// ===== BUSCAR PROYECTO PARA BORRAR =====
btnCargarProyectoBorrar.addEventListener('click', async () => {
  const tituloBuscado = borrarTituloSearch.value.trim();
  if (!tituloBuscado) {
    mensajeBorrarBusqueda.textContent = 'Introduce el título del proyecto';
    mensajeBorrarBusqueda.style.color = '#dc3545';
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/proyectos/buscar-por-titulo/${encodeURIComponent(
        tituloBuscado
      )}`
    );

    if (!res.ok) {
      mensajeBorrarBusqueda.textContent = 'Proyecto no encontrado';
      mensajeBorrarBusqueda.style.color = '#dc3545';
      tarjetaProyectoBorrar.style.display = 'none';
      return;
    }

    const p = await res.json();
    proyectoBorrandoId = p._id;

    // Mostrar tarjeta del proyecto
    document.getElementById('borrarTituloProyecto').textContent = p.titulo;
    document.getElementById('borrarAsignatura').textContent = p.asignatura;
    document.getElementById('borrarAutores').textContent = (p.autores || []).join(', ');
    document.getElementById('borrarDescripcion').textContent = p.descripcion;

    tarjetaProyectoBorrar.style.display = 'block';
    mensajeBorrarBusqueda.textContent = 'Proyecto encontrado. Revísalo y confirma si deseas borrarlo.';
    mensajeBorrarBusqueda.style.color = '#155724';
  } catch (err) {
    console.error(err);
    mensajeBorrarBusqueda.textContent = 'Error al cargar el proyecto';
    mensajeBorrarBusqueda.style.color = '#dc3545';
  }
});

// ===== CONFIRMAR BORRADO =====
btnConfirmarBorrado.addEventListener('click', async () => {
  if (!proyectoBorrandoId) {
    mensajeBorrar.textContent = 'Error: no hay proyecto seleccionado';
    mensajeBorrar.style.color = '#dc3545';
    return;
  }

  if (!confirm('¿Estás seguro? Esta acción no se puede deshacer.')) return;

  try {
    const res = await fetch(`${API_BASE}/proyectos/${proyectoBorrandoId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      mensajeBorrar.textContent = 'Error al eliminar el proyecto.';
      mensajeBorrar.style.color = '#dc3545';
      return;
    }

    mensajeBorrar.textContent = 'Solicitud de borrado enviada. Se eliminará cuando sea procesada.';
    mensajeBorrar.style.color = '#155724';
    tarjetaProyectoBorrar.style.display = 'none';
    borrarTituloSearch.value = '';
    proyectoBorrandoId = null;
  } catch (err) {
    console.error(err);
    mensajeBorrar.textContent = 'Error de conexión.';
    mensajeBorrar.style.color = '#dc3545';
  }
});

// ===== FUNCIONES AUXILIARES =====
async function construirBodyDesdeFormulario() {
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
    ? autoresTexto
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean)
    : [];

  // Procesar imágenes y videos
  const imagenes = formData.getAll('imagenes');
  const videos = formData.getAll('videos');

  let urlsImagenes = [];
  let urlsVideos = [];

  if (imagenes.length > 0) {
    urlsImagenes = await subirArchivosACloudinary(imagenes, 'imagenes');
  }

  if (videos.length > 0) {
    urlsVideos = await subirArchivosACloudinary(videos, 'videos');
  }

  return {
    titulo,
    descripcion,
    asignatura,
    autores,
    enlaceExterno,
    imagenes: urlsImagenes,
    videos: urlsVideos,
    curso,
    anio: anioTexto ? Number(anioTexto) : undefined,
    licencia,
    autorizacionLegal,
  };
}

async function construirBodyDesdeFormularioEditar() {
  const titulo = document.getElementById('editTitulo').value.trim();
  const descripcion = document.getElementById('editDescripcion').value.trim();
  const asignatura = document.getElementById('editAsignatura').value.trim();
  const autoresTexto = document.getElementById('editAutores').value.trim();
  const enlaceExterno = document.getElementById('editEnlaceExterno').value.trim();
  const curso = document.getElementById('editCurso').value.trim();
  const anioTexto = document.getElementById('editAnio').value.trim();
  const licencia = document.getElementById('editLicencia').value.trim();
  const autorizacionLegal = document.querySelector('input[name="autorizacionLegal"]').checked;

  const autores = autoresTexto
    ? autoresTexto
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean)
    : [];

  // Procesar imágenes y videos si hay nuevas
  const imagenes = document.getElementById('imagenes').files;
  const videos = document.getElementById('videos').files;

  let urlsImagenes = archivosSubidos.imagenes;
  let urlsVideos = archivosSubidos.videos;

  if (imagenes.length > 0) {
    urlsImagenes = await subirArchivosACloudinary(Array.from(imagenes), 'imagenes');
  }

  if (videos.length > 0) {
    urlsVideos = await subirArchivosACloudinary(Array.from(videos), 'videos');
  }

  return {
    titulo,
    descripcion,
    asignatura,
    autores,
    enlaceExterno,
    imagenes: urlsImagenes,
    videos: urlsVideos,
    curso,
    anio: anioTexto ? Number(anioTexto) : undefined,
    licencia,
    autorizacionLegal,
  };
}
