const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const ExcelJS = require('exceljs');

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

// Export all projects to Excel - SINGLE TABLE FORMAT
router.get('/export/excel', auth, async (req, res) => {
  try {
    console.log('Starting Excel export...');
    
    // Fetch all projects
    const projects = await Project.find().sort({ projectDate: -1 });
    console.log(`Found ${projects.length} projects to export`);

    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'No projects found to export' });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TWL System';
    workbook.created = new Date();
    
    const worksheet = workbook.addWorksheet('All Projects', {
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true }
    });

    // Title Row
    worksheet.mergeCells('A1:AZ1');
    const titleRow = worksheet.getCell('A1');
    titleRow.value = '🏢 TWL SYSTEM - COMPREHENSIVE PROJECTS REPORT';
    titleRow.font = { size: 20, bold: true, color: { argb: 'FFFFFFFF' } };
    titleRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' }
    };
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 40;

    // Date Row
    worksheet.mergeCells('A2:AZ2');
    const dateRow = worksheet.getCell('A2');
    dateRow.value = `Generated on: ${new Date().toLocaleString()} | Total Projects: ${projects.length}`;
    dateRow.font = { size: 11, italic: true, bold: true };
    dateRow.alignment = { horizontal: 'center' };
    dateRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' }
    };
    worksheet.getRow(2).height = 25;

    // Empty row
    worksheet.getRow(3).height = 10;

    // HEADER ROW - Define all columns
    const headerRow = worksheet.getRow(4);
    const headers = [
      // Project Info (3)
      { header: 'Project No', key: 'projectNo', width: 15, color: 'FF4A5568' },
      { header: 'Project Name', key: 'projectName', width: 25, color: 'FF4A5568' },
      { header: 'Project Date', key: 'projectDate', width: 15, color: 'FF4A5568' },
      
      // Supplier - Proforma Invoice (5)
      { header: 'Supplier Name', key: 'supplierName', width: 20, color: 'FF10B981' },
      { header: 'Supplier Invoice No', key: 'supplierInvoiceNo', width: 18, color: 'FF10B981' },
      { header: 'Supplier Invoice Amt', key: 'supplierInvoiceAmount', width: 18, color: 'FF10B981' },
      { header: 'Supplier Credit Note', key: 'supplierCreditNote', width: 18, color: 'FF10B981' },
      { header: 'Supplier Final Invoice', key: 'supplierFinalInvoice', width: 20, color: 'FF10B981' },
      
      // Supplier - Advance Payment (6)
      { header: 'Loan Amount', key: 'loanAmount', width: 15, color: 'FF059669' },
      { header: 'Advance Payment Date', key: 'advancePaymentDate', width: 18, color: 'FF059669' },
      { header: 'Advance Reference', key: 'advanceReference', width: 18, color: 'FF059669' },
      { header: 'TWL Contribution (Adv)', key: 'twlContributionAdv', width: 20, color: 'FF059669' },
      { header: 'Total Payment (Adv)', key: 'totalPaymentAdv', width: 18, color: 'FF059669' },
      { header: 'Balance Amount (Adv)', key: 'balanceAmountAdv', width: 18, color: 'FF059669' },
      
      // Supplier - Balance Payment (5)
      { header: 'Supplier Balance Amt', key: 'supplierBalanceAmount', width: 18, color: 'FF047857' },
      { header: 'Supplier Balance Date', key: 'supplierBalanceDate', width: 18, color: 'FF047857' },
      { header: 'Supplier Balance Ref', key: 'supplierBalanceRef', width: 18, color: 'FF047857' },
      { header: 'TWL Contribution (Bal)', key: 'twlContributionBal', width: 20, color: 'FF047857' },
      { header: 'Total Payment (Bal)', key: 'totalPaymentBal', width: 18, color: 'FF047857' },
      
      // Supplier - Summary (3)
      { header: 'Supplier Total Amt', key: 'supplierTotalAmount', width: 18, color: 'FF065F46' },
      { header: 'Supplier Cancel Amt', key: 'supplierCancelAmount', width: 18, color: 'FF065F46' },
      { header: 'Supplier Balance Pay', key: 'supplierBalancePayment', width: 20, color: 'FF065F46' },
      
      // Buyer - Proforma Invoice (9)
      { header: 'Buyer Name', key: 'buyerName', width: 20, color: 'FF3B82F6' },
      { header: 'Buyer Invoice No', key: 'buyerInvoiceNo', width: 18, color: 'FF3B82F6' },
      { header: 'Buyer Invoice Date', key: 'buyerInvoiceDate', width: 18, color: 'FF3B82F6' },
      { header: 'TWL Invoice Amount', key: 'twlInvoiceAmount', width: 18, color: 'FF3B82F6' },
      { header: 'Buyer Credit Note', key: 'buyerCreditNote', width: 18, color: 'FF3B82F6' },
      { header: 'Bank Interest', key: 'bankInterest', width: 15, color: 'FF3B82F6' },
      { header: 'Freight Charges', key: 'freightCharges', width: 15, color: 'FF3B82F6' },
      { header: 'Commission', key: 'commission', width: 15, color: 'FF3B82F6' },
      { header: 'Buyer Final Invoice', key: 'buyerFinalInvoice', width: 18, color: 'FF3B82F6' },
      
      // Buyer - Advance Payment (4)
      { header: 'Buyer Advance TWL', key: 'buyerAdvanceTwl', width: 18, color: 'FF2563EB' },
      { header: 'Buyer Advance Balance', key: 'buyerAdvanceBalance', width: 20, color: 'FF2563EB' },
      { header: 'Buyer Advance Date', key: 'buyerAdvanceDate', width: 18, color: 'FF2563EB' },
      { header: 'Buyer Advance Ref', key: 'buyerAdvanceRef', width: 18, color: 'FF2563EB' },
      
      // Buyer - Balance Payment (3)
      { header: 'Buyer Balance TWL', key: 'buyerBalanceTwl', width: 18, color: 'FF1E40AF' },
      { header: 'Buyer Balance Date', key: 'buyerBalanceDate', width: 18, color: 'FF1E40AF' },
      { header: 'Buyer Balance Ref', key: 'buyerBalanceRef', width: 18, color: 'FF1E40AF' },
      
      // Buyer - Summary (3)
      { header: 'Buyer Total Received', key: 'buyerTotalReceived', width: 18, color: 'FF1E3A8A' },
      { header: 'Buyer Cancel', key: 'buyerCancel', width: 15, color: 'FF1E3A8A' },
      { header: 'Buyer Balance Received', key: 'buyerBalanceReceived', width: 20, color: 'FF1E3A8A' },
      
      // Costing (12)
      { header: 'Costing Supplier Inv', key: 'costingSupplierInvoice', width: 18, color: 'FFFBBF24' },
      { header: 'Costing TWL Invoice', key: 'costingTwlInvoice', width: 18, color: 'FFFBBF24' },
      { header: 'Profit', key: 'profit', width: 15, color: 'FFF59E0B' },
      { header: 'In Going', key: 'inGoing', width: 15, color: 'FFEF4444' },
      { header: 'Out Going', key: 'outGoing', width: 15, color: 'FFEF4444' },
      { header: 'CAL Charges', key: 'calCharges', width: 15, color: 'FFEF4444' },
      { header: 'Other', key: 'other', width: 15, color: 'FFEF4444' },
      { header: 'Foreign Bank Charges', key: 'foreignBankCharges', width: 20, color: 'FFEF4444' },
      { header: 'Loan Interest', key: 'loanInterest', width: 15, color: 'FFEF4444' },
      { header: 'Freight Charges', key: 'freightChargesCost', width: 18, color: 'FFEF4444' },
      { header: 'Total Expenses', key: 'totalExpenses', width: 15, color: 'FFDC2626' },
      { header: 'NET PROFIT', key: 'netProfit', width: 18, color: 'FF16A34A' }
    ];

    // Set column widths and create header
    headers.forEach((col, index) => {
      worksheet.getColumn(index + 1).width = col.width;
      const cell = headerRow.getCell(index + 1);
      cell.value = col.header;
      cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: col.color }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF000000' } },
        bottom: { style: 'medium', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });
    headerRow.height = 35;

    console.log('Adding project data to Excel...');

    // Add data rows
    projects.forEach((project, index) => {
      const rowData = {
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
      };

      const row = worksheet.addRow(rowData);

      // Style data rows
      row.height = 25;
      row.eachCell((cell, colNumber) => {
        // Borders
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
        };

        // Alignment and formatting
        if (typeof cell.value === 'number') {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.numFmt = '$#,##0.00';
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }

        // Alternate row colors
        if (index % 2 === 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' }
          };
        } else {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' }
          };
        }

        // NET PROFIT column (last column)
        if (colNumber === headers.length) {
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
          cell.border = {
            ...cell.border,
            left: { style: 'medium', color: { argb: 'FF000000' } },
            right: { style: 'medium', color: { argb: 'FF000000' } }
          };
        }

        // Profit column
        if (colNumber === headers.length - 9) {
          cell.font = { bold: true, size: 10 };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEF3C7' }
          };
        }

        // Supplier Final Invoice (column 8)
        if (colNumber === 8) {
          cell.font = { bold: true, size: 10 };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: index % 2 === 0 ? 'FFD1FAE5' : 'FFB7F0D4' }
          };
        }

        // Buyer Final Invoice (column 32)
        if (colNumber === 32) {
          cell.font = { bold: true, size: 10 };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: index % 2 === 0 ? 'FFBFDBFE' : 'FF93C5FD' }
          };
        }
      });
    });

    console.log('Adding summary row...');

    // Add summary row at the bottom
    const summaryRowNum = projects.length + 5;
    const summaryRow = worksheet.getRow(summaryRowNum);
    summaryRow.height = 30;
    
    // Merge cells for "TOTAL" label
    worksheet.mergeCells(summaryRowNum, 1, summaryRowNum, 3);
    const totalLabelCell = summaryRow.getCell(1);
    totalLabelCell.value = 'TOTAL SUMMARY';
    totalLabelCell.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    totalLabelCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F2937' }
    };
    totalLabelCell.alignment = { vertical: 'middle', horizontal: 'center' };
    totalLabelCell.border = {
      top: { style: 'double', color: { argb: 'FF000000' } },
      bottom: { style: 'double', color: { argb: 'FF000000' } },
      left: { style: 'double', color: { argb: 'FF000000' } },
      right: { style: 'double', color: { argb: 'FF000000' } }
    };

    // Calculate and add totals for numeric columns (skip text columns)
    const numericColumnIndices = [6, 7, 8, 9, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 26, 27, 28, 29, 30, 31, 33, 34, 37, 40, 41, 42, 44, 45, 46, 47, 48, 49, 50, 51, 52];
    
    numericColumnIndices.forEach(colIndex => {
      const cell = summaryRow.getCell(colIndex);
      const columnLetter = worksheet.getColumn(colIndex).letter;
      cell.value = { formula: `SUM(${columnLetter}5:${columnLetter}${summaryRowNum - 1})` };
      cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F2937' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
      cell.numFmt = '$#,##0.00';
      cell.border = {
        top: { style: 'double', color: { argb: 'FF000000' } },
        bottom: { style: 'double', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });

    // Freeze panes (freeze header rows and first 3 columns)
    worksheet.views = [
      { state: 'frozen', xSplit: 3, ySplit: 4 }
    ];

    // Auto-filter
    worksheet.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 4, column: headers.length }
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
    res.status(500).json({ success: false, message: 'Failed to export to Excel', error: error.message });
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