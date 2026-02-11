const mongoose = require('mongoose');

const payoffSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  }
}, { _id: true });

const loanSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project reference is required']
  },
  loanAmount: {
    type: Number,
    required: [true, 'Loan amount is required'],
    min: [0, 'Loan amount must be positive']
  },
  loanDate: {
    type: Date,
    required: [true, 'Loan date is required']
  },
  payoffs: [payoffSchema],
  status: {
    type: String,
    enum: ['active', 'paid', 'partial'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total paid amount
loanSchema.virtual('totalPaid').get(function() {
  return this.payoffs.reduce((sum, payoff) => sum + payoff.amount, 0);
});

// Virtual for remaining balance
loanSchema.virtual('remainingBalance').get(function() {
  return this.loanAmount - this.totalPaid;
});

// Update status before saving
loanSchema.pre('save', function(next) {
  const totalPaid = this.payoffs.reduce((sum, payoff) => sum + payoff.amount, 0);
  
  if (totalPaid >= this.loanAmount) {
    this.status = 'paid';
  } else if (totalPaid > 0) {
    this.status = 'partial';
  } else {
    this.status = 'active';
  }
  
  next();
});

module.exports = mongoose.model('Loan', loanSchema);
