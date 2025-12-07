const API_BASE = 'https://prueba-proyecto-repositorio-carrera.onrender.com';


const listaProyectos = document.getElementById('listaProyectos');
const filtroAsignatura = document.getElementById('filtroAsignatura');
const filtroCurso = document.getElementById('filtroCurso');
const filtroTexto = document.getElementById('filtroTexto');
const btnFiltrar = document.getElementById('btnFiltrar');
const btnLimpiar = document.getElementById('btnLimpiar');

let proyectosTodos = [];

// Cargar proyectos al abrir la página
window.addEventListener('DOMContentLoaded', cargarProyectos);

async function cargarProyectos() {
  try {
    const res = await fetch(`${API_BASE}/proyectos`);
    const proyectos = await res.json();
    proyectosTodos = proyectos;
    pintarProyectos(proyectosTodos);
  } catch (err) {
    console.error(err);
    listaProyectos.innerHTML = '<p>Error al cargar proyectos.</p>';
  }
}

function pintarProyectos(proyectos) {
  if (proyectos.length === 0) {
    listaProyectos.innerHTML = '<p>No hay proyectos para mostrar.</p>';
    return;
  }

  listaProyectos.innerHTML = '';

  proyectos.forEach((p) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.style.margin = '8px 0';
    div.style.padding = '8px';

    div.innerHTML = `
      <h3>${p.titulo}</h3>
      <p><strong>Asignatura:</strong> ${p.asignatura}</p>
      <p><strong>Autores:</strong> ${p.autores.join(', ')}</p>
      <a href="proyecto.html?id=${p._id}">Ver detalle</a>
    `;

    listaProyectos.appendChild(div);
  });
}

// Filtro simple por asignatura
btnFiltrar.addEventListener('click', () => {
  const asig = filtroAsignatura.value.trim().toLowerCase();
  const curso = filtroCurso.value.trim().toLowerCase();
  const texto = filtroTexto.value.trim().toLowerCase();

  const filtrados = proyectosTodos.filter((p) => {
    const okAsig = !asig || p.asignatura.toLowerCase().includes(asig);
    const okCurso = !curso || (p.curso && p.curso.toLowerCase().includes(curso));
    const enTitulo = p.titulo.toLowerCase().includes(texto);
    const enDesc = p.descripcion.toLowerCase().includes(texto);
    const okTexto = !texto || enTitulo || enDesc;
    return okAsig && okCurso && okTexto;
  });

  pintarProyectos(filtrados);
});

btnLimpiar.addEventListener('click', () => {
  filtroAsignatura.value = '';
  filtroCurso.value = '';
  filtroTexto.value = '';
  pintarProyectos(proyectosTodos);
});
