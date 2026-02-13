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
      creditNote: { type: Number, default: 0 },
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
      buyerName: { type: String, trim: true },
      invoiceNo: { type: String, trim: true },
      invoiceDate: { type: Date },
      creditNote: { type: Number, default: 0 },
      bankInterest: { type: Number, default: 0 },
      freightCharges: { type: Number, default: 0 },
      twlInvoiceAmount: { type: Number, default: 0 },
      finalInvoiceAmount: { type: Number, default: 0 },
      commission: { type: Number, default: 0 }
    },
    advancePayment: {
      twlReceived: { type: Number, default: 0 },
      balanceAmount: { type: Number, default: 0 },
      date: { type: Date },
      reference: { type: String, trim: true }
    },
    balancePayment: {
      twlReceived: { type: Number, default: 0 },
      date: { type: Date },
      reference: { type: String, trim: true }
    },
    // Buyer Summary
    summary: {
      totalReceived: { type: Number, default: 0 },
      cancel: { type: Number, default: 0 },
      balanceReceived: { type: Number, default: 0 }
    },
    paymentTotal: {
      type: Number,
      default: 0
    }
  },

  // Costing - UPDATED: Removed notes field
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
    profitPercentage: { type: Number, default: 0 }
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
  this.supplier.summary.totalAmount = 
    this.supplier.advancePayment.totalPayment + 
    this.supplier.balancePayment.totalPayment;
  
  this.supplier.summary.cancelAmount = creditNote - this.supplier.summary.totalAmount;
  this.supplier.summary.balancePayment = finalInvoice - this.supplier.summary.totalAmount;
  
  this.supplier.paymentTotal = this.supplier.summary.totalAmount;

  // BUYER CALCULATIONS
  
  // 1. Buyer Proforma: Final Invoice Amount calculation
  // Final Invoice = TWL Invoice - Credit Note + Bank Interest + Commission + Freight
  const buyerTwlInvoiceAmount = this.buyer.proformaInvoice.twlInvoiceAmount || 0;
  const buyerCreditNote = this.buyer.proformaInvoice.creditNote || 0;
  const buyerBankInterest = this.buyer.proformaInvoice.bankInterest || 0;
  const buyerFreightCharges = this.buyer.proformaInvoice.freightCharges || 0;
  const buyerCommission = this.buyer.proformaInvoice.commission || 0;

  this.buyer.proformaInvoice.finalInvoiceAmount = 
    buyerTwlInvoiceAmount - buyerCreditNote + buyerBankInterest + 
    buyerFreightCharges + buyerCommission;
  
  // 2. Advance Payment: Balance Amount = Final Invoice Amount - TWL Received
  const buyerAdvanceTwlReceived = this.buyer.advancePayment.twlReceived || 0;
  this.buyer.advancePayment.balanceAmount = 
    this.buyer.proformaInvoice.finalInvoiceAmount - buyerAdvanceTwlReceived;
  
  // 3. Buyer Summary Calculations
  const buyerBalanceTwlReceived = this.buyer.balancePayment.twlReceived || 0;
  
  // Total Received = Advance TWL Received + Balance TWL Received
  this.buyer.summary.totalReceived = buyerAdvanceTwlReceived + buyerBalanceTwlReceived;
  
  // Cancel (you can set logic here, keeping as 0 for now)
  this.buyer.summary.cancel = 0;
  
  // Balance Received = Final Invoice Amount - Total Received
  this.buyer.summary.balanceReceived = 
    this.buyer.proformaInvoice.finalInvoiceAmount - this.buyer.summary.totalReceived;

  this.buyer.paymentTotal = this.buyer.summary.totalReceived;

  // COSTING CALCULATIONS - UPDATED LOGIC
  
  const costingSupplierInvoice = this.costing.supplierInvoiceAmount || 0;
  const costingTwlInvoice = this.costing.twlInvoiceAmount || 0;
  
  // Profit = Supplier Invoice Amount - TWL Invoice Amount
  this.costing.profit = costingSupplierInvoice - costingTwlInvoice;
  
  // Total = InGoing + OutGoing + CAL Charges + Other + Foreign Bank Charges + Loan Interest + Freight Charges
  const inGoing = this.costing.inGoing || 0;
  const outGoing = this.costing.outGoing || 0;
  const calCharges = this.costing.calCharges || 0;
  const other = this.costing.other || 0;
  const foreignBankCharges = this.costing.foreignBankCharges || 0;
  const loanInterest = this.costing.loanInterest || 0;
  const freightCharges = this.costing.freightCharges || 0;
  
  this.costing.total = inGoing + outGoing + calCharges + other + foreignBankCharges + loanInterest + freightCharges;
  
  // Net Profit = Profit - Total
  this.costing.netProfit = this.costing.profit - this.costing.total;
  
  // Calculate profit percentage based on costing supplier invoice
  this.costing.profitPercentage = costingSupplierInvoice > 0 
    ? ((this.costing.profit / costingSupplierInvoice) * 100).toFixed(2)
    : 0;
});

// Update calculations before updating
projectSchema.pre('findOneAndUpdate', function() {
  const update = this.getUpdate();
  
  if (update.supplier) {
    // Keep existing supplier calculations
    if (!update.supplier.proformaInvoice) update.supplier.proformaInvoice = {};
    if (!update.supplier.advancePayment) update.supplier.advancePayment = {};
    if (!update.supplier.balancePayment) update.supplier.balancePayment = {};
    if (!update.supplier.summary) update.supplier.summary = {};
    
    const supplierInvoiceAmount = update.supplier?.proformaInvoice?.invoiceAmount || 0;
    const creditNote = update.supplier?.proformaInvoice?.creditNote || 0;
    update.supplier.proformaInvoice.finalInvoiceAmount = supplierInvoiceAmount - creditNote;
    
    const loanAmount = update.supplier?.advancePayment?.loanAmount || 0;
    const twlContribution = update.supplier?.advancePayment?.twlContribution || 0;
    update.supplier.advancePayment.totalPayment = loanAmount + twlContribution;
    
    const finalInvoice = update.supplier.proformaInvoice.finalInvoiceAmount;
    update.supplier.advancePayment.balanceAmount = finalInvoice - update.supplier.advancePayment.totalPayment;
    
    const supplierBalanceAmount = update.supplier?.balancePayment?.amount || 0;
    const supplierBalanceTwl = update.supplier?.balancePayment?.twlContribution || 0;
    update.supplier.balancePayment.totalPayment = supplierBalanceAmount + supplierBalanceTwl;
    
    update.supplier.summary.totalAmount = 
      update.supplier.advancePayment.totalPayment + 
      update.supplier.balancePayment.totalPayment;
    
    update.supplier.summary.cancelAmount = creditNote - update.supplier.summary.totalAmount;
    update.supplier.summary.balancePayment = finalInvoice - update.supplier.summary.totalAmount;
    update.supplier.paymentTotal = update.supplier.summary.totalAmount;
  }

  if (update.buyer) {
    // BUYER CALCULATIONS
    if (!update.buyer.proformaInvoice) update.buyer.proformaInvoice = {};
    if (!update.buyer.advancePayment) update.buyer.advancePayment = {};
    if (!update.buyer.balancePayment) update.buyer.balancePayment = {};
    if (!update.buyer.summary) update.buyer.summary = {};
    
    // 1. Final Invoice = TWL Invoice - Credit Note + Bank Interest + Commission + Freight
    const buyerTwlInvoiceAmount = update.buyer?.proformaInvoice?.twlInvoiceAmount || 0;
    const buyerCreditNote = update.buyer?.proformaInvoice?.creditNote || 0;
    const buyerBankInterest = update.buyer?.proformaInvoice?.bankInterest || 0;
    const buyerFreightCharges = update.buyer?.proformaInvoice?.freightCharges || 0;
    const buyerCommission = update.buyer?.proformaInvoice?.commission || 0;
    
    update.buyer.proformaInvoice.finalInvoiceAmount = 
      buyerTwlInvoiceAmount - buyerCreditNote + buyerBankInterest + 
      buyerFreightCharges + buyerCommission;
    
    // 2. Balance Amount = Final Invoice - TWL Received
    const buyerAdvanceTwlReceived = update.buyer?.advancePayment?.twlReceived || 0;
    update.buyer.advancePayment.balanceAmount = 
      update.buyer.proformaInvoice.finalInvoiceAmount - buyerAdvanceTwlReceived;
    
    // 3. Summary calculations
    const buyerBalanceTwlReceived = update.buyer?.balancePayment?.twlReceived || 0;
    
    // Total Received = Advance TWL + Balance TWL
    update.buyer.summary.totalReceived = buyerAdvanceTwlReceived + buyerBalanceTwlReceived;
    
    // Cancel
    update.buyer.summary.cancel = 0;
    
    // Balance Received = Final Invoice - Total Received
    update.buyer.summary.balanceReceived = 
      update.buyer.proformaInvoice.finalInvoiceAmount - update.buyer.summary.totalReceived;
    
    update.buyer.paymentTotal = update.buyer.summary.totalReceived;
  }

  // COSTING CALCULATIONS - UPDATED LOGIC
  if (update.costing) {
    const costingSupplierInvoice = update.costing?.supplierInvoiceAmount || 0;
    const costingTwlInvoice = update.costing?.twlInvoiceAmount || 0;
    
    // Profit = Supplier Invoice Amount - TWL Invoice Amount
    update.costing.profit = costingSupplierInvoice - costingTwlInvoice;
    
    // Total = InGoing + OutGoing + CAL Charges + Other + Foreign Bank Charges + Loan Interest + Freight Charges
    const inGoing = update.costing?.inGoing || 0;
    const outGoing = update.costing?.outGoing || 0;
    const calCharges = update.costing?.calCharges || 0;
    const other = update.costing?.other || 0;
    const foreignBankCharges = update.costing?.foreignBankCharges || 0;
    const loanInterest = update.costing?.loanInterest || 0;
    const freightCharges = update.costing?.freightCharges || 0;
    
    update.costing.total = inGoing + outGoing + calCharges + other + foreignBankCharges + loanInterest + freightCharges;
    
    // Net Profit = Profit - Total
    update.costing.netProfit = update.costing.profit - update.costing.total;
    
    // Calculate profit percentage
    update.costing.profitPercentage = costingSupplierInvoice > 0 
      ? ((update.costing.profit / costingSupplierInvoice) * 100).toFixed(2)
      : 0;
  }
});

module.exports = mongoose.model('Project', projectSchema);
