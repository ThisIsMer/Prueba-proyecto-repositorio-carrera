const mongoose = require('mongoose');

const SolicitudSchema = new mongoose.Schema(
  {
    tipo: { type: String, enum: ['alta', 'edicion', 'borrado'], required: true },
    proyectoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto' }, // opcional en 'alta'
    datosPropuesto: { type: Object }, // campos sugeridos para alta/edición
    motivo: { type: String }, // opcional
    estado: { type: String, enum: ['pendiente', 'aprobada', 'rechazada'], default: 'pendiente' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Solicitud', SolicitudSchema);
