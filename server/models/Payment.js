const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project reference is required']
  },
  paymentType: {
    type: String,
    enum: {
      values: ['advance', 'progress', 'final', 'other'],
      message: 'Payment type must be advance, progress, final, or other'
    },
    required: [true, 'Payment type is required']
  },
  paymentDate: {
    type: Date,
    required: [true, 'Payment date is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  currency: {
    type: String,
    default: 'USD',
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'check', 'other'],
    default: 'bank_transfer'
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
