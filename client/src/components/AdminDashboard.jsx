import { useState, useEffect } from 'react';
import './AdminDashboard.css';
import API_BASE_URL from '../config/api';

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
    
    // Buyer - Proforma Invoice (NEW STRUCTURE)
    buyerName: '',
    buyerProformaInvoiceNo: '',
    buyerProformaInvoiceDate: '',
    buyerCreditNote: '',
    buyerBankInterest: '',
    buyerFreightCharges: '',
    buyerTwlInvoiceAmount: '',
    buyerFinalInvoiceAmount: '',
    buyerCommission: '',
    
    // Buyer - Advance Payment (NEW STRUCTURE)
    buyerAdvanceTwlReceived: '',
    buyerAdvanceBalanceAmount: '',
    buyerAdvanceDate: '',
    buyerAdvanceReference: '',
    
    // Buyer - Balance Payment (NEW STRUCTURE)
    buyerBalanceTwlReceived: '',
    buyerBalanceDate: '',
    buyerBalanceReference: '',
    
    // Buyer - Summary (NEW STRUCTURE)
    buyerTotalReceived: '',
    buyerCancel: '',
    buyerBalanceReceived: '',
    
    // Costing
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
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [showForm, setShowForm] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    searchTerm: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'dateDesc', // dateDesc, dateAsc, profitDesc, profitAsc, nameAsc, nameDesc
  });
  
  const [expandedProject, setExpandedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Apply filters whenever projects or filters change
  useEffect(() => {
    applyFilters();
  }, [projects, filters]);

  const applyFilters = () => {
    let filtered = [...projects];

    // Search filter (project name, project number, supplier name, buyer name)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.projectName?.toLowerCase().includes(searchLower) ||
        project.projectNo?.toLowerCase().includes(searchLower) ||
        project.supplier?.proformaInvoice?.supplierName?.toLowerCase().includes(searchLower) ||
        project.buyer?.proformaInvoice?.buyerName?.toLowerCase().includes(searchLower)
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(project => 
        new Date(project.projectDate) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(project => 
        new Date(project.projectDate) <= new Date(filters.dateTo)
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'dateDesc':
        filtered.sort((a, b) => new Date(b.projectDate) - new Date(a.projectDate));
        break;
      case 'dateAsc':
        filtered.sort((a, b) => new Date(a.projectDate) - new Date(b.projectDate));
        break;
      case 'profitDesc':
        filtered.sort((a, b) => (b.costing?.netProfit || 0) - (a.costing?.netProfit || 0));
        break;
      case 'profitAsc':
        filtered.sort((a, b) => (a.costing?.netProfit || 0) - (b.costing?.netProfit || 0));
        break;
      case 'nameAsc':
        filtered.sort((a, b) => a.projectName.localeCompare(b.projectName));
        break;
      case 'nameDesc':
        filtered.sort((a, b) => b.projectName.localeCompare(a.projectName));
        break;
      default:
        break;
    }

    setFilteredProjects(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'dateDesc',
    });
  };

  const toggleProjectExpansion = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

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
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
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
            buyerName: formData.buyerName,
            invoiceNo: formData.buyerProformaInvoiceNo,
            invoiceDate: formData.buyerProformaInvoiceDate,
            creditNote: parseFloat(formData.buyerCreditNote) || 0,
            bankInterest: parseFloat(formData.buyerBankInterest) || 0,
            freightCharges: parseFloat(formData.buyerFreightCharges) || 0,
            twlInvoiceAmount: parseFloat(formData.buyerTwlInvoiceAmount) || 0,
            finalInvoiceAmount: parseFloat(formData.buyerFinalInvoiceAmount) || 0,
            commission: parseFloat(formData.buyerCommission) || 0
          },
          advancePayment: {
            twlReceived: parseFloat(formData.buyerAdvanceTwlReceived) || 0,
            balanceAmount: parseFloat(formData.buyerAdvanceBalanceAmount) || 0,
            date: formData.buyerAdvanceDate,
            reference: formData.buyerAdvanceReference
          },
          balancePayment: {
            twlReceived: parseFloat(formData.buyerBalanceTwlReceived) || 0,
            date: formData.buyerBalanceDate,
            reference: formData.buyerBalanceReference
          },
          summary: {
            totalReceived: parseFloat(formData.buyerTotalReceived) || 0,
            cancel: parseFloat(formData.buyerCancel) || 0,
            balanceReceived: parseFloat(formData.buyerBalanceReceived) || 0
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
          netProfit: parseFloat(formData.costingNetProfit) || 0
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
        setShowForm(false);
        setTimeout(() => setShowForm(true), 100);
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
      buyerName: '',
      buyerProformaInvoiceNo: '',
      buyerProformaInvoiceDate: '',
      buyerCreditNote: '',
      buyerBankInterest: '',
      buyerFreightCharges: '',
      buyerTwlInvoiceAmount: '',
      buyerFinalInvoiceAmount: '',
      buyerCommission: '',
      buyerAdvanceTwlReceived: '',
      buyerAdvanceBalanceAmount: '',
      buyerAdvanceDate: '',
      buyerAdvanceReference: '',
      buyerBalanceTwlReceived: '',
      buyerBalanceDate: '',
      buyerBalanceReference: '',
      buyerTotalReceived: '',
      buyerCancel: '',
      buyerBalanceReceived: '',
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
      buyerName: project.buyer?.proformaInvoice?.buyerName || '',
      buyerProformaInvoiceNo: project.buyer?.proformaInvoice?.invoiceNo || '',
      buyerProformaInvoiceDate: project.buyer?.proformaInvoice?.invoiceDate?.split('T')[0] || '',
      buyerCreditNote: project.buyer?.proformaInvoice?.creditNote || '',
      buyerBankInterest: project.buyer?.proformaInvoice?.bankInterest || '',
      buyerFreightCharges: project.buyer?.proformaInvoice?.freightCharges || '',
      buyerTwlInvoiceAmount: project.buyer?.proformaInvoice?.twlInvoiceAmount || '',
      buyerFinalInvoiceAmount: project.buyer?.proformaInvoice?.finalInvoiceAmount || '',
      buyerCommission: project.buyer?.proformaInvoice?.commission || '',
      buyerAdvanceTwlReceived: project.buyer?.advancePayment?.twlReceived || '',
      buyerAdvanceBalanceAmount: project.buyer?.advancePayment?.balanceAmount || '',
      buyerAdvanceDate: project.buyer?.advancePayment?.date?.split('T')[0] || '',
      buyerAdvanceReference: project.buyer?.advancePayment?.reference || '',
      buyerBalanceTwlReceived: project.buyer?.balancePayment?.twlReceived || '',
      buyerBalanceDate: project.buyer?.balancePayment?.date?.split('T')[0] || '',
      buyerBalanceReference: project.buyer?.balancePayment?.reference || '',
      buyerTotalReceived: project.buyer?.summary?.totalReceived || '',
      buyerCancel: project.buyer?.summary?.cancel || '',
      buyerBalanceReceived: project.buyer?.summary?.balanceReceived || '',
      costingSupplierInvoiceAmount: project.costing?.supplierInvoiceAmount || '',
      costingTwlInvoiceAmount: project.costing?.twlInvoiceAmount || '',
      costingProfit: project.costing?.profit || '',
      costingInGoing: project.costing?.inGoing || '',
      costingOutGoing: project.costing?.outGoing || '',
      costingCalCharges: project.costing?.calCharges || '',
      costingOther: project.costing?.other || '',
      costingForeignBankCharges: project.costing?.foreignBankCharges || '',
      costingLoanInterest: project.costing?.loanInterest || '',
      costingFreightCharges: project.costing?.freightCharges || '',
      costingTotal: project.costing?.total || '',
      costingNetProfit: project.costing?.netProfit || '',
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

  // Auto-calculate buyer final invoice amount
  useEffect(() => {
    const twlInvoice = parseFloat(formData.buyerTwlInvoiceAmount) || 0;
    const creditNote = parseFloat(formData.buyerCreditNote) || 0;
    const bankInterest = parseFloat(formData.buyerBankInterest) || 0;
    const freight = parseFloat(formData.buyerFreightCharges) || 0;
    const commission = parseFloat(formData.buyerCommission) || 0;
    
    const finalAmount = twlInvoice - creditNote + bankInterest + commission + freight;
    
    setFormData(prev => ({
      ...prev,
      buyerFinalInvoiceAmount: finalAmount.toFixed(2)
    }));
  }, [
    formData.buyerTwlInvoiceAmount,
    formData.buyerCreditNote,
    formData.buyerBankInterest,
    formData.buyerFreightCharges,
    formData.buyerCommission
  ]);

  // Auto-calculate buyer advance balance amount
  useEffect(() => {
    const finalInvoice = parseFloat(formData.buyerFinalInvoiceAmount) || 0;
    const twlReceived = parseFloat(formData.buyerAdvanceTwlReceived) || 0;
    
    const balanceAmount = finalInvoice - twlReceived;
    
    setFormData(prev => ({
      ...prev,
      buyerAdvanceBalanceAmount: balanceAmount.toFixed(2)
    }));
  }, [formData.buyerFinalInvoiceAmount, formData.buyerAdvanceTwlReceived]);

  // Auto-calculate buyer summary
  useEffect(() => {
    const advanceTwl = parseFloat(formData.buyerAdvanceTwlReceived) || 0;
    const balanceTwl = parseFloat(formData.buyerBalanceTwlReceived) || 0;
    const finalInvoice = parseFloat(formData.buyerFinalInvoiceAmount) || 0;
    
    const totalReceived = advanceTwl + balanceTwl;
    const cancel = 0;
    const balanceReceived = finalInvoice - totalReceived;
    
    setFormData(prev => ({
      ...prev,
      buyerTotalReceived: totalReceived.toFixed(2),
      buyerCancel: cancel.toFixed(2),
      buyerBalanceReceived: balanceReceived.toFixed(2)
    }));
  }, [
    formData.buyerAdvanceTwlReceived,
    formData.buyerBalanceTwlReceived,
    formData.buyerFinalInvoiceAmount
  ]);

  // Auto-calculate costing profit, total and net profit
  useEffect(() => {
    const supplierInvoice = parseFloat(formData.costingSupplierInvoiceAmount) || 0;
    const twlInvoice = parseFloat(formData.costingTwlInvoiceAmount) || 0;
    const inGoing = parseFloat(formData.costingInGoing) || 0;
    const outGoing = parseFloat(formData.costingOutGoing) || 0;
    const calCharges = parseFloat(formData.costingCalCharges) || 0;
    const other = parseFloat(formData.costingOther) || 0;
    const foreignBank = parseFloat(formData.costingForeignBankCharges) || 0;
    const loanInterest = parseFloat(formData.costingLoanInterest) || 0;
    const freight = parseFloat(formData.costingFreightCharges) || 0;

    const profit = supplierInvoice - twlInvoice;
    const total = inGoing + outGoing + calCharges + other + foreignBank + loanInterest + freight;
    const netProfit = profit - total;

    setFormData(prev => ({
      ...prev,
      costingProfit: profit.toFixed(2),
      costingTotal: total.toFixed(2),
      costingNetProfit: netProfit.toFixed(2)
    }));
  }, [
    formData.costingSupplierInvoiceAmount,
    formData.costingTwlInvoiceAmount,
    formData.costingInGoing,
    formData.costingOutGoing,
    formData.costingCalCharges,
    formData.costingOther,
    formData.costingForeignBankCharges,
    formData.costingLoanInterest,
    formData.costingFreightCharges
  ]);

  const handleExportToExcel = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      setSuccess(''); // Clear previous success
      
      console.log('Starting Excel export...');
      console.log('Total projects:', projects.length);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Fetching Excel file from server...');
      const response = await fetch(`${API_BASE_URL}/api/projects/export/excel`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response content-type:', response.headers.get('content-type'));

      if (!response.ok) {
        // Try to parse JSON error message
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to export');
        }
        throw new Error(`Server error: ${response.status}`);
      }

      // Check if response is JSON (error) or Excel file
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'No projects to export');
        }
      }

      console.log('Creating blob from response...');
      const blob = await response.blob();
      console.log('Blob size:', blob.size, 'bytes');
      
      if (blob.size === 0) {
        throw new Error('Received empty file from server');
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TWL_Projects_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      console.log('Triggering download...');
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('Excel export completed successfully');
      setSuccess('✓ Excel report downloaded successfully!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      console.error('Error details:', error.message);
      setError(`Failed to export: ${error.message}`);
    } finally {
      setLoading(false);
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
                      <label>Buyer Name</label>
                      <input
                        type="text"
                        name="buyerName"
                        value={formData.buyerName}
                        onChange={handleChange}
                        placeholder="Enter buyer name"
                        disabled={loading}
                      />
                    </div>

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
                      <label>Credit Note ($)</label>
                      <input
                        type="number"
                        name="buyerCreditNote"
                        value={formData.buyerCreditNote}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Bank Interest ($)</label>
                      <input
                        type="number"
                        name="buyerBankInterest"
                        value={formData.buyerBankInterest}
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
                        name="buyerFreightCharges"
                        value={formData.buyerFreightCharges}
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
                        name="buyerTwlInvoiceAmount"
                        value={formData.buyerTwlInvoiceAmount}
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
                        name="buyerFinalInvoiceAmount"
                        value={formData.buyerFinalInvoiceAmount}
                        readOnly
                        placeholder="0.00"
                        disabled
                        className="readonly-field"
                      />
                    </div>

                    <div className="form-group">
                      <label>Commission ($)</label>
                      <input
                        type="number"
                        name="buyerCommission"
                        value={formData.buyerCommission}
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
                      <label>TWL Received ($)</label>
                      <input
                        type="number"
                        name="buyerAdvanceTwlReceived"
                        value={formData.buyerAdvanceTwlReceived}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Balance Amount ($) <span className="auto-calc">Auto-calculated</span></label>
                      <input
                        type="number"
                        name="buyerAdvanceBalanceAmount"
                        value={formData.buyerAdvanceBalanceAmount}
                        readOnly
                        placeholder="0.00"
                        disabled
                        className="readonly-field"
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
                      <label>TWL Received ($)</label>
                      <input
                        type="number"
                        name="buyerBalanceTwlReceived"
                        value={formData.buyerBalanceTwlReceived}
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
                  </div>
                </div>

                {/* Buyer Summary Section */}
                <div className="subsection">
                  <h4 className="subsection-title">Buyer Summary</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Total Received ($) <span className="auto-calc">Auto-calculated</span></label>
                      <input
                        type="number"
                        name="buyerTotalReceived"
                        value={formData.buyerTotalReceived}
                        readOnly
                        placeholder="0.00"
                        disabled
                        className="readonly-field"
                      />
                    </div>

                    <div className="form-group">
                      <label>Cancel ($) <span className="auto-calc">Auto-calculated</span></label>
                      <input
                        type="number"
                        name="buyerCancel"
                        value={formData.buyerCancel}
                        readOnly
                        placeholder="0.00"
                        disabled
                        className="readonly-field"
                      />
                    </div>

                    <div className="form-group">
                      <label>Balance Received ($) <span className="auto-calc">Auto-calculated</span></label>
                      <input
                        type="number"
                        name="buyerBalanceReceived"
                        value={formData.buyerBalanceReceived}
                        readOnly
                        placeholder="0.00"
                        disabled
                        className="readonly-field"
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
                    <label>Profit ($) <span className="auto-calc">Auto-calculated</span></label>
                    <input
                      type="number"
                      name="costingProfit"
                      value={formData.costingProfit}
                      readOnly
                      placeholder="0.00"
                      disabled
                      className="readonly-field"
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

        {/* Projects List with Filters */}
        <div className="projects-section">
          <div className="section-header">
            <h2 className="section-title">📊 All Projects ({filteredProjects.length})</h2>
            <button 
              onClick={handleExportToExcel} 
              className="export-excel-button"
              disabled={loading || projects.length === 0}
              title="Export all projects to Excel"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Exporting...
                </>
              ) : (
                <>
                  📥 Export to Excel
                </>
              )}
            </button>
          </div>

          {/* Filters Section */}
          <div className="filters-section">
            <div className="filters-grid">
              <div className="filter-group">
                <label>🔍 Search</label>
                <input
                  type="text"
                  name="searchTerm"
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                  placeholder="Search by project name, number, supplier, buyer..."
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>📅 Date From</label>
                <input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>📅 Date To</label>
                <input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>📊 Sort By</label>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="dateDesc">Date (Newest First)</option>
                  <option value="dateAsc">Date (Oldest First)</option>
                  <option value="profitDesc">Net Profit (High to Low)</option>
                  <option value="profitAsc">Net Profit (Low to High)</option>
                  <option value="nameAsc">Name (A to Z)</option>
                  <option value="nameDesc">Name (Z to A)</option>
                </select>
              </div>

              <div className="filter-group filter-actions">
                <button onClick={resetFilters} className="reset-filters-button">
                  ↺ Reset Filters
                </button>
              </div>
            </div>
          </div>
          
          {filteredProjects.length === 0 ? (
            <div className="no-projects">
              <p>📭 {projects.length === 0 ? 'No projects found. Create your first project above.' : 'No projects match your filters.'}</p>
            </div>
          ) : (
            <div className="projects-grid">
              {filteredProjects.map((project) => (
                <div key={project._id} className={`project-card ${expandedProject === project._id ? 'expanded' : ''}`}>
                  <div className="project-card-header">
                    <div>
                      <h3>{project.projectName}</h3>
                      <span className="project-no">{project.projectNo}</span>
                    </div>
                    <div className="card-actions">
                      <button 
                        onClick={() => toggleProjectExpansion(project._id)}
                        className="expand-button"
                        title={expandedProject === project._id ? "Show Less" : "Show Details"}
                      >
                        {expandedProject === project._id ? '▲ Less' : '▼ Details'}
                      </button>
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

                  {/* Quick Summary */}
                  <div className="project-quick-summary">
                    <div className="summary-item">
                      <span className="summary-label">Supplier:</span>
                      <span className="summary-value">{project.supplier?.proformaInvoice?.supplierName || 'N/A'}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Buyer:</span>
                      <span className="summary-value">{project.buyer?.proformaInvoice?.buyerName || 'N/A'}</span>
                    </div>
                    <div className="summary-item highlight">
                      <span className="summary-label">Net Profit:</span>
                      <span className={`summary-value ${(project.costing?.netProfit || 0) >= 0 ? 'profit-positive' : 'profit-negative'}`}>
                        ${(project.costing?.netProfit || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedProject === project._id && (
                    <div className="project-details-expanded">
                      
                      {/* Supplier Details */}
                      <div className="detail-section">
                        <h4 className="detail-section-title">🏭 Supplier Details</h4>
                        
                        <div className="detail-subsection">
                          <h5>Proforma Invoice</h5>
                          <div className="detail-row">
                            <span>Invoice Number:</span>
                            <span className="value">{project.supplier?.proformaInvoice?.invoiceNumber || 'N/A'}</span>
                          </div>
                          <div className="detail-row">
                            <span>Invoice Amount:</span>
                            <span className="value">${project.supplier?.proformaInvoice?.invoiceAmount?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>Credit Note:</span>
                            <span className="value">${project.supplier?.proformaInvoice?.creditNote?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row highlight">
                            <span>Final Invoice Amount:</span>
                            <span className="value">${project.supplier?.proformaInvoice?.finalInvoiceAmount?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>

                        <div className="detail-subsection">
                          <h5>Advance Payment</h5>
                          <div className="detail-row">
                            <span>Loan Amount:</span>
                            <span className="value">${project.supplier?.advancePayment?.loanAmount?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>TWL Contribution:</span>
                            <span className="value">${project.supplier?.advancePayment?.twlContribution?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>Total Payment:</span>
                            <span className="value">${project.supplier?.advancePayment?.totalPayment?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>Balance Amount:</span>
                            <span className="value">${project.supplier?.advancePayment?.balanceAmount?.toFixed(2) || '0.00'}</span>
                          </div>
                          {project.supplier?.advancePayment?.paymentDate && (
                            <div className="detail-row">
                              <span>Payment Date:</span>
                              <span className="value">{new Date(project.supplier.advancePayment.paymentDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {project.supplier?.advancePayment?.referenceNumber && (
                            <div className="detail-row">
                              <span>Reference:</span>
                              <span className="value">{project.supplier.advancePayment.referenceNumber}</span>
                            </div>
                          )}
                        </div>

                        <div className="detail-subsection">
                          <h5>Balance Payment</h5>
                          <div className="detail-row">
                            <span>Amount:</span>
                            <span className="value">${project.supplier?.balancePayment?.amount?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>TWL Contribution:</span>
                            <span className="value">${project.supplier?.balancePayment?.twlContribution?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>Total Payment:</span>
                            <span className="value">${project.supplier?.balancePayment?.totalPayment?.toFixed(2) || '0.00'}</span>
                          </div>
                          {project.supplier?.balancePayment?.date && (
                            <div className="detail-row">
                              <span>Payment Date:</span>
                              <span className="value">{new Date(project.supplier.balancePayment.date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="detail-subsection summary-subsection">
                          <h5>Summary</h5>
                          <div className="detail-row">
                            <span>Total Amount:</span>
                            <span className="value">${project.supplier?.summary?.totalAmount?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>Cancel Amount:</span>
                            <span className="value">${project.supplier?.summary?.cancelAmount?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row highlight">
                            <span>Balance Payment:</span>
                            <span className="value">${project.supplier?.summary?.balancePayment?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Buyer Details */}
                      <div className="detail-section">
                        <h4 className="detail-section-title">🛒 Buyer Details</h4>
                        
                        <div className="detail-subsection">
                          <h5>Proforma Invoice</h5>
                          <div className="detail-row">
                            <span>Invoice No:</span>
                            <span className="value">{project.buyer?.proformaInvoice?.invoiceNo || 'N/A'}</span>
                          </div>
                          {project.buyer?.proformaInvoice?.invoiceDate && (
                            <div className="detail-row">
                              <span>Invoice Date:</span>
                              <span className="value">{new Date(project.buyer.proformaInvoice.invoiceDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="detail-row">
                            <span>TWL Invoice Amount:</span>
                            <span className="value">${project.buyer?.proformaInvoice?.twlInvoiceAmount?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>Credit Note:</span>
                            <span className="value">${project.buyer?.proformaInvoice?.creditNote?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>Bank Interest:</span>
                            <span className="value">${project.buyer?.proformaInvoice?.bankInterest?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>Freight Charges:</span>
                            <span className="value">${project.buyer?.proformaInvoice?.freightCharges?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>Commission:</span>
                            <span className="value">${project.buyer?.proformaInvoice?.commission?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row highlight">
                            <span>Final Invoice Amount:</span>
                            <span className="value">${project.buyer?.proformaInvoice?.finalInvoiceAmount?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>

                        <div className="detail-subsection">
                          <h5>Advance Payment</h5>
                          <div className="detail-row">
                            <span>TWL Received:</span>
                            <span className="value">${project.buyer?.advancePayment?.twlReceived?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>Balance Amount:</span>
                            <span className="value">${project.buyer?.advancePayment?.balanceAmount?.toFixed(2) || '0.00'}</span>
                          </div>
                          {project.buyer?.advancePayment?.date && (
                            <div className="detail-row">
                              <span>Payment Date:</span>
                              <span className="value">{new Date(project.buyer.advancePayment.date).toLocaleDateString()}</span>
                            </div>
                          )}
                          {project.buyer?.advancePayment?.reference && (
                            <div className="detail-row">
                              <span>Reference:</span>
                              <span className="value">{project.buyer.advancePayment.reference}</span>
                            </div>
                          )}
                        </div>

                        <div className="detail-subsection">
                          <h5>Balance Payment</h5>
                          <div className="detail-row">
                            <span>TWL Received:</span>
                            <span className="value">${project.buyer?.balancePayment?.twlReceived?.toFixed(2) || '0.00'}</span>
                          </div>
                          {project.buyer?.balancePayment?.date && (
                            <div className="detail-row">
                              <span>Payment Date:</span>
                              <span className="value">{new Date(project.buyer.balancePayment.date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="detail-subsection summary-subsection">
                          <h5>Summary</h5>
                          <div className="detail-row">
                            <span>Total Received:</span>
                            <span className="value">${project.buyer?.summary?.totalReceived?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>Cancel:</span>
                            <span className="value">${project.buyer?.summary?.cancel?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row highlight">
                            <span>Balance Received:</span>
                            <span className="value">${project.buyer?.summary?.balanceReceived?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Costing Details */}
                      <div className="detail-section">
                        <h4 className="detail-section-title">💰 Costing Details</h4>
                        
                        <div className="detail-subsection">
                          <h5>Revenue</h5>
                          <div className="detail-row">
                            <span>Supplier Invoice Amount:</span>
                            <span className="value">${project.costing?.supplierInvoiceAmount?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>TWL Invoice Amount:</span>
                            <span className="value">${project.costing?.twlInvoiceAmount?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row highlight">
                            <span>Profit:</span>
                            <span className="value">${project.costing?.profit?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>

                        <div className="detail-subsection">
                          <h5>Expenses</h5>
                          <div className="detail-row">
                            <span>In Going:</span>
                            <span className="value">${project.costing?.inGoing?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>Out Going:</span>
                            <span className="value">${project.costing?.outGoing?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>CAL Charges:</span>
                            <span className="value">${project.costing?.calCharges?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>Other:</span>
                            <span className="value">${project.costing?.other?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>Foreign Bank Charges:</span>
                            <span className="value">${project.costing?.foreignBankCharges?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>Loan Interest:</span>
                            <span className="value">${project.costing?.loanInterest?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row">
                            <span>Freight Charges:</span>
                            <span className="value">${project.costing?.freightCharges?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="detail-row highlight">
                            <span>Total Expenses:</span>
                            <span className="value">${project.costing?.total?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>

                        <div className="detail-subsection summary-subsection net-profit-section">
                          <h5>Final Result</h5>
                          <div className="detail-row net-profit-row">
                            <span>Net Profit:</span>
                            <span className={`value net-profit-value ${(project.costing?.netProfit || 0) >= 0 ? 'profit-positive' : 'profit-negative'}`}>
                              ${project.costing?.netProfit?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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

