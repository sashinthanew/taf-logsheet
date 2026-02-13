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
      invoiceNumber: { type: String, trim: true },
      invoiceAmount: { type: Number, default: 0 },
      creditNote: { type: Number, default: 0 },  // Changed to Number for calculations
      finalInvoiceAmount: { type: Number, default: 0 }
    },
    // Advance Payment Details
    advancePayment: {
      loanAmount: { type: Number, default: 0 },
      paymentDate: { type: Date },
      referenceNumber: { type: String, trim: true },
      twlContribution: { type: Number, default: 0 },
      totalPayment: { type: Number, default: 0 },
      balanceAmount: { type: Number, default: 0 }
    },
    // Balance Payment
    balancePayment: {
      amount: { type: Number, default: 0 },
      date: { type: Date },
      reference: { type: String, trim: true },
      twlContribution: { type: Number, default: 0 },
      totalPayment: { type: Number, default: 0 }
    },
    // Supplier Summary
    summary: {
      totalAmount: { type: Number, default: 0 },
      cancelAmount: { type: Number, default: 0 },
      balancePayment: { type: Number, default: 0 }
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
      reference: { type: String, trim: true },
      twlContribution: { type: Number, default: 0 },
      totalPayment: { type: Number, default: 0 }
    },
    // Buyer Summary
    summary: {
      totalAmount: { type: Number, default: 0 },
      cancelAmount: { type: Number, default: 0 },
      balancePayment: { type: Number, default: 0 }
    },
    paymentTotal: {
      type: Number,
      default: 0
    }
  },

  // Costing
  costing: {
    supplierInvoiceAmount: { type: Number, default: 0 },
    twlInvoiceAmount: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    inGoing: { type: Number, default: 0 },
    outGoing: { type: Number, default: 0 },
    calCharges: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
    foreignBankCharges: { type: Number, default: 0 },
    loanInterest: { type: Number, default: 0 },
    freightCharges: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
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
  // SUPPLIER CALCULATIONS
  
  // 1. Final Invoice Amount = Supplier Invoice Amount - Credit Note
  const supplierInvoiceAmount = this.supplier.proformaInvoice.invoiceAmount || 0;
  const creditNote = this.supplier.proformaInvoice.creditNote || 0;
  this.supplier.proformaInvoice.finalInvoiceAmount = supplierInvoiceAmount - creditNote;
  
  // 2. Advance Payment: Total Payment = Loan Amount + TWL Contribution
  const loanAmount = this.supplier.advancePayment.loanAmount || 0;
  const twlContribution = this.supplier.advancePayment.twlContribution || 0;
  this.supplier.advancePayment.totalPayment = loanAmount + twlContribution;
  
  // 3. Advance Payment: Balance Amount = Final Invoice Amount - Total Payment
  const finalInvoice = this.supplier.proformaInvoice.finalInvoiceAmount;
  this.supplier.advancePayment.balanceAmount = finalInvoice - this.supplier.advancePayment.totalPayment;
  
  // 4. Balance Payment: Total Payment = Amount + TWL Contribution
  const supplierBalanceAmount = this.supplier.balancePayment.amount || 0;
  const supplierBalanceTwl = this.supplier.balancePayment.twlContribution || 0;
  this.supplier.balancePayment.totalPayment = supplierBalanceAmount + supplierBalanceTwl;
  
  // 5. Supplier Summary Calculations
  // Total Amount = Total Payment (Advance) + Total Payment (Balance)
  this.supplier.summary.totalAmount = 
    this.supplier.advancePayment.totalPayment + 
    this.supplier.balancePayment.totalPayment;
  
  // Cancel Amount = Credit Note - Total Amount
  this.supplier.summary.cancelAmount = creditNote - this.supplier.summary.totalAmount;
  
  // Balance Payment = Final Invoice Amount - Total Amount
  this.supplier.summary.balancePayment = finalInvoice - this.supplier.summary.totalAmount;
  
  // Total payment for profit calculation
  this.supplier.paymentTotal = this.supplier.summary.totalAmount;

  // BUYER CALCULATIONS
  
  // Buyer balance payment total
  const buyerBalanceAmount = this.buyer.balancePayment.amount || 0;
  const buyerBalanceTwl = this.buyer.balancePayment.twlContribution || 0;
  this.buyer.balancePayment.totalPayment = buyerBalanceAmount + buyerBalanceTwl;
  
  // Buyer payment total
  this.buyer.paymentTotal = 
    (this.buyer.advancePayment.amount || 0) + 
    this.buyer.balancePayment.totalPayment;

  // COSTING CALCULATIONS
  
  // Calculate costing total
  const inGoing = this.costing.inGoing || 0;
  const outGoing = this.costing.outGoing || 0;
  const calCharges = this.costing.calCharges || 0;
  const other = this.costing.other || 0;
  const foreignBankCharges = this.costing.foreignBankCharges || 0;
  const loanInterest = this.costing.loanInterest || 0;
  const freightCharges = this.costing.freightCharges || 0;
  
  this.costing.total = inGoing + outGoing + calCharges + other + foreignBankCharges + loanInterest + freightCharges;
  
  // Calculate profit and net profit
  if (this.buyer.paymentTotal && this.supplier.paymentTotal) {
    this.costing.profit = this.buyer.paymentTotal - this.supplier.paymentTotal;
    this.costing.profitPercentage = this.supplier.paymentTotal > 0 
      ? ((this.costing.profit / this.supplier.paymentTotal) * 100).toFixed(2)
      : 0;
  }
  
  this.costing.netProfit = this.costing.profit - this.costing.total;
});

// Update calculations before updating
projectSchema.pre('findOneAndUpdate', function() {
  const update = this.getUpdate();
  
  if (update.supplier) {
    // Ensure nested objects exist
    if (!update.supplier.proformaInvoice) update.supplier.proformaInvoice = {};
    if (!update.supplier.advancePayment) update.supplier.advancePayment = {};
    if (!update.supplier.balancePayment) update.supplier.balancePayment = {};
    if (!update.supplier.summary) update.supplier.summary = {};
    
    // SUPPLIER CALCULATIONS
    
    // 1. Final Invoice Amount = Supplier Invoice Amount - Credit Note
    const supplierInvoiceAmount = update.supplier?.proformaInvoice?.invoiceAmount || 0;
    const creditNote = update.supplier?.proformaInvoice?.creditNote || 0;
    update.supplier.proformaInvoice.finalInvoiceAmount = supplierInvoiceAmount - creditNote;
    
    // 2. Advance Payment: Total Payment = Loan Amount + TWL Contribution
    const loanAmount = update.supplier?.advancePayment?.loanAmount || 0;
    const twlContribution = update.supplier?.advancePayment?.twlContribution || 0;
    update.supplier.advancePayment.totalPayment = loanAmount + twlContribution;
    
    // 3. Advance Payment: Balance Amount = Final Invoice Amount - Total Payment
    const finalInvoice = update.supplier.proformaInvoice.finalInvoiceAmount;
    update.supplier.advancePayment.balanceAmount = finalInvoice - update.supplier.advancePayment.totalPayment;
    
    // 4. Balance Payment: Total Payment = Amount + TWL Contribution
    const supplierBalanceAmount = update.supplier?.balancePayment?.amount || 0;
    const supplierBalanceTwl = update.supplier?.balancePayment?.twlContribution || 0;
    update.supplier.balancePayment.totalPayment = supplierBalanceAmount + supplierBalanceTwl;
    
    // 5. Supplier Summary Calculations
    // Total Amount = Total Payment (Advance) + Total Payment (Balance)
    update.supplier.summary.totalAmount = 
      update.supplier.advancePayment.totalPayment + 
      update.supplier.balancePayment.totalPayment;
    
    // Cancel Amount = Credit Note - Total Amount
    update.supplier.summary.cancelAmount = creditNote - update.supplier.summary.totalAmount;
    
    // Balance Payment = Final Invoice Amount - Total Amount
    update.supplier.summary.balancePayment = finalInvoice - update.supplier.summary.totalAmount;
    
    // Supplier payment total
    update.supplier.paymentTotal = update.supplier.summary.totalAmount;
  }

  if (update.buyer) {
    // Buyer balance payment total calculation
    if (!update.buyer.balancePayment) {
      update.buyer.balancePayment = {};
    }
    const buyerBalanceAmount = update.buyer?.balancePayment?.amount || 0;
    const buyerBalanceTwl = update.buyer?.balancePayment?.twlContribution || 0;
    update.buyer.balancePayment.totalPayment = buyerBalanceAmount + buyerBalanceTwl;
    
    // Buyer payment total
    const buyerAdvance = update.buyer?.advancePayment?.amount || 0;
    update.buyer.paymentTotal = buyerAdvance + update.buyer.balancePayment.totalPayment;
  }

  // Calculate costing
  if (update.costing) {
    const inGoing = update.costing?.inGoing || 0;
    const outGoing = update.costing?.outGoing || 0;
    const calCharges = update.costing?.calCharges || 0;
    const other = update.costing?.other || 0;
    const foreignBankCharges = update.costing?.foreignBankCharges || 0;
    const loanInterest = update.costing?.loanInterest || 0;
    const freightCharges = update.costing?.freightCharges || 0;
    
    update.costing.total = inGoing + outGoing + calCharges + other + foreignBankCharges + loanInterest + freightCharges;
    
    const profit = update.costing?.profit || 0;
    update.costing.netProfit = profit - update.costing.total;
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
