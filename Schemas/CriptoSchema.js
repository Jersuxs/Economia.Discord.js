const mongoose = require('mongoose');

const criptoSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true,
  },
  RakanCoin: {
    cantidad: { type: Number, default: 0 },
    precio: { type: Number, default: 500 },
    precioDefault: { type: Number, default: 500 }
  },
  PimulaCoin: {
    cantidad: { type: Number, default: 0 },
    precio: { type: Number, default: 3000 },
    precioDefault: { type: Number, default: 3000 }
  },
  FnCoin: {
    cantidad: { type: Number, default: 0 },
    precio: { type: Number, default: 15000 },
    precioDefault: { type: Number, default: 15000 }
  },
  ultimaActualizacion: {
    type: Date,
    default: Date.now
  },
  proximaActualizacion: {
    type: Date,
    default: () => new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 horas después de la creación
  }
});

module.exports = mongoose.model('Cripto', criptoSchema);
