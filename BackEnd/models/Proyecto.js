const mongoose = require('mongoose');

const ProyectoSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true },
    descripcion: { type: String, required: true },
    asignatura: { type: String, required: true },
    autores: { type: [String], required: true },  // lista de nombres
    enlaceExterno: { type: String },             // itch.io, web, etc.
    imagenes: { type: [String], default: [] },   // URLs de imágenes
    videos: { type: [String], default: [] },     // URLs de vídeos
    curso: { type: String },                     // opcional: 1º, 2º, etc.
    aprobado: { type: Boolean, default: false }, // para que sólo aparezcan si el gestor lo aprueba
  },
  {
    timestamps: true, // añade createdAt y updatedAt automáticamente
  }
);

module.exports = mongoose.model('Proyecto', ProyectoSchema);
