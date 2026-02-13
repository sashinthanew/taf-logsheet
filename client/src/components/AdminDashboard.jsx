import { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const [formData, setFormData] = useState({
    // Project Section
    projectName: '',
    projectNo: '',
    projectDate: '',
    
    // Supplier - Proforma Invoice
    supplierName: '',
    supplierInvoiceNumber: '',
    supplierInvoiceAmount: '',
    creditNote: '',
    finalInvoiceAmount: '',
    
    // Supplier - Advance Payment
    loanAmount: '',
    advancePaymentDate: '',
    advanceReferenceNumber: '',
    twlContribution: '',
    totalPayment: '',
    balanceAmount: '',
    
    // Supplier - Balance Payment
    supplierBalanceAmount: '',
    supplierBalanceDate: '',
    supplierBalanceReference: '',
    supplierBalanceTwlContribution: '',
    supplierBalanceTotalPayment: '',
    
    // Supplier - Summary
    supplierTotalAmount: '',
    supplierCancelAmount: '',
    supplierSummaryBalancePayment: '',
    
    // Buyer - Proforma Invoice
    buyerProformaInvoiceNo: '',
    buyerProformaInvoiceDate: '',
    buyerProformaAmount: '',
    
    // Buyer - Advance Payment
    buyerAdvanceAmount: '',
    buyerAdvanceDate: '',
    buyerAdvanceReference: '',
    
    // Buyer - Balance Payment
    buyerBalanceAmount: '',
    buyerBalanceDate: '',
    buyerBalanceReference: '',
    buyerBalanceTwlContribution: '',  // NEW
    buyerBalanceTotalPayment: '',     // NEW
    
    // Buyer - Summary (NEW SECTION)
    buyerTotalAmount: '',             // NEW
    buyerCancelAmount: '',            // NEW
    buyerSummaryBalancePayment: '',   // NEW
    
    // Costing
    costingNotes: '',
    costingSupplierInvoiceAmount: '',
    costingTwlInvoiceAmount: '',
    costingProfit: '',
    costingInGoing: '',
    costingOutGoing: '',
    costingCalCharges: '',
    costingOther: '',
    costingForeignBankCharges: '',
    costingLoanInterest: '',
    costingFreightCharges: '',
    costingTotal: '',
    costingNetProfit: '',
  });
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Auto-calculate total payment and balance amount
  useEffect(() => {
    const loan = parseFloat(formData.loanAmount) || 0;
    const twl = parseFloat(formData.twlContribution) || 0;
    const total = loan + twl;
    const finalInvoice = parseFloat(formData.finalInvoiceAmount) || 0;
    const balance = finalInvoice - total;
    
    setFormData(prev => ({
      ...prev,
      totalPayment: total.toFixed(2),
      balanceAmount: balance.toFixed(2)
    }));
  }, [formData.loanAmount, formData.twlContribution, formData.finalInvoiceAmount]);

  // Auto-calculate supplier balance payment total
  useEffect(() => {
    const amount = parseFloat(formData.supplierBalanceAmount) || 0;
    const twl = parseFloat(formData.supplierBalanceTwlContribution) || 0;
    const total = amount + twl;
    
    setFormData(prev => ({
      ...prev,
      supplierBalanceTotalPayment: total.toFixed(2)
    }));
  }, [formData.supplierBalanceAmount, formData.supplierBalanceTwlContribution]);

  // Auto-calculate final invoice amount
  useEffect(() => {
    const invoiceAmount = parseFloat(formData.supplierInvoiceAmount) || 0;
    const creditNote = parseFloat(formData.creditNote) || 0;
    const finalAmount = invoiceAmount - creditNote;
    
    setFormData(prev => ({
      ...prev,
      finalInvoiceAmount: finalAmount.toFixed(2)
    }));
  }, [formData.supplierInvoiceAmount, formData.creditNote]);

  // Auto-calculate supplier summary
  useEffect(() => {
    const advanceTotalPayment = parseFloat(formData.totalPayment) || 0;
    const balanceTotalPayment = parseFloat(formData.supplierBalanceTotalPayment) || 0;
    const creditNote = parseFloat(formData.creditNote) || 0;
    const finalInvoiceAmount = parseFloat(formData.finalInvoiceAmount) || 0;
    
    // Total Amount = Total Payment (Advance) + Total Payment (Balance)
    const totalAmount = advanceTotalPayment + balanceTotalPayment;
    
    // Cancel Amount = Credit Note - Total Amount
    const cancelAmount = creditNote - totalAmount;
    
    // Balance Payment = Final Invoice Amount - Total Amount
    const balancePayment = finalInvoiceAmount - totalAmount;
    
    setFormData(prev => ({
      ...prev,
      supplierTotalAmount: totalAmount.toFixed(2),
      supplierCancelAmount: cancelAmount.toFixed(2),
      supplierSummaryBalancePayment: balancePayment.toFixed(2)
    }));
  }, [
    formData.totalPayment,
    formData.supplierBalanceTotalPayment,
    formData.creditNote,
    formData.finalInvoiceAmount
  ]);

  // Auto-hide success/error messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Transform form data to match backend schema
      const projectData = {
        projectName: formData.projectName,
        projectNo: formData.projectNo,
        projectDate: formData.projectDate,
        supplier: {
          proformaInvoice: {
            supplierName: formData.supplierName,
            invoiceNumber: formData.supplierInvoiceNumber,
            invoiceAmount: parseFloat(formData.supplierInvoiceAmount) || 0,
            creditNote: formData.creditNote,
            finalInvoiceAmount: parseFloat(formData.finalInvoiceAmount) || 0
          },
          advancePayment: {
            loanAmount: parseFloat(formData.loanAmount) || 0,
            paymentDate: formData.advancePaymentDate,
            referenceNumber: formData.advanceReferenceNumber,
            twlContribution: parseFloat(formData.twlContribution) || 0,
            totalPayment: parseFloat(formData.totalPayment) || 0,
            balanceAmount: parseFloat(formData.balanceAmount) || 0
          },
          balancePayment: {
            amount: parseFloat(formData.supplierBalanceAmount) || 0,
            date: formData.supplierBalanceDate,
            reference: formData.supplierBalanceReference,
            twlContribution: parseFloat(formData.supplierBalanceTwlContribution) || 0,
            totalPayment: parseFloat(formData.supplierBalanceTotalPayment) || 0
          },
          summary: {
            totalAmount: parseFloat(formData.supplierTotalAmount) || 0,
            cancelAmount: parseFloat(formData.supplierCancelAmount) || 0,
            balancePayment: parseFloat(formData.supplierSummaryBalancePayment) || 0
          }
        },
        buyer: {
          proformaInvoice: {
            invoiceNo: formData.buyerProformaInvoiceNo,
            invoiceDate: formData.buyerProformaInvoiceDate,
            amount: parseFloat(formData.buyerProformaAmount) || 0
          },
          advancePayment: {
            amount: parseFloat(formData.buyerAdvanceAmount) || 0,
            date: formData.buyerAdvanceDate,
            reference: formData.buyerAdvanceReference
          },
          balancePayment: {
            amount: parseFloat(formData.buyerBalanceAmount) || 0,
            date: formData.buyerBalanceDate,
            reference: formData.buyerBalanceReference,
            twlContribution: parseFloat(formData.buyerBalanceTwlContribution) || 0,  // NEW
            totalPayment: parseFloat(formData.buyerBalanceTotalPayment) || 0         // NEW
          },
          summary: {  // NEW SECTION
            totalAmount: parseFloat(formData.buyerTotalAmount) || 0,
            cancelAmount: parseFloat(formData.buyerCancelAmount) || 0,
            balancePayment: parseFloat(formData.buyerSummaryBalancePayment) || 0
          }
        },
        costing: {
          supplierInvoiceAmount: parseFloat(formData.costingSupplierInvoiceAmount) || 0,
          twlInvoiceAmount: parseFloat(formData.costingTwlInvoiceAmount) || 0,
          profit: parseFloat(formData.costingProfit) || 0,
          inGoing: parseFloat(formData.costingInGoing) || 0,
          outGoing: parseFloat(formData.costingOutGoing) || 0,
          calCharges: parseFloat(formData.costingCalCharges) || 0,
          other: parseFloat(formData.costingOther) || 0,
          foreignBankCharges: parseFloat(formData.costingForeignBankCharges) || 0,
          loanInterest: parseFloat(formData.costingLoanInterest) || 0,
          freightCharges: parseFloat(formData.costingFreightCharges) || 0,
          total: parseFloat(formData.costingTotal) || 0,
          netProfit: parseFloat(formData.costingNetProfit) || 0,
          notes: formData.costingNotes
        }
      };

      const url = editingProject 
        ? `http://localhost:5000/api/projects/${editingProject._id}`
        : 'http://localhost:5000/api/projects';
      
      const method = editingProject ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projectData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(editingProject ? '✓ Project updated successfully!' : '✓ Project created successfully!');
        resetForm();
        fetchProjects();
        setShowForm(false); // Hide form after success
        setTimeout(() => setShowForm(true), 100); // Show form again for next entry
      } else {
        setError(data.message || 'Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      projectName: '',
      projectNo: '',
      projectDate: '',
      supplierName: '',
      supplierInvoiceNumber: '',
      supplierInvoiceAmount: '',
      creditNote: '',
      finalInvoiceAmount: '',
      loanAmount: '',
      advancePaymentDate: '',
      advanceReferenceNumber: '',
      twlContribution: '',
      totalPayment: '',
      balanceAmount: '',
      supplierBalanceAmount: '',
      supplierBalanceDate: '',
      supplierBalanceReference: '',
      supplierBalanceTwlContribution: '',
      supplierBalanceTotalPayment: '',
      supplierTotalAmount: '',
      supplierCancelAmount: '',
      supplierSummaryBalancePayment: '',
      buyerProformaInvoiceNo: '',
      buyerProformaInvoiceDate: '',
      buyerProformaAmount: '',
      buyerAdvanceAmount: '',
      buyerAdvanceDate: '',
      buyerAdvanceReference: '',
      buyerBalanceAmount: '',
      buyerBalanceDate: '',
      buyerBalanceReference: '',
      buyerBalanceTwlContribution: '',   // NEW
      buyerBalanceTotalPayment: '',      // NEW
      buyerTotalAmount: '',              // NEW
      buyerCancelAmount: '',             // NEW
      buyerSummaryBalancePayment: '',    // NEW
      costingNotes: '',
      costingSupplierInvoiceAmount: '',
      costingTwlInvoiceAmount: '',
      costingProfit: '',
      costingInGoing: '',
      costingOutGoing: '',
      costingCalCharges: '',
      costingOther: '',
      costingForeignBankCharges: '',
      costingLoanInterest: '',
      costingFreightCharges: '',
      costingTotal: '',
      costingNetProfit: '',
    });
    setEditingProject(null);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      projectName: project.projectName,
      projectNo: project.projectNo,
      projectDate: project.projectDate?.split('T')[0] || '',
      supplierName: project.supplier?.proformaInvoice?.supplierName || '',
      supplierInvoiceNumber: project.supplier?.proformaInvoice?.invoiceNumber || '',
      supplierInvoiceAmount: project.supplier?.proformaInvoice?.invoiceAmount || '',
      creditNote: project.supplier?.proformaInvoice?.creditNote || '',
      finalInvoiceAmount: project.supplier?.proformaInvoice?.finalInvoiceAmount || '',
      loanAmount: project.supplier?.advancePayment?.loanAmount || '',
      advancePaymentDate: project.supplier?.advancePayment?.paymentDate?.split('T')[0] || '',
      advanceReferenceNumber: project.supplier?.advancePayment?.referenceNumber || '',
      twlContribution: project.supplier?.advancePayment?.twlContribution || '',
      totalPayment: project.supplier?.advancePayment?.totalPayment || '',
      balanceAmount: project.supplier?.advancePayment?.balanceAmount || '',
      supplierBalanceAmount: project.supplier?.balancePayment?.amount || '',
      supplierBalanceDate: project.supplier?.balancePayment?.date?.split('T')[0] || '',
      supplierBalanceReference: project.supplier?.balancePayment?.reference || '',
      supplierBalanceTwlContribution: project.supplier?.balancePayment?.twlContribution || '',
      supplierBalanceTotalPayment: project.supplier?.balancePayment?.totalPayment || '',
      supplierTotalAmount: project.supplier?.summary?.totalAmount || '',
      supplierCancelAmount: project.supplier?.summary?.cancelAmount || '',
      supplierSummaryBalancePayment: project.supplier?.summary?.balancePayment || '',
      buyerProformaInvoiceNo: project.buyer?.proformaInvoice?.invoiceNo || '',
      buyerProformaInvoiceDate: project.buyer?.proformaInvoice?.invoiceDate?.split('T')[0] || '',
      buyerProformaAmount: project.buyer?.proformaInvoice?.amount || '',
      buyerAdvanceAmount: project.buyer?.advancePayment?.amount || '',
      buyerAdvanceDate: project.buyer?.advancePayment?.date?.split('T')[0] || '',
      buyerAdvanceReference: project.buyer?.advancePayment?.reference || '',
      buyerBalanceAmount: project.buyer?.balancePayment?.amount || '',
      buyerBalanceDate: project.buyer?.balancePayment?.date?.split('T')[0] || '',
      buyerBalanceReference: project.buyer?.balancePayment?.reference || '',
      buyerBalanceTwlContribution: project.buyer?.balancePayment?.twlContribution || '',   // NEW
      buyerBalanceTotalPayment: project.buyer?.balancePayment?.totalPayment || '',        // NEW
      buyerTotalAmount: project.buyer?.summary?.totalAmount || '',                        // NEW
      buyerCancelAmount: project.buyer?.summary?.cancelAmount || '',                      // NEW
      buyerSummaryBalancePayment: project.buyer?.summary?.balancePayment || '',           // NEW
      costingNotes: project.costing?.notes || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('✓ Project deleted successfully!');
        fetchProjects();
      } else {
        setError(data.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Server error. Please try again.');
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>🏢 TWL System - Admin Panel</h2>
        </div>
        <div className="nav-user">
          <span className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">Administrator</span>
          </span>
          <button onClick={onLogout} className="logout-button">
            <span>Logout</span>
            <span className="logout-icon">→</span>
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Welcome Back, {user.name}! 👋</h1>
          <p>Manage projects, suppliers, and buyers</p>
        </div>

        {/* Global Messages */}
        {error && (
          <div className="alert alert-error global-alert">
            <span className="alert-icon">⚠️</span>
            {error}
            <button onClick={() => setError('')} className="alert-close">✕</button>
          </div>
        )}

        {success && (
          <div className="alert alert-success global-alert">
            <span className="alert-icon">✓</span>
            {success}
            <button onClick={() => setSuccess('')} className="alert-close">✕</button>
          </div>
        )}

        {/* Project Form */}
        {showForm && (
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">
                {editingProject ? '✏️ Edit Project' : '➕ Add New Project'}
              </h2>
              <div className="header-actions">
                {editingProject && (
                  <button onClick={resetForm} className="cancel-edit-button">
                    ✕ Cancel Edit
                  </button>
                )}
                {!editingProject && projects.length > 0 && (
                  <button onClick={() => setShowForm(false)} className="hide-form-button">
                    Hide Form
                  </button>
                )}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="project-form">
              {/* PROJECT SECTION */}
              <div className="form-card">
                <h3 className="card-title">📋 Project Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Project Name *</label>
                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleChange}
                      required
                      placeholder="Enter project name"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Project No *</label>
                    <input
                      type="text"
                      name="projectNo"
                      value={formData.projectNo}
                      onChange={handleChange}
                      required
                      placeholder="e.g., PRJ-001"
                      disabled={loading || editingProject}
                      title={editingProject ? "Project No cannot be changed when editing" : ""}
                    />
                    {editingProject && (
                      <small className="field-hint">Project No cannot be changed</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Project Date *</label>
                    <input
                      type="date"
                      name="projectDate"
                      value={formData.projectDate}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* SUPPLIER SECTION */}
              <div className="form-card">
                <h3 className="card-title">🏭 SUPPLIER</h3>
                
                {/* Proforma Invoice Details */}
                <div className="subsection">
                  <h4 className="subsection-title">Proforma Invoice Details</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Supplier Name</label>
                      <input
                        type="text"
                        name="supplierName"
                        value={formData.supplierName}
                        onChange={handleChange}
                        placeholder="Enter supplier name"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Supplier Invoice Number</label>
                      <input
                        type="text"
                        name="supplierInvoiceNumber"
                        value={formData.supplierInvoiceNumber}
                        onChange={handleChange}
                        placeholder="Enter invoice number"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Supplier Invoice Amount ($)</label>
                      <input
                        type="number"
                        name="supplierInvoiceAmount"
                        value={formData.supplierInvoiceAmount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Credit Note ($)</label>
                      <input
                        type="number"
                        name="creditNote"
                        value={formData.creditNote}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Final Invoice Amount ($) <span className="auto-calc">Auto-calculated</span></label>
                      <input
                        type="number"
                        name="finalInvoiceAmount"
                        value={formData.finalInvoiceAmount}
                        readOnly
                        placeholder="0.00"
                        disabled
                        className="readonly-field"
                      />
                    </div>
                  </div>
                </div>

                {/* Advance Payment */}
                <div className="subsection">
                  <h4 className="subsection-title">Advance Payment Details</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Loan Amount ($)</label>
                      <input
                        type="number"
                        name="loanAmount"
                        value={formData.loanAmount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Payment Date</label>
                      <input
                        type="date"
                        name="advancePaymentDate"
                        value={formData.advancePaymentDate}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Reference Number</label>
                      <input
                        type="text"
                        name="advanceReferenceNumber"
                        value={formData.advanceReferenceNumber}
                        onChange={handleChange}
                        placeholder="Enter reference number"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>TWL Contribution ($)</label>
                      <input
                        type="number"
                        name="twlContribution"
                        value={formData.twlContribution}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Total Payment ($) <span className="auto-calc">Auto-calculated</span></label>
                      <input
                        type="number"
                        name="totalPayment"
                        value={formData.totalPayment}
                        readOnly
                        placeholder="0.00"
                        disabled
                        className="readonly-field"
                      />
                    </div>

                    <div className="form-group">
                      <label>Balance Amount ($) <span className="auto-calc">Auto-calculated</span></label>
                      <input
                        type="number"
                        name="balanceAmount"
                        value={formData.balanceAmount}
                        readOnly
                        placeholder="0.00"
                        disabled
                        className="readonly-field"
                      />
                    </div>
                  </div>
                </div>

                {/* Balance Payment */}
                <div className="subsection">
                  <h4 className="subsection-title">Balance Payment</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Amount ($)</label>
                      <input
                        type="number"
                        name="supplierBalanceAmount"
                        value={formData.supplierBalanceAmount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Payment Date</label>
                      <input
                        type="date"
                        name="supplierBalanceDate"
                        value={formData.supplierBalanceDate}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Reference</label>
                      <input
                        type="text"
                        name="supplierBalanceReference"
                        value={formData.supplierBalanceReference}
                        onChange={handleChange}
                        placeholder="Payment reference"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>TWL Contribution ($)</label>
                      <input
                        type="number"
                        name="supplierBalanceTwlContribution"
                        value={formData.supplierBalanceTwlContribution}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Total Payment ($)</label>
                      <input
                        type="number"
                        name="supplierBalanceTotalPayment"
                        value={formData.supplierBalanceTotalPayment}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Supplier Summary */}
                <div className="subsection">
                  <h4 className="subsection-title">Supplier Summary</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Total Amount ($) <span className="auto-calc">Auto-calculated</span></label>
                      <input
                        type="number"
                        name="supplierTotalAmount"
                        value={formData.supplierTotalAmount}
                        readOnly
                        placeholder="0.00"
                        disabled
                        className="readonly-field"
                      />
                    </div>

                    <div className="form-group">
                      <label>Cancel Amount ($) <span className="auto-calc">Auto-calculated</span></label>
                      <input
                        type="number"
                        name="supplierCancelAmount"
                        value={formData.supplierCancelAmount}
                        readOnly
                        placeholder="0.00"
                        disabled
                        className="readonly-field"
                      />
                    </div>

                    <div className="form-group">
                      <label>Balance Payment ($) <span className="auto-calc">Auto-calculated</span></label>
                      <input
                        type="number"
                        name="supplierSummaryBalancePayment"
                        value={formData.supplierSummaryBalancePayment}
                        readOnly
                        placeholder="0.00"
                        disabled
                        className="readonly-field"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* BUYER SECTION */}
              <div className="form-card">
                <h3 className="card-title">🛒 BUYER DETAILS</h3>
                
                {/* Proforma Invoice Details */}
                <div className="subsection">
                  <h4 className="subsection-title">Proforma Invoice Details</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Invoice No</label>
                      <input
                        type="text"
                        name="buyerProformaInvoiceNo"
                        value={formData.buyerProformaInvoiceNo}
                        onChange={handleChange}
                        placeholder="e.g., INV-B-001"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Invoice Date</label>
                      <input
                        type="date"
                        name="buyerProformaInvoiceDate"
                        value={formData.buyerProformaInvoiceDate}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Amount ($)</label>
                      <input
                        type="number"
                        name="buyerProformaAmount"
                        value={formData.buyerProformaAmount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Advance Payment */}
                <div className="subsection">
                  <h4 className="subsection-title">Advance Payment Details</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Amount ($)</label>
                      <input
                        type="number"
                        name="buyerAdvanceAmount"
                        value={formData.buyerAdvanceAmount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Payment Date</label>
                      <input
                        type="date"
                        name="buyerAdvanceDate"
                        value={formData.buyerAdvanceDate}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Reference</label>
                      <input
                        type="text"
                        name="buyerAdvanceReference"
                        value={formData.buyerAdvanceReference}
                        onChange={handleChange}
                        placeholder="Payment reference"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Balance Payment */}
                <div className="subsection">
                  <h4 className="subsection-title">Balance Payment</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Amount ($)</label>
                      <input
                        type="number"
                        name="buyerBalanceAmount"
                        value={formData.buyerBalanceAmount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Payment Date</label>
                      <input
                        type="date"
                        name="buyerBalanceDate"
                        value={formData.buyerBalanceDate}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Reference</label>
                      <input
                        type="text"
                        name="buyerBalanceReference"
                        value={formData.buyerBalanceReference}
                        onChange={handleChange}
                        placeholder="Payment reference"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>TWL Contribution ($)</label>
                      <input
                        type="number"
                        name="buyerBalanceTwlContribution"
                        value={formData.buyerBalanceTwlContribution}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Total Payment ($) <span className="auto-calc">Auto-calculated</span></label>
                      <input
                        type="number"
                        name="buyerBalanceTotalPayment"
                        value={formData.buyerBalanceTotalPayment}
                        readOnly
                        placeholder="0.00"
                        disabled
                        className="readonly-field"
                      />
                    </div>
                  </div>
                </div>

                {/* NEW: Buyer Summary Section */}
                <div className="subsection">
                  <h4 className="subsection-title">Buyer Summary</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Total Amount ($)</label>
                      <input
                        type="number"
                        name="buyerTotalAmount"
                        value={formData.buyerTotalAmount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Cancel Amount ($)</label>
                      <input
                        type="number"
                        name="buyerCancelAmount"
                        value={formData.buyerCancelAmount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Balance Payment ($)</label>
                      <input
                        type="number"
                        name="buyerSummaryBalancePayment"
                        value={formData.buyerSummaryBalancePayment}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* COSTING SECTION */}
              <div className="form-card">
                <h3 className="card-title">💰 COSTING</h3>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Supplier Invoice Amount ($)</label>
                    <input
                      type="number"
                      name="costingSupplierInvoiceAmount"
                      value={formData.costingSupplierInvoiceAmount}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>TWL Invoice Amount ($)</label>
                    <input
                      type="number"
                      name="costingTwlInvoiceAmount"
                      value={formData.costingTwlInvoiceAmount}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Profit ($)</label>
                    <input
                      type="number"
                      name="costingProfit"
                      value={formData.costingProfit}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>In Going ($)</label>
                    <input
                      type="number"
                      name="costingInGoing"
                      value={formData.costingInGoing}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Out Going ($)</label>
                    <input
                      type="number"
                      name="costingOutGoing"
                      value={formData.costingOutGoing}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>CAL Charges ($)</label>
                    <input
                      type="number"
                      name="costingCalCharges"
                      value={formData.costingCalCharges}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Other ($)</label>
                    <input
                      type="number"
                      name="costingOther"
                      value={formData.costingOther}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Foreign Bank Charges ($)</label>
                    <input
                      type="number"
                      name="costingForeignBankCharges"
                      value={formData.costingForeignBankCharges}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Loan Interest ($)</label>
                    <input
                      type="number"
                      name="costingLoanInterest"
                      value={formData.costingLoanInterest}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Freight Charges ($)</label>
                    <input
                      type="number"
                      name="costingFreightCharges"
                      value={formData.costingFreightCharges}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Total ($) <span className="auto-calc">Auto-calculated</span></label>
                    <input
                      type="number"
                      name="costingTotal"
                      value={formData.costingTotal}
                      readOnly
                      placeholder="0.00"
                      disabled
                      className="readonly-field"
                    />
                  </div>

                  <div className="form-group">
                    <label>Net Profit ($) <span className="auto-calc">Auto-calculated</span></label>
                    <input
                      type="number"
                      name="costingNetProfit"
                      value={formData.costingNetProfit}
                      readOnly
                      placeholder="0.00"
                      disabled
                      className="readonly-field"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    name="costingNotes"
                    value={formData.costingNotes}
                    onChange={handleChange}
                    placeholder="Add any costing notes or remarks..."
                    rows="4"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                {editingProject && (
                  <button 
                    type="button" 
                    onClick={resetForm} 
                    className="secondary-button"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      {editingProject ? 'Updating Project...' : 'Creating Project...'}
                    </>
                  ) : (
                    <>
                      <span>{editingProject ? '💾' : '➕'}</span>
                      {editingProject ? 'Update Project' : 'Create Project'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Project Button (when form is hidden) */}
        {!showForm && (
          <div className="add-project-section">
            <button onClick={() => setShowForm(true)} className="show-form-button">
              ➕ Add New Project
            </button>
          </div>
        )}

        {/* Projects List */}
        <div className="projects-section">
          <h2 className="section-title">📊 All Projects ({projects.length})</h2>
          
          {projects.length === 0 ? (
            <div className="no-projects">
              <p>📭 No projects found. Create your first project above.</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project._id} className="project-card">
                  <div className="project-card-header">
                    <div>
                      <h3>{project.projectName}</h3>
                      <span className="project-no">{project.projectNo}</span>
                    </div>
                    <div className="card-actions">
                      <button 
                        onClick={() => handleEdit(project)}
                        className="edit-button"
                        title="Edit Project"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(project._id)}
                        className="delete-button"
                        title="Delete Project"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="project-date">
                    📅 {new Date(project.projectDate).toLocaleDateString()}
                  </div>

                  <div className="project-details">
                    {/* Supplier Summary */}
                    <div className="detail-section">
                      <h4>🏭 Supplier: {project.supplier?.proformaInvoice?.supplierName || 'N/A'}</h4>
                      <div className="detail-row">
                        <span>Final Invoice:</span>
                        <span className="value">${project.supplier?.proformaInvoice?.finalInvoiceAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="detail-row">
                        <span>Loan Amount:</span>
                        <span className="value">${project.supplier?.advancePayment?.loanAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="detail-row">
                        <span>TWL Contribution:</span>
                        <span className="value">${project.supplier?.advancePayment?.twlContribution?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="detail-row">
                        <span>Balance Payment:</span>
                        <span className="value">${project.supplier?.balancePayment?.amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="detail-row total">
                        <span>Total Paid:</span>
                        <span className="value">${project.supplier?.paymentTotal?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>

                    {/* Buyer Summary */}
                    <div className="detail-section">
                      <h4>🛒 Buyer</h4>
                      <div className="detail-row">
                        <span>Proforma:</span>
                        <span className="value">${project.buyer?.proformaInvoice?.amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="detail-row">
                        <span>Advance:</span>
                        <span className="value">${project.buyer?.advancePayment?.amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="detail-row">
                        <span>Balance:</span>
                        <span className="value">${project.buyer?.balancePayment?.amount?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="detail-row total">
                        <span>Total:</span>
                        <span className="value">${project.buyer?.paymentTotal?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>

                    {/* Profit */}
                    <div className="detail-section profit-section">
                      <h4>💰 Profit</h4>
                      <div className="profit-amount">
                        ${project.costing?.profit?.toFixed(2) || '0.00'}
                      </div>
                      <div className="profit-percentage">
                        {project.costing?.profitPercentage || '0'}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;