const mongoose = require('mongoose');

const criptoSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
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
  }
});

module.exports = mongoose.model('Cripto', criptoSchema);
