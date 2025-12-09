// admin/admin.js

const API_BASE = 'https://prueba-proyecto-repositorio-carrera.onrender.com';
const ADMIN_PASSWORD = 'RrQStisYsVv3appu'; // Cambiar a contraseña real
const solicitudesContainer = document.getElementById('solicitudesContainer');

let solicitudes = [];

// ===== AUTENTICACIÓN SIMPLE =====
function verificarAdmin() {
  const password = prompt('Introduce la contraseña de administrador:');
  if (password !== ADMIN_PASSWORD) {
    alert('Contraseña incorrecta');
    window.location.href = '../index.html';
    return false;
  }
  return true;
}

// ===== CARGAR SOLICITUDES AL ABRIR LA PÁGINA =====
document.addEventListener('DOMContentLoaded', async () => {
  if (!verificarAdmin()) return;

  await cargarSolicitudesPendientes();
});

// ===== FUNCIÓN: CARGAR SOLICITUDES PENDIENTES =====
async function cargarSolicitudesPendientes() {
  try {
    const res = await fetch(`${API_BASE}/solicitudes?estado=pendiente`);
    if (!res.ok) {
      solicitudesContainer.innerHTML =
        '<p style="color: #dc3545;">Error al cargar las solicitudes.</p>';
      return;
    }

    solicitudes = await res.json();

    if (solicitudes.length === 0) {
      solicitudesContainer.innerHTML =
        '<p style="color: #28a745;">No hay solicitudes pendientes.</p>';
      return;
    }

    mostrarSolicitudes();
  } catch (err) {
    console.error('Error:', err);
    solicitudesContainer.innerHTML =
      '<p style="color: #dc3545;">Error de conexión.</p>';
  }
}

// ===== FUNCIÓN: MOSTRAR SOLICITUDES EN TARJETAS =====
function mostrarSolicitudes() {
  solicitudesContainer.innerHTML = '';

  solicitudes.forEach((solicitud) => {
    const datos = solicitud.datosPropuesto;
    const tipoTexto = getTipoTexto(solicitud.tipo);
    const card = document.createElement('div');
    card.className = 'card';
    card.style.marginBottom = '16px';

    let contenidoHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div style="flex: 1;">
          <h3 style="margin-top: 0;">${tipoTexto}: ${datos.titulo || 'Sin título'}</h3>
          <p><strong>Solicitud ID:</strong> ${solicitud._id}</p>
          <p><strong>Tipo:</strong> ${solicitud.tipo}</p>
          <p><strong>Enviada:</strong> ${new Date(solicitud.createdAt).toLocaleString('es-ES')}</p>
        </div>
      </div>

      <hr style="margin: 12px 0;" />

      <h4>Detalles del proyecto</h4>

      <p><strong>Título:</strong> ${datos.titulo || '-'}</p>
      <p><strong>Asignatura:</strong> ${datos.asignatura || '-'}</p>
      <p><strong>Autores:</strong> ${(datos.autores || []).join(', ') || '-'}</p>
      <p><strong>Curso:</strong> ${datos.curso || '-'}</p>
      <p><strong>Año de creación:</strong> ${datos.anio || '-'}</p>
      <p><strong>Licencia:</strong> ${datos.licencia || '-'}</p>
      <p><strong>Enlace externo:</strong> ${datos.enlaceExterno ? `<a href="${datos.enlaceExterno}" target="_blank">${datos.enlaceExterno}</a>` : '-'}</p>

      <p><strong>Descripción:</strong></p>
      <p>${datos.descripcion || '-'}</p>
    `;

    // Mostrar imágenes
    if (datos.imagenes && datos.imagenes.length > 0) {
      contenidoHTML += '<p><strong>Imágenes:</strong></p>';
      datos.imagenes.forEach((url) => {
        contenidoHTML += `<img src="${url}" alt="Imagen del proyecto" style="max-width: 100%; height: auto; margin: 8px 0; border-radius: 6px; max-height: 300px;" />`;
      });
    }

    // Mostrar videos
    if (datos.videos && datos.videos.length > 0) {
      contenidoHTML += '<p><strong>Videos:</strong></p>';
      datos.videos.forEach((url) => {
        contenidoHTML += `
          <video width="100%" height="auto" style="margin: 8px 0; border-radius: 6px; max-height: 300px;" controls>
            <source src="${url}" type="video/mp4">
            Tu navegador no soporta videos.
          </video>
        `;
      });
    }

    contenidoHTML += `
      <hr style="margin: 12px 0;" />

      <div style="display: flex; gap: 8px;">
        <button type="button" class="btn-aprobar" data-id="${solicitud._id}">
          ✓ Aprobar
        </button>
        <button type="button" class="btn-rechazar" data-id="${solicitud._id}">
          ✗ Denegar
        </button>
      </div>
      <p class="mensaje-solicitud" style="margin-top: 8px; display: none;"></p>
    `;

    card.innerHTML = contenidoHTML;
    solicitudesContainer.appendChild(card);
  });

  // Añadir listeners a los botones
  document.querySelectorAll('.btn-aprobar').forEach((btn) => {
    btn.addEventListener('click', () => aprobarSolicitud(btn.dataset.id));
  });

  document.querySelectorAll('.btn-rechazar').forEach((btn) => {
    btn.addEventListener('click', () => rechazarSolicitud(btn.dataset.id));
  });
}

// ===== FUNCIÓN: OBTENER TEXTO DEL TIPO DE SOLICITUD =====
function getTipoTexto(tipo) {
  const tipos = {
    alta: 'Nuevo proyecto',
    edicion: 'Edición de proyecto',
    borrado: 'Borrado de proyecto',
  };
  return tipos[tipo] || tipo;
}

// ===== FUNCIÓN: APROBAR SOLICITUD =====
async function aprobarSolicitud(solicitudId) {
  try {
    const res = await fetch(`${API_BASE}/solicitudes/${solicitudId}/aprobar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      alert('Error al aprobar la solicitud');
      return;
    }

    alert('Solicitud aprobada correctamente');
    await cargarSolicitudesPendientes();
  } catch (err) {
    console.error('Error:', err);
    alert('Error de conexión');
  }
}

// ===== FUNCIÓN: RECHAZAR SOLICITUD =====
async function rechazarSolicitud(solicitudId) {
  const motivo = prompt('¿Por qué rechazas esta solicitud?');
  if (!motivo) return;

  try {
    const res = await fetch(`${API_BASE}/solicitudes/${solicitudId}/rechazar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo }),
    });

    if (!res.ok) {
      alert('Error al rechazar la solicitud');
      return;
    }

    alert('Solicitud rechazada');
    await cargarSolicitudesPendientes();
  } catch (err) {
    console.error('Error:', err);
    alert('Error de conexión');
  }
}
