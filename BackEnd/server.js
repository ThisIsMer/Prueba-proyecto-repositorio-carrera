require('dotenv').config();
const Proyecto = require('./models/Proyecto');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware sencillo de autenticación de admin
function checkAdmin(req, res, next) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const passwordFromHeader = req.headers['x-admin-password'];

  if (!passwordFromHeader || passwordFromHeader !== adminPassword) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  next();
}

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error al conectar con MongoDB:', err);
  });
  
// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API del repositorio funcionando');
});

app.get('/proyectos', async (req, res) => {
  try {
    const proyectos = await Proyecto.find({ aprobado: true }).sort({ createdAt: -1 });
    res.json(proyectos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
});

// Obtener proyectos pendientes de aprobación (solo admin)
app.get('/admin/proyectos-pendientes', checkAdmin, async (req, res) => {
  try {
    const pendientes = await Proyecto.find({ aprobado: false }).sort({ createdAt: -1 });
    res.json(pendientes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener proyectos pendientes' });
  }
});

// Obtener un proyecto por id
app.get('/proyectos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await Proyecto.findById(id);

    if (!proyecto || !proyecto.aprobado) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    res.json(proyecto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el proyecto' });
  }
});

// Enviar solicitud de nuevo proyecto
app.post('/proyectos/solicitud', async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      asignatura,
      autores,
      enlaceExterno,
      imagenes,
      videos,
      curso,
      anio,
      licencia,
      autorizacionLegal,
    } = req.body;

    if (!autorizacionLegal) {
      return res.status(400).json({ error: 'Debe aceptar la autorización legal' });
    }

    const nuevoProyecto = new Proyecto({
      titulo,
      descripcion,
      asignatura,
      autores,
      enlaceExterno,
      imagenes: imagenes || [],
      videos: videos || [],
      curso,
      anio,
      licencia,
      autorizacionLegal,
      aprobado: false,
    });

    await nuevoProyecto.save();
    res.status(201).json({ mensaje: 'Solicitud enviada', proyecto: nuevoProyecto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la solicitud' });
  }
});

// Aprobar un proyecto por id (solo admin)
app.post('/admin/proyectos/:id/aprobar', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const proyecto = await Proyecto.findByIdAndUpdate(
      id,
      { aprobado: true },
      { new: true }
    );

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    res.json({ mensaje: 'Proyecto aprobado', proyecto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al aprobar el proyecto' });
  }
});

// Actualizar un proyecto por id (solo datos, no aprobado)
app.put('/proyectos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const proyecto = await Proyecto.findByIdAndUpdate(id, update, { new: true });

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    res.json({ mensaje: 'Proyecto actualizado', proyecto });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el proyecto' });
  }
});

// Borrar un proyecto por id
app.delete('/proyectos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await Proyecto.findByIdAndDelete(id);

    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    res.json({ mensaje: 'Proyecto eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el proyecto' });
  }
});
