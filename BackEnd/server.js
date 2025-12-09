// BackEnd/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Importar modelos
const Proyecto = require('./models/Proyecto');
const Solicitud = require('./models/Solicitud');

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
const mongoUri = process.env.MONGODB_URI;
const adminPassword = process.env.ADMIN_PASSWORD;

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error al conectar a MongoDB:', err));

// ============================================
// RUTAS RAÍZ
// ============================================
app.get('/', (req, res) => {
  res.json({ mensaje: 'API del repositorio funcionando' });
});

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// ============================================
// RUTAS DE PROYECTOS
// ============================================

// GET /proyectos - Listar todos los proyectos aprobados
app.get('/proyectos', async (req, res) => {
  try {
    const proyectos = await Proyecto.find({ aprobado: true }).sort({
      createdAt: -1,
    });
    res.json(proyectos);
  } catch (err) {
    console.error('Error al obtener proyectos:', err);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
});

// GET /proyectos/buscar-por-titulo/:titulo - Buscar proyecto por título exacto
app.get('/proyectos/buscar-por-titulo/:titulo', async (req, res) => {
  try {
    const { titulo } = req.params;
    const proyecto = await Proyecto.findOne({ titulo });

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    res.json(proyecto);
  } catch (err) {
    console.error('Error al buscar proyecto:', err);
    res.status(500).json({ error: 'Error al buscar el proyecto' });
  }
});

// GET /proyectos/:id - Obtener un proyecto por ID
app.get('/proyectos/:id', async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id);
    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    res.json(proyecto);
  } catch (err) {
    console.error('Error al obtener proyecto:', err);
    res.status(500).json({ error: 'Error al obtener proyecto' });
  }
});

// POST /proyectos/solicitud - Crear solicitud de alta (LEGACY, mantener para compatibilidad)
app.post('/proyectos/solicitud', async (req, res) => {
  try {
    const datos = req.body;

    if (!datos.autorizacionLegal) {
      return res.status(400).json({
        error: 'Debe aceptar la autorización legal',
      });
    }

    // Crear directamente un proyecto (para compatibilidad con código antiguo)
    const proyecto = new Proyecto({
      ...datos,
      aprobado: false,
    });

    await proyecto.save();
    res.status(201).json({
      mensaje: 'Solicitud enviada',
      proyecto,
    });
  } catch (err) {
    console.error('Error al crear proyecto:', err);
    res.status(500).json({ error: 'Error al crear la solicitud' });
  }
});

// PUT /proyectos/:id - Actualizar un proyecto
app.put('/proyectos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const actualizacion = req.body;

    const proyecto = await Proyecto.findByIdAndUpdate(id, actualizacion, {
      new: true,
    });

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    res.json({ mensaje: 'Proyecto actualizado', proyecto });
  } catch (err) {
    console.error('Error al actualizar proyecto:', err);
    res.status(500).json({ error: 'Error al actualizar el proyecto' });
  }
});

// DELETE /proyectos/:id - Eliminar un proyecto
app.delete('/proyectos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const proyecto = await Proyecto.findByIdAndDelete(id);

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    res.json({ mensaje: 'Proyecto eliminado' });
  } catch (err) {
    console.error('Error al eliminar proyecto:', err);
    res.status(500).json({ error: 'Error al eliminar el proyecto' });
  }
});

// ============================================
// RUTAS DE SOLICITUDES
// ============================================

// GET /solicitudes - Listar solicitudes (con filtro opcional por estado)
app.get('/solicitudes', async (req, res) => {
  try {
    const { estado } = req.query;
    const filtro = estado ? { estado } : {};

    const solicitudes = await Solicitud.find(filtro)
      .populate('proyectoId')
      .sort({ createdAt: -1 });

    res.json(solicitudes);
  } catch (err) {
    console.error('Error al obtener solicitudes:', err);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
});

// GET /solicitudes/:id - Obtener una solicitud específica
app.get('/solicitudes/:id', async (req, res) => {
  try {
    const solicitud = await Solicitud.findById(req.params.id).populate(
      'proyectoId'
    );

    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    res.json(solicitud);
  } catch (err) {
    console.error('Error al obtener solicitud:', err);
    res.status(500).json({ error: 'Error al obtener solicitud' });
  }
});

// POST /solicitudes/alta - Crear solicitud de ALTA (nuevo proyecto)
app.post('/solicitudes/alta', async (req, res) => {
  try {
    const datos = req.body;

    // Comprobación mínima de autorización legal
    if (!datos.autorizacionLegal) {
      return res.status(400).json({
        error: 'Debe aceptar la autorización legal para enviar el proyecto',
      });
    }

    const solicitud = new Solicitud({
      tipo: 'alta',
      datosPropuesto: datos,
    });

    await solicitud.save();

    res.status(201).json({
      mensaje:
        'Solicitud de alta enviada. Queda pendiente de revisión.',
      solicitud,
    });
  } catch (err) {
    console.error('Error al crear solicitud de alta:', err);
    res.status(500).json({ error: 'Error al crear la solicitud de alta' });
  }
});

// POST /solicitudes/edicion - Crear solicitud de EDICIÓN
app.post('/solicitudes/edicion', async (req, res) => {
  try {
    const { proyectoId, datosPropuesto } = req.body;

    if (!proyectoId) {
      return res.status(400).json({ error: 'Falta el ID del proyecto' });
    }

    if (!datosPropuesto.autorizacionLegal) {
      return res.status(400).json({
        error: 'Debe aceptar la autorización legal',
      });
    }

    const solicitud = new Solicitud({
      tipo: 'edicion',
      proyectoId,
      datosPropuesto,
    });

    await solicitud.save();

    res.status(201).json({
      mensaje:
        'Solicitud de edición enviada. Queda pendiente de revisión.',
      solicitud,
    });
  } catch (err) {
    console.error('Error al crear solicitud de edición:', err);
    res.status(500).json({ error: 'Error al crear la solicitud de edición' });
  }
});

// POST /solicitudes/borrado - Crear solicitud de BORRADO
app.post('/solicitudes/borrado', async (req, res) => {
  try {
    const { proyectoId } = req.body;

    if (!proyectoId) {
      return res.status(400).json({ error: 'Falta el ID del proyecto' });
    }

    const solicitud = new Solicitud({
      tipo: 'borrado',
      proyectoId,
      datosPropuesto: {},
    });

    await solicitud.save();

    res.status(201).json({
      mensaje:
        'Solicitud de borrado enviada. Queda pendiente de revisión.',
      solicitud,
    });
  } catch (err) {
    console.error('Error al crear solicitud de borrado:', err);
    res.status(500).json({ error: 'Error al crear la solicitud de borrado' });
  }
});

// POST /solicitudes/:id/aprobar - Aprobar una solicitud
app.post('/solicitudes/:id/aprobar', async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await Solicitud.findById(id);

    if (!solicitud || solicitud.estado !== 'pendiente') {
      return res.status(404).json({
        error: 'Solicitud no encontrada o ya resuelta',
      });
    }

    if (solicitud.tipo === 'alta') {
      // Crear nuevo proyecto aprobado
      const proyecto = new Proyecto({
        ...solicitud.datosPropuesto,
        aprobado: true,
      });
      await proyecto.save();
      solicitud.proyectoId = proyecto._id;
    } else if (solicitud.tipo === 'edicion') {
      // Actualizar proyecto existente
      if (!solicitud.proyectoId) {
        return res.status(400).json({
          error: 'No hay proyecto asociado',
        });
      }
      await Proyecto.findByIdAndUpdate(
        solicitud.proyectoId,
        solicitud.datosPropuesto,
        { new: true }
      );
    } else if (solicitud.tipo === 'borrado') {
      // Borrar proyecto existente
      if (!solicitud.proyectoId) {
        return res.status(400).json({
          error: 'No hay proyecto asociado',
        });
      }
      await Proyecto.findByIdAndDelete(solicitud.proyectoId);
    }

    solicitud.estado = 'aprobada';
    await solicitud.save();

    res.json({ mensaje: 'Solicitud aprobada', solicitud });
  } catch (err) {
    console.error('Error al aprobar solicitud:', err);
    res.status(500).json({ error: 'Error al aprobar solicitud' });
  }
});

// POST /solicitudes/:id/rechazar - Rechazar una solicitud
app.post('/solicitudes/:id/rechazar', async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const solicitud = await Solicitud.findById(id);

    if (!solicitud || solicitud.estado !== 'pendiente') {
      return res.status(404).json({
        error: 'Solicitud no encontrada o ya resuelta',
      });
    }

    solicitud.estado = 'rechazada';
    if (motivo) {
      solicitud.motivo = motivo;
    }
    await solicitud.save();

    res.json({ mensaje: 'Solicitud rechazada', solicitud });
  } catch (err) {
    console.error('Error al rechazar solicitud:', err);
    res.status(500).json({ error: 'Error al rechazar solicitud' });
  }
});

// ============================================
// PUERTO Y ARRANQUE
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
