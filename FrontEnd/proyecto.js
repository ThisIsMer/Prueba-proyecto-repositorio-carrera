const API_BASE = 'https://prueba-proyecto-repositorio-carrera.onrender.com';


const tituloEl = document.getElementById('titulo');
const asignaturaEl = document.getElementById('asignatura');
const autoresEl = document.getElementById('autores');
const descripcionEl = document.getElementById('descripcion');
const enlaceExternoEl = document.getElementById('enlaceExterno');

// Leer el id de la URL: proyecto.html?id=XXXX
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

if (!id) {
  document.body.innerHTML = '<p>Falta el id del proyecto.</p>';
} else {
  cargarProyecto(id);
}

async function cargarProyecto(id) {
  try {
    const res = await fetch(`${API_BASE}/proyectos/${id}`);
    if (!res.ok) {
      document.body.innerHTML = '<p>Proyecto no encontrado.</p>';
      return;
    }
    const p = await res.json();

    tituloEl.textContent = p.titulo;
    asignaturaEl.textContent = p.asignatura;
    autoresEl.textContent = p.autores.join(', ');
    descripcionEl.textContent = p.descripcion;

    if (p.enlaceExterno) {
      enlaceExternoEl.href = p.enlaceExterno;
      enlaceExternoEl.textContent = p.enlaceExterno;
    } else {
      enlaceExternoEl.textContent = 'No disponible';
      enlaceExternoEl.removeAttribute('href');
    }
  } catch (err) {
    console.error(err);
    document.body.innerHTML = '<p>Error al cargar el proyecto.</p>';
  }
}
