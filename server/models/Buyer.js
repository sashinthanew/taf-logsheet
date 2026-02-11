const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Buyer name is required'],
    trim: true,
    unique: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Buyer', buyerSchema);
