const mongoose = require('mongoose');

const economiaSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  dinero: {
    type: Number,
    default: 0
  },
  banco: {
    type: Number,
    default: 0
  },
  lastWork: {
    type: Date,
    default: null
  },
  lastCollect: {
    type: Map,
    of: Date,
    default: {}
  },
  lastRob: { 
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Economia', economiaSchema);
