const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  // Project Section
  projectName: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  projectNo: {
    type: String,
    required: [true, 'Project number is required'],
    unique: true,
    trim: true
  },
  projectDate: {
    type: Date,
    required: [true, 'Project date is required']
  },

  // Supplier Section
  supplier: {
    // Proforma Invoice Details
    proformaInvoice: {
      supplierName: { type: String, trim: true },
      creditNote: { type: String, trim: true },
      finalInvoiceAmount: { type: Number, default: 0 }
    },
    // Advance Payment Details
    advancePayment: {
      loanAmount: { type: Number, default: 0 },
      twlContribution: { type: Number, default: 0 },
      totalPayment: { type: Number, default: 0 },
      balanceAmount: { type: Number, default: 0 }
    },
    // Balance Payment
    balancePayment: {
      amount: { type: Number, default: 0 },
      date: { type: Date },
      reference: { type: String, trim: true }
    },
    paymentTotal: {
      type: Number,
      default: 0
    }
  },

  // Buyer Details
  buyer: {
    proformaInvoice: {
      invoiceNo: { type: String, trim: true },
      invoiceDate: { type: Date },
      amount: { type: Number, default: 0 }
    },
    advancePayment: {
      amount: { type: Number, default: 0 },
      date: { type: Date },
      reference: { type: String, trim: true }
    },
    balancePayment: {
      amount: { type: Number, default: 0 },
      date: { type: Date },
      reference: { type: String, trim: true }
    },
    paymentTotal: {
      type: Number,
      default: 0
    }
  },

  // Costing
  costing: {
    totalCost: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    profitPercentage: { type: Number, default: 0 },
    notes: { type: String, trim: true }
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Calculate payment totals before saving
projectSchema.pre('save', function() {
  // Supplier - Calculate total payment and balance
  const loanAmount = this.supplier.advancePayment.loanAmount || 0;
  const twlContribution = this.supplier.advancePayment.twlContribution || 0;
  this.supplier.advancePayment.totalPayment = loanAmount + twlContribution;
  
  const finalInvoice = this.supplier.proformaInvoice.finalInvoiceAmount || 0;
  this.supplier.advancePayment.balanceAmount = finalInvoice - this.supplier.advancePayment.totalPayment;
  
  // Supplier payment total
  this.supplier.paymentTotal = 
    this.supplier.advancePayment.totalPayment + 
    (this.supplier.balancePayment.amount || 0);

  // Buyer payment total
  this.buyer.paymentTotal = 
    (this.buyer.advancePayment.amount || 0) + 
    (this.buyer.balancePayment.amount || 0);

  // Calculate profit
  if (this.buyer.paymentTotal && this.supplier.paymentTotal) {
    this.costing.profit = this.buyer.paymentTotal - this.supplier.paymentTotal;
    this.costing.profitPercentage = this.supplier.paymentTotal > 0 
      ? ((this.costing.profit / this.supplier.paymentTotal) * 100).toFixed(2)
      : 0;
  }
});

// Update calculations before updating
projectSchema.pre('findOneAndUpdate', function() {
  const update = this.getUpdate();
  
  if (update.supplier) {
    // Calculate total payment and balance for supplier
    const loanAmount = update.supplier?.advancePayment?.loanAmount || 0;
    const twlContribution = update.supplier?.advancePayment?.twlContribution || 0;
    
    if (!update.supplier.advancePayment) {
      update.supplier.advancePayment = {};
    }
    
    update.supplier.advancePayment.totalPayment = loanAmount + twlContribution;
    
    const finalInvoice = update.supplier?.proformaInvoice?.finalInvoiceAmount || 0;
    update.supplier.advancePayment.balanceAmount = finalInvoice - update.supplier.advancePayment.totalPayment;
    
    // Supplier payment total
    const supplierBalance = update.supplier?.balancePayment?.amount || 0;
    update.supplier.paymentTotal = update.supplier.advancePayment.totalPayment + supplierBalance;
  }

  if (update.buyer) {
    // Buyer payment total
    const buyerAdvance = update.buyer?.advancePayment?.amount || 0;
    const buyerBalance = update.buyer?.balancePayment?.amount || 0;
    update.buyer.paymentTotal = buyerAdvance + buyerBalance;
  }

  // Calculate profit
  const supplierTotal = update.supplier?.paymentTotal || 0;
  const buyerTotal = update.buyer?.paymentTotal || 0;
  
  if (!update.costing) {
    update.costing = {};
  }
  
  update.costing.profit = buyerTotal - supplierTotal;
  update.costing.profitPercentage = supplierTotal > 0 
    ? ((update.costing.profit / supplierTotal) * 100).toFixed(2)
    : 0;
});

module.exports = mongoose.model('Project', projectSchema);
