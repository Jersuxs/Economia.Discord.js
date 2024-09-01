const mongoose = require('mongoose');

const prestamoSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  dinero: { type: Number, required: true },
  dineroConIntereses: { type: Number, required: true },
  fechaVencimiento: { type: Date, required: true },
  pagado: { type: Boolean, default: false },
  razonAceptacion: { type: String, default: '' },
  fechaSolicitud: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prestamo', prestamoSchema);
