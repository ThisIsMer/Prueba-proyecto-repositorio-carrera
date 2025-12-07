const API_BASE = 'http://localhost:5000';

const passwordInput = document.getElementById('adminPassword');
const btnCargar = document.getElementById('btnCargar');
const listaPendientes = document.getElementById('listaPendientes');

// Cargar proyectos pendientes al hacer clic
btnCargar.addEventListener('click', async () => {
  const password = passwordInput.value.trim();
  if (!password) {
    alert('Introduce la contraseña de admin');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/admin/proyectos-pendientes`, {
      headers: {
        'x-admin-password': password,
      },
    });

    if (!res.ok) {
      alert('Contraseña incorrecta o error al obtener proyectos');
      return;
    }

    const proyectos = await res.json();
    pintarProyectos(proyectos, password);
  } catch (err) {
    console.error(err);
    alert('Error de conexión con el servidor');
  }
});

// Pintar proyectos en la página
function pintarProyectos(proyectos, password) {
  if (proyectos.length === 0) {
    listaPendientes.innerHTML = '<p>No hay proyectos pendientes.</p>';
    return;
  }

  listaPendientes.innerHTML = '';

  proyectos.forEach((p) => {
    const div = document.createElement('div');
    div.style.border = '1px solid #ccc';
    div.style.margin = '8px 0';
    div.style.padding = '8px';

    div.innerHTML = `
      <h3>${p.titulo}</h3>
      <p><strong>Asignatura:</strong> ${p.asignatura}</p>
      <p><strong>Autores:</strong> ${p.autores.join(', ')}</p>
      <p><strong>Descripción:</strong> ${p.descripcion}</p>
      <button data-id="${p._id}">Aprobar</button>
    `;

    const btnAprobar = div.querySelector('button');
    btnAprobar.addEventListener('click', () => aprobarProyecto(p._id, password));

    listaPendientes.appendChild(div);
  });
}

// Llamar a la API para aprobar
async function aprobarProyecto(id, password) {
  if (!confirm('¿Seguro que quieres aprobar este proyecto?')) return;

  try {
    const res = await fetch(`${API_BASE}/admin/proyectos/${id}/aprobar`, {
      method: 'POST',
      headers: {
        'x-admin-password': password,
      },
    });

    if (!res.ok) {
      alert('Error al aprobar el proyecto');
      return;
    }

    alert('Proyecto aprobado');
    // Volver a cargar la lista
    btnCargar.click();
  } catch (err) {
    console.error(err);
    alert('Error de conexión con el servidor');
  }
}
