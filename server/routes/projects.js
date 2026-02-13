const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const ExcelJS = require('exceljs');

// IMPORTANT: Export route MUST come BEFORE /:id route
router.get('/export/excel', auth, async (req, res) => {
  try {
    console.log('Excel export route hit');
    console.log('Starting Excel export...');
    
    // Fetch all projects
    const projects = await Project.find().sort({ projectDate: -1 });
    console.log(`Found ${projects.length} projects to export`);

    if (projects.length === 0) {
      console.log('No projects found');
      return res.status(404).json({ success: false, message: 'No projects found to export' });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TWL System';
    workbook.created = new Date();
    
    const worksheet = workbook.addWorksheet('All Projects', {
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true }
    });

    // Define ALL columns with their keys FIRST - This is critical!
    worksheet.columns = [
      // Project Info (3)
      { header: 'Project No', key: 'projectNo', width: 15 },
      { header: 'Project Name', key: 'projectName', width: 25 },
      { header: 'Project Date', key: 'projectDate', width: 15 },
      
      // Supplier - Proforma Invoice (5)
      { header: 'Supplier Name', key: 'supplierName', width: 20 },
      { header: 'Supplier Invoice No', key: 'supplierInvoiceNo', width: 18 },
      { header: 'Supplier Invoice Amt', key: 'supplierInvoiceAmount', width: 18 },
      { header: 'Supplier Credit Note', key: 'supplierCreditNote', width: 18 },
      { header: 'Supplier Final Invoice', key: 'supplierFinalInvoice', width: 20 },
      
      // Supplier - Advance Payment (6)
      { header: 'Loan Amount', key: 'loanAmount', width: 15 },
      { header: 'Advance Payment Date', key: 'advancePaymentDate', width: 18 },
      { header: 'Advance Reference', key: 'advanceReference', width: 18 },
      { header: 'TWL Contribution (Adv)', key: 'twlContributionAdv', width: 20 },
      { header: 'Total Payment (Adv)', key: 'totalPaymentAdv', width: 18 },
      { header: 'Balance Amount (Adv)', key: 'balanceAmountAdv', width: 18 },
      
      // Supplier - Balance Payment (5)
      { header: 'Supplier Balance Amt', key: 'supplierBalanceAmount', width: 18 },
      { header: 'Supplier Balance Date', key: 'supplierBalanceDate', width: 18 },
      { header: 'Supplier Balance Ref', key: 'supplierBalanceRef', width: 18 },
      { header: 'TWL Contribution (Bal)', key: 'twlContributionBal', width: 20 },
      { header: 'Total Payment (Bal)', key: 'totalPaymentBal', width: 18 },
      
      // Supplier - Summary (3)
      { header: 'Supplier Total Amt', key: 'supplierTotalAmount', width: 18 },
      { header: 'Supplier Cancel Amt', key: 'supplierCancelAmount', width: 18 },
      { header: 'Supplier Balance Pay', key: 'supplierBalancePayment', width: 20 },
      
      // Buyer - Proforma Invoice (9)
      { header: 'Buyer Name', key: 'buyerName', width: 20 },
      { header: 'Buyer Invoice No', key: 'buyerInvoiceNo', width: 18 },
      { header: 'Buyer Invoice Date', key: 'buyerInvoiceDate', width: 18 },
      { header: 'TWL Invoice Amount', key: 'twlInvoiceAmount', width: 18 },
      { header: 'Buyer Credit Note', key: 'buyerCreditNote', width: 18 },
      { header: 'Bank Interest', key: 'bankInterest', width: 15 },
      { header: 'Freight Charges', key: 'freightCharges', width: 15 },
      { header: 'Commission', key: 'commission', width: 15 },
      { header: 'Buyer Final Invoice', key: 'buyerFinalInvoice', width: 18 },
      
      // Buyer - Advance Payment (4)
      { header: 'Buyer Advance TWL', key: 'buyerAdvanceTwl', width: 18 },
      { header: 'Buyer Advance Balance', key: 'buyerAdvanceBalance', width: 20 },
      { header: 'Buyer Advance Date', key: 'buyerAdvanceDate', width: 18 },
      { header: 'Buyer Advance Ref', key: 'buyerAdvanceRef', width: 18 },
      
      // Buyer - Balance Payment (3)
      { header: 'Buyer Balance TWL', key: 'buyerBalanceTwl', width: 18 },
      { header: 'Buyer Balance Date', key: 'buyerBalanceDate', width: 18 },
      { header: 'Buyer Balance Ref', key: 'buyerBalanceRef', width: 18 },
      
      // Buyer - Summary (3)
      { header: 'Buyer Total Received', key: 'buyerTotalReceived', width: 18 },
      { header: 'Buyer Cancel', key: 'buyerCancel', width: 15 },
      { header: 'Buyer Balance Received', key: 'buyerBalanceReceived', width: 20 },
      
      // Costing (12)
      { header: 'Costing Supplier Inv', key: 'costingSupplierInvoice', width: 18 },
      { header: 'Costing TWL Invoice', key: 'costingTwlInvoice', width: 18 },
      { header: 'Profit', key: 'profit', width: 15 },
      { header: 'In Going', key: 'inGoing', width: 15 },
      { header: 'Out Going', key: 'outGoing', width: 15 },
      { header: 'CAL Charges', key: 'calCharges', width: 15 },
      { header: 'Other', key: 'other', width: 15 },
      { header: 'Foreign Bank Charges', key: 'foreignBankCharges', width: 20 },
      { header: 'Loan Interest', key: 'loanInterest', width: 15 },
      { header: 'Freight Charges (Cost)', key: 'freightChargesCost', width: 18 },
      { header: 'Total Expenses', key: 'totalExpenses', width: 15 },
      { header: 'NET PROFIT', key: 'netProfit', width: 18 }
    ];

    console.log('Adding project data to Excel...');

    // Add data rows - worksheet.addRow() will now automatically map by key
    projects.forEach((project, index) => {
      console.log(`Processing project ${index + 1}: ${project.projectName}`);
      
      worksheet.addRow({
        // Project Info
        projectNo: project.projectNo || '',
        projectName: project.projectName || '',
        projectDate: project.projectDate ? new Date(project.projectDate).toLocaleDateString() : '',
        
        // Supplier - Proforma Invoice
        supplierName: project.supplier?.proformaInvoice?.supplierName || '',
        supplierInvoiceNo: project.supplier?.proformaInvoice?.invoiceNumber || '',
        supplierInvoiceAmount: project.supplier?.proformaInvoice?.invoiceAmount || 0,
        supplierCreditNote: project.supplier?.proformaInvoice?.creditNote || 0,
        supplierFinalInvoice: project.supplier?.proformaInvoice?.finalInvoiceAmount || 0,
        
        // Supplier - Advance Payment
        loanAmount: project.supplier?.advancePayment?.loanAmount || 0,
        advancePaymentDate: project.supplier?.advancePayment?.paymentDate ? new Date(project.supplier.advancePayment.paymentDate).toLocaleDateString() : '',
        advanceReference: project.supplier?.advancePayment?.referenceNumber || '',
        twlContributionAdv: project.supplier?.advancePayment?.twlContribution || 0,
        totalPaymentAdv: project.supplier?.advancePayment?.totalPayment || 0,
        balanceAmountAdv: project.supplier?.advancePayment?.balanceAmount || 0,
        
        // Supplier - Balance Payment
        supplierBalanceAmount: project.supplier?.balancePayment?.amount || 0,
        supplierBalanceDate: project.supplier?.balancePayment?.date ? new Date(project.supplier.balancePayment.date).toLocaleDateString() : '',
        supplierBalanceRef: project.supplier?.balancePayment?.reference || '',
        twlContributionBal: project.supplier?.balancePayment?.twlContribution || 0,
        totalPaymentBal: project.supplier?.balancePayment?.totalPayment || 0,
        
        // Supplier - Summary
        supplierTotalAmount: project.supplier?.summary?.totalAmount || 0,
        supplierCancelAmount: project.supplier?.summary?.cancelAmount || 0,
        supplierBalancePayment: project.supplier?.summary?.balancePayment || 0,
        
        // Buyer - Proforma Invoice
        buyerName: project.buyer?.proformaInvoice?.buyerName || '',
        buyerInvoiceNo: project.buyer?.proformaInvoice?.invoiceNo || '',
        buyerInvoiceDate: project.buyer?.proformaInvoice?.invoiceDate ? new Date(project.buyer.proformaInvoice.invoiceDate).toLocaleDateString() : '',
        twlInvoiceAmount: project.buyer?.proformaInvoice?.twlInvoiceAmount || 0,
        buyerCreditNote: project.buyer?.proformaInvoice?.creditNote || 0,
        bankInterest: project.buyer?.proformaInvoice?.bankInterest || 0,
        freightCharges: project.buyer?.proformaInvoice?.freightCharges || 0,
        commission: project.buyer?.proformaInvoice?.commission || 0,
        buyerFinalInvoice: project.buyer?.proformaInvoice?.finalInvoiceAmount || 0,
        
        // Buyer - Advance Payment
        buyerAdvanceTwl: project.buyer?.advancePayment?.twlReceived || 0,
        buyerAdvanceBalance: project.buyer?.advancePayment?.balanceAmount || 0,
        buyerAdvanceDate: project.buyer?.advancePayment?.date ? new Date(project.buyer.advancePayment.date).toLocaleDateString() : '',
        buyerAdvanceRef: project.buyer?.advancePayment?.reference || '',
        
        // Buyer - Balance Payment
        buyerBalanceTwl: project.buyer?.balancePayment?.twlReceived || 0,
        buyerBalanceDate: project.buyer?.balancePayment?.date ? new Date(project.buyer.balancePayment.date).toLocaleDateString() : '',
        buyerBalanceRef: project.buyer?.balancePayment?.reference || '',
        
        // Buyer - Summary
        buyerTotalReceived: project.buyer?.summary?.totalReceived || 0,
        buyerCancel: project.buyer?.summary?.cancel || 0,
        buyerBalanceReceived: project.buyer?.summary?.balanceReceived || 0,
        
        // Costing
        costingSupplierInvoice: project.costing?.supplierInvoiceAmount || 0,
        costingTwlInvoice: project.costing?.twlInvoiceAmount || 0,
        profit: project.costing?.profit || 0,
        inGoing: project.costing?.inGoing || 0,
        outGoing: project.costing?.outGoing || 0,
        calCharges: project.costing?.calCharges || 0,
        other: project.costing?.other || 0,
        foreignBankCharges: project.costing?.foreignBankCharges || 0,
        loanInterest: project.costing?.loanInterest || 0,
        freightChargesCost: project.costing?.freightCharges || 0,
        totalExpenses: project.costing?.total || 0,
        netProfit: project.costing?.netProfit || 0
      });
    });

    console.log('Styling the worksheet...');

    // Style header row (row 1) with colors
    const headerRow = worksheet.getRow(1);
    headerRow.height = 35;
    
    const colorMap = [
      // Project (3) - Gray
      'FF4A5568', 'FF4A5568', 'FF4A5568',
      // Supplier Proforma (5) - Green shades
      'FF10B981', 'FF10B981', 'FF10B981', 'FF10B981', 'FF10B981',
      // Supplier Advance (6) - Darker green
      'FF059669', 'FF059669', 'FF059669', 'FF059669', 'FF059669', 'FF059669',
      // Supplier Balance (5) - Even darker green
      'FF047857', 'FF047857', 'FF047857', 'FF047857', 'FF047857',
      // Supplier Summary (3) - Darkest green
      'FF065F46', 'FF065F46', 'FF065F46',
      // Buyer Proforma (9) - Blue shades
      'FF3B82F6', 'FF3B82F6', 'FF3B82F6', 'FF3B82F6', 'FF3B82F6', 'FF3B82F6', 'FF3B82F6', 'FF3B82F6', 'FF3B82F6',
      // Buyer Advance (4) - Darker blue
      'FF2563EB', 'FF2563EB', 'FF2563EB', 'FF2563EB',
      // Buyer Balance (3) - Even darker blue
      'FF1E40AF', 'FF1E40AF', 'FF1E40AF',
      // Buyer Summary (3) - Darkest blue
      'FF1E3A8A', 'FF1E3A8A', 'FF1E3A8A',
      // Costing (12) - Yellow and red
      'FFFBBF24', 'FFFBBF24', 'FFF59E0B', 'FFEF4444', 'FFEF4444', 'FFEF4444', 'FFEF4444', 'FFEF4444', 'FFEF4444', 'FFEF4444', 'FFDC2626', 'FF16A34A'
    ];

    headerRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colorMap[colNumber - 1] || 'FF4A5568' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF000000' } },
        bottom: { style: 'medium', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });

    // Style data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      
      row.height = 25;
      row.eachCell((cell, colNumber) => {
        // Borders
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
        };

        // Number formatting
        if (typeof cell.value === 'number') {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = '$#,##0.00';
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }

        // Alternate row colors
        if (rowNumber % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' }
          };
        }

        // NET PROFIT column highlighting (last column = 52)
        if (colNumber === 52) {
          const netProfit = cell.value || 0;
          if (netProfit >= 0) {
            cell.font = { bold: true, color: { argb: 'FF047857' }, size: 11 };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFD1FAE5' }
            };
          } else {
            cell.font = { bold: true, color: { argb: 'FFDC2626' }, size: 11 };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFEE2E2' }
            };
          }
        }
      });
    });

    // Freeze panes (header row)
    worksheet.views = [
      { state: 'frozen', ySplit: 1 }
    ];

    // Auto-filter on header
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 52 }
    };

    console.log('Generating Excel file...');

    // Generate Excel file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=TWL_Projects_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

    console.log('Excel export completed successfully');

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to export to Excel', error: error.message });
  }
});

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create project (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const project = new Project({
      ...req.body,
      createdBy: req.user.id
    });

    await project.save();
    res.status(201).json({ success: true, message: 'Project created successfully', project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update project (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete project (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;