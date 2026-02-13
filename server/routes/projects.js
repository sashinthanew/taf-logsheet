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

// Export all projects to Excel
router.get('/export/excel', auth, async (req, res) => {
  try {
    const projects = await Project.find().sort({ projectDate: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Projects Report', {
      pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    // Set column widths
    worksheet.columns = [
      { width: 15 }, { width: 15 }, { width: 12 }, { width: 18 },
      { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 },
      { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 },
      { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 },
      { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }
    ];

    // Title Row
    worksheet.mergeCells('A1:T1');
    const titleRow = worksheet.getCell('A1');
    titleRow.value = '🏢 TWL SYSTEM - COMPREHENSIVE PROJECTS REPORT';
    titleRow.font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
    titleRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' }
    };
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 35;

    // Date Row
    worksheet.mergeCells('A2:T2');
    const dateRow = worksheet.getCell('A2');
    dateRow.value = `Generated on: ${new Date().toLocaleString()}`;
    dateRow.font = { size: 11, italic: true };
    dateRow.alignment = { horizontal: 'center' };
    worksheet.getRow(2).height = 20;

    let currentRow = 4;

    projects.forEach((project, index) => {
      // PROJECT HEADER
      worksheet.mergeCells(`A${currentRow}:T${currentRow}`);
      const projectHeader = worksheet.getCell(`A${currentRow}`);
      projectHeader.value = `📋 PROJECT: ${project.projectName} (${project.projectNo})`;
      projectHeader.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
      projectHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4A5568' }
      };
      projectHeader.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      worksheet.getRow(currentRow).height = 25;
      currentRow++;

      // Project Date
      worksheet.mergeCells(`A${currentRow}:D${currentRow}`);
      const dateCell = worksheet.getCell(`A${currentRow}`);
      dateCell.value = `Date: ${new Date(project.projectDate).toLocaleDateString()}`;
      dateCell.font = { size: 10, italic: true };
      dateCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF7FAFC' }
      };
      currentRow++;

      // SUPPLIER SECTION
      currentRow++;
      worksheet.mergeCells(`A${currentRow}:T${currentRow}`);
      const supplierHeader = worksheet.getCell(`A${currentRow}`);
      supplierHeader.value = '🏭 SUPPLIER DETAILS';
      supplierHeader.font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
      supplierHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF48BB78' }
      };
      supplierHeader.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      worksheet.getRow(currentRow).height = 22;
      currentRow++;

      // Supplier Proforma Invoice
      const supplierProformaHeaders = ['Field', 'Value', '', 'Field', 'Value'];
      supplierProformaHeaders.forEach((header, idx) => {
        const cell = worksheet.getCell(currentRow, idx + 1);
        cell.value = header;
        cell.font = { bold: true, size: 10 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE6FFFA' }
        };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      currentRow++;

      // Supplier Data
      const supplierData = [
        ['Supplier Name', project.supplier?.proformaInvoice?.supplierName || 'N/A', '', 'Invoice Amount', `$${(project.supplier?.proformaInvoice?.invoiceAmount || 0).toFixed(2)}`],
        ['Invoice Number', project.supplier?.proformaInvoice?.invoiceNumber || 'N/A', '', 'Credit Note', `$${(project.supplier?.proformaInvoice?.creditNote || 0).toFixed(2)}`],
        ['Final Invoice', `$${(project.supplier?.proformaInvoice?.finalInvoiceAmount || 0).toFixed(2)}`, '', '', '']
      ];

      supplierData.forEach(row => {
        row.forEach((value, idx) => {
          const cell = worksheet.getCell(currentRow, idx + 1);
          cell.value = value;
          cell.font = { size: 10 };
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          };
          if (idx === 0 || idx === 3) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF0FFF4' }
            };
            cell.font = { ...cell.font, bold: true };
          }
        });
        currentRow++;
      });

      // Supplier Payments
      currentRow++;
      ['Advance Payment', 'Balance Payment', 'Summary'].forEach(section => {
        const sectionCell = worksheet.getCell(`A${currentRow}`);
        worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
        sectionCell.value = section;
        sectionCell.font = { bold: true, size: 10 };
        sectionCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFBEE3F8' }
        };
        currentRow++;

        if (section === 'Advance Payment') {
          [
            ['Loan Amount', `$${(project.supplier?.advancePayment?.loanAmount || 0).toFixed(2)}`, 'TWL Contribution', `$${(project.supplier?.advancePayment?.twlContribution || 0).toFixed(2)}`],
            ['Total Payment', `$${(project.supplier?.advancePayment?.totalPayment || 0).toFixed(2)}`, 'Balance Amount', `$${(project.supplier?.advancePayment?.balanceAmount || 0).toFixed(2)}`]
          ].forEach(row => {
            row.forEach((value, idx) => {
              const cell = worksheet.getCell(currentRow, idx + 1);
              cell.value = value;
              cell.font = { size: 9 };
              cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
              };
            });
            currentRow++;
          });
        } else if (section === 'Balance Payment') {
          [
            ['Amount', `$${(project.supplier?.balancePayment?.amount || 0).toFixed(2)}`, 'TWL Contribution', `$${(project.supplier?.balancePayment?.twlContribution || 0).toFixed(2)}`],
            ['Total Payment', `$${(project.supplier?.balancePayment?.totalPayment || 0).toFixed(2)}`, '', '']
          ].forEach(row => {
            row.forEach((value, idx) => {
              const cell = worksheet.getCell(currentRow, idx + 1);
              cell.value = value;
              cell.font = { size: 9 };
              cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
              };
            });
            currentRow++;
          });
        } else {
          [
            ['Total Amount', `$${(project.supplier?.summary?.totalAmount || 0).toFixed(2)}`, 'Cancel Amount', `$${(project.supplier?.summary?.cancelAmount || 0).toFixed(2)}`],
            ['Balance Payment', `$${(project.supplier?.summary?.balancePayment || 0).toFixed(2)}`, '', '']
          ].forEach(row => {
            row.forEach((value, idx) => {
              const cell = worksheet.getCell(currentRow, idx + 1);
              cell.value = value;
              cell.font = { size: 9, bold: idx % 2 === 0 };
              cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
              };
              if (idx % 2 === 1) {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFEF5E7' }
                };
              }
            });
            currentRow++;
          });
        }
        currentRow++;
      });

      // BUYER SECTION
      currentRow++;
      worksheet.mergeCells(`A${currentRow}:T${currentRow}`);
      const buyerHeader = worksheet.getCell(`A${currentRow}`);
      buyerHeader.value = '🛒 BUYER DETAILS';
      buyerHeader.font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
      buyerHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF3B82F6' }
      };
      buyerHeader.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      worksheet.getRow(currentRow).height = 22;
      currentRow++;

      // Buyer Proforma Invoice
      [
        ['Buyer Name', project.buyer?.proformaInvoice?.buyerName || 'N/A', 'Invoice No', project.buyer?.proformaInvoice?.invoiceNo || 'N/A'],
        ['TWL Invoice Amount', `$${(project.buyer?.proformaInvoice?.twlInvoiceAmount || 0).toFixed(2)}`, 'Credit Note', `$${(project.buyer?.proformaInvoice?.creditNote || 0).toFixed(2)}`],
        ['Bank Interest', `$${(project.buyer?.proformaInvoice?.bankInterest || 0).toFixed(2)}`, 'Freight Charges', `$${(project.buyer?.proformaInvoice?.freightCharges || 0).toFixed(2)}`],
        ['Commission', `$${(project.buyer?.proformaInvoice?.commission || 0).toFixed(2)}`, 'Final Invoice', `$${(project.buyer?.proformaInvoice?.finalInvoiceAmount || 0).toFixed(2)}`]
      ].forEach(row => {
        row.forEach((value, idx) => {
          const cell = worksheet.getCell(currentRow, idx + 1);
          cell.value = value;
          cell.font = { size: 10, bold: idx % 2 === 0 };
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          };
          if (idx % 2 === 0) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFE0F2FE' }
            };
          }
        });
        currentRow++;
      });

      // Buyer Payments
      currentRow++;
      ['Advance Payment', 'Balance Payment', 'Summary'].forEach(section => {
        const sectionCell = worksheet.getCell(`A${currentRow}`);
        worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
        sectionCell.value = section;
        sectionCell.font = { bold: true, size: 10 };
        sectionCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFBFDBFE' }
        };
        currentRow++;

        if (section === 'Advance Payment') {
          [
            ['TWL Received', `$${(project.buyer?.advancePayment?.twlReceived || 0).toFixed(2)}`, 'Balance Amount', `$${(project.buyer?.advancePayment?.balanceAmount || 0).toFixed(2)}`]
          ].forEach(row => {
            row.forEach((value, idx) => {
              const cell = worksheet.getCell(currentRow, idx + 1);
              cell.value = value;
              cell.font = { size: 9 };
              cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
              };
            });
            currentRow++;
          });
        } else if (section === 'Balance Payment') {
          [
            ['TWL Received', `$${(project.buyer?.balancePayment?.twlReceived || 0).toFixed(2)}`, '', '']
          ].forEach(row => {
            row.forEach((value, idx) => {
              const cell = worksheet.getCell(currentRow, idx + 1);
              cell.value = value;
              cell.font = { size: 9 };
              cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
              };
            });
            currentRow++;
          });
        } else {
          [
            ['Total Received', `$${(project.buyer?.summary?.totalReceived || 0).toFixed(2)}`, 'Cancel', `$${(project.buyer?.summary?.cancel || 0).toFixed(2)}`],
            ['Balance Received', `$${(project.buyer?.summary?.balanceReceived || 0).toFixed(2)}`, '', '']
          ].forEach(row => {
            row.forEach((value, idx) => {
              const cell = worksheet.getCell(currentRow, idx + 1);
              cell.value = value;
              cell.font = { size: 9, bold: idx % 2 === 0 };
              cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
              };
              if (idx % 2 === 1) {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFEF5E7' }
                };
              }
            });
            currentRow++;
          });
        }
        currentRow++;
      });

      // COSTING SECTION
      currentRow++;
      worksheet.mergeCells(`A${currentRow}:T${currentRow}`);
      const costingHeader = worksheet.getCell(`A${currentRow}`);
      costingHeader.value = '💰 COSTING & PROFITABILITY ANALYSIS';
      costingHeader.font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
      costingHeader.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFBBF24' }
      };
      costingHeader.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      worksheet.getRow(currentRow).height = 22;
      currentRow++;

      // Revenue
      [
        ['Supplier Invoice Amount', `$${(project.costing?.supplierInvoiceAmount || 0).toFixed(2)}`, 'TWL Invoice Amount', `$${(project.costing?.twlInvoiceAmount || 0).toFixed(2)}`],
        ['PROFIT', `$${(project.costing?.profit || 0).toFixed(2)}`, '', '']
      ].forEach(row => {
        row.forEach((value, idx) => {
          const cell = worksheet.getCell(currentRow, idx + 1);
          cell.value = value;
          cell.font = { size: 10, bold: idx % 2 === 0 };
          cell.border = {
            top: { style: 'medium' },
            bottom: { style: 'medium' },
            left: { style: 'medium' },
            right: { style: 'medium' }
          };
          if (idx % 2 === 0) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFEF3C7' }
            };
          } else {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFDE68A' }
            };
          }
        });
        currentRow++;
      });

      // Expenses
      currentRow++;
      const expensesCell = worksheet.getCell(`A${currentRow}`);
      worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
      expensesCell.value = 'EXPENSES BREAKDOWN';
      expensesCell.font = { bold: true, size: 10 };
      expensesCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFECACA' }
      };
      currentRow++;

      [
        ['In Going', `$${(project.costing?.inGoing || 0).toFixed(2)}`, 'Out Going', `$${(project.costing?.outGoing || 0).toFixed(2)}`],
        ['CAL Charges', `$${(project.costing?.calCharges || 0).toFixed(2)}`, 'Other', `$${(project.costing?.other || 0).toFixed(2)}`],
        ['Foreign Bank Charges', `$${(project.costing?.foreignBankCharges || 0).toFixed(2)}`, 'Loan Interest', `$${(project.costing?.loanInterest || 0).toFixed(2)}`],
        ['Freight Charges', `$${(project.costing?.freightCharges || 0).toFixed(2)}`, 'TOTAL EXPENSES', `$${(project.costing?.total || 0).toFixed(2)}`]
      ].forEach(row => {
        row.forEach((value, idx) => {
          const cell = worksheet.getCell(currentRow, idx + 1);
          cell.value = value;
          cell.font = { size: 9, bold: idx % 2 === 0 };
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
        currentRow++;
      });

      // NET PROFIT
      currentRow++;
      const netProfitValue = project.costing?.netProfit || 0;
      ['NET PROFIT', `$${netProfitValue.toFixed(2)}`].forEach((value, idx) => {
        const cell = worksheet.getCell(currentRow, idx + 1);
        cell.value = value;
        cell.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.border = {
          top: { style: 'thick' },
          bottom: { style: 'thick' },
          left: { style: 'thick' },
          right: { style: 'thick' }
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: netProfitValue >= 0 ? 'FF10B981' : 'FFEF4444' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      worksheet.getRow(currentRow).height = 30;
      currentRow++;

      // Spacer between projects
      currentRow += 3;
    });

    // Generate Excel file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=TWL_Projects_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({ success: false, message: 'Failed to export to Excel' });
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