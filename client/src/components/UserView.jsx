import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import './UserView.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const UserView = ({ user, onLogout }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'details'

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
        if (data.projects.length > 0) {
          setSelectedProject(data.projects[0]);
        }
      } else {
        setError('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate overview statistics
  const getOverviewStats = () => {
    const totalProjects = projects.length;
    const totalIncome = projects.reduce((sum, p) => sum + (p.buyer?.summary?.totalReceived || 0), 0);
    const totalOutcome = projects.reduce((sum, p) => sum + (p.supplier?.summary?.totalAmount || 0), 0);
    const totalLoans = projects.reduce((sum, p) => sum + (p.supplier?.advancePayment?.loanAmount || 0), 0);
    const totalNetProfit = projects.reduce((sum, p) => sum + (p.costing?.netProfit || 0), 0);
    const totalTWLReceived = projects.reduce((sum, p) => sum + (p.buyer?.advancePayment?.twlReceived || 0) + (p.buyer?.balancePayment?.twlReceived || 0), 0);

    return {
      totalProjects,
      totalIncome,
      totalOutcome,
      totalLoans,
      totalNetProfit,
      totalTWLReceived
    };
  };

  // Get data for individual project
  const getProjectData = (project) => {
    if (!project) return null;

    return {
      income: project.buyer?.summary?.totalReceived || 0,
      outcome: project.supplier?.summary?.totalAmount || 0,
      loans: project.supplier?.advancePayment?.loanAmount || 0,
      twlReceived: (project.buyer?.advancePayment?.twlReceived || 0) + (project.buyer?.balancePayment?.twlReceived || 0),
      netProfit: project.costing?.netProfit || 0,
      expenses: {
        inGoing: project.costing?.inGoing || 0,
        outGoing: project.costing?.outGoing || 0,
        calCharges: project.costing?.calCharges || 0,
        other: project.costing?.other || 0,
        foreignBankCharges: project.costing?.foreignBankCharges || 0,
        loanInterest: project.costing?.loanInterest || 0,
        freightCharges: project.costing?.freightCharges || 0,
      }
    };
  };

  // Overview Chart - All Projects Net Profit
  const getOverviewChartData = () => {
    return {
      labels: projects.map(p => p.projectNo),
      datasets: [
        {
          label: 'Net Profit',
          data: projects.map(p => p.costing?.netProfit || 0),
          backgroundColor: projects.map(p => (p.costing?.netProfit || 0) >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
          borderColor: projects.map(p => (p.costing?.netProfit || 0) >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'),
          borderWidth: 2,
        },
      ],
    };
  };

  // Project Financial Overview Chart
  const getProjectFinancialChart = (projectData) => {
    if (!projectData) return null;

    return {
      labels: ['Income', 'Outcome', 'Loans', 'TWL Received', 'Net Profit'],
      datasets: [
        {
          label: 'Amount ($)',
          data: [
            projectData.income,
            projectData.outcome,
            projectData.loans,
            projectData.twlReceived,
            projectData.netProfit
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(239, 68, 68, 0.7)',
            'rgba(251, 191, 36, 0.7)',
            'rgba(34, 197, 94, 0.7)',
            projectData.netProfit >= 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(220, 38, 38, 0.7)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(239, 68, 68)',
            'rgb(251, 191, 36)',
            'rgb(34, 197, 94)',
            projectData.netProfit >= 0 ? 'rgb(16, 185, 129)' : 'rgb(220, 38, 38)'
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  // Expenses Breakdown Pie Chart
  const getExpensesChart = (projectData) => {
    if (!projectData) return null;

    const expenseValues = Object.values(projectData.expenses);
    const totalExpenses = expenseValues.reduce((sum, val) => sum + val, 0);
    
    if (totalExpenses === 0) return null;

    return {
      labels: ['In Going', 'Out Going', 'CAL Charges', 'Other', 'Foreign Bank', 'Loan Interest', 'Freight'],
      datasets: [
        {
          label: 'Expenses ($)',
          data: expenseValues,
          backgroundColor: [
            'rgba(239, 68, 68, 0.7)',
            'rgba(249, 115, 22, 0.7)',
            'rgba(251, 191, 36, 0.7)',
            'rgba(168, 85, 247, 0.7)',
            'rgba(236, 72, 153, 0.7)',
            'rgba(14, 165, 233, 0.7)',
            'rgba(99, 102, 241, 0.7)',
          ],
          borderColor: [
            'rgb(239, 68, 68)',
            'rgb(249, 115, 22)',
            'rgb(251, 191, 36)',
            'rgb(168, 85, 247)',
            'rgb(236, 72, 153)',
            'rgb(14, 165, 233)',
            'rgb(99, 102, 241)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  // Income vs Outcome Trend
  const getIncomeOutcomeTrend = () => {
    const sortedProjects = [...projects].sort((a, b) => 
      new Date(a.projectDate) - new Date(b.projectDate)
    );

    return {
      labels: sortedProjects.map(p => p.projectNo),
      datasets: [
        {
          label: 'Income',
          data: sortedProjects.map(p => p.buyer?.summary?.totalReceived || 0),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          tension: 0.4,
        },
        {
          label: 'Outcome',
          data: sortedProjects.map(p => p.supplier?.summary?.totalAmount || 0),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          tension: 0.4,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += '$' + context.parsed.y.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(0).replace(/\d(?=(\d{3})+$)/g, '$&,');
          }
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  const stats = getOverviewStats();
  const projectData = selectedProject ? getProjectData(selectedProject) : null;

  if (loading) {
    return (
      <div className="user-view-container">
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-view-container">
      <nav className="user-nav">
        <div className="nav-brand">
          <h2>📊 TWL System - Analytics</h2>
        </div>
        <div className="nav-user">
          <span className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">User</span>
          </span>
          <button onClick={onLogout} className="logout-button">
            <span>Logout</span>
            <span className="logout-icon">→</span>
          </button>
        </div>
      </nav>

      <div className="user-content">
        <div className="welcome-section">
          <h1>Project Analytics Dashboard 📈</h1>
          <p>View financial insights and project performance</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'overview' ? 'active' : ''}`}
            onClick={() => setViewMode('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'details' ? 'active' : ''}`}
            onClick={() => setViewMode('details')}
          >
            📋 Project Details
          </button>
        </div>

        {/* Overview Mode */}
        {viewMode === 'overview' && (
          <>
            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">📁</div>
                <div className="stat-content">
                  <h3>Total Projects</h3>
                  <p className="stat-value">{stats.totalProjects}</p>
                </div>
              </div>

              <div className="stat-card success">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>Total Income</h3>
                  <p className="stat-value">${stats.totalIncome.toFixed(2)}</p>
                </div>
              </div>

              <div className="stat-card danger">
                <div className="stat-icon">💸</div>
                <div className="stat-content">
                  <h3>Total Outcome</h3>
                  <p className="stat-value">${stats.totalOutcome.toFixed(2)}</p>
                </div>
              </div>

              <div className="stat-card warning">
                <div className="stat-icon">🏦</div>
                <div className="stat-content">
                  <h3>Total Loans</h3>
                  <p className="stat-value">${stats.totalLoans.toFixed(2)}</p>
                </div>
              </div>

              <div className="stat-card info">
                <div className="stat-icon">📥</div>
                <div className="stat-content">
                  <h3>TWL Received</h3>
                  <p className="stat-value">${stats.totalTWLReceived.toFixed(2)}</p>
                </div>
              </div>

              <div className={`stat-card ${stats.totalNetProfit >= 0 ? 'success' : 'danger'}`}>
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <h3>Net Profit</h3>
                  <p className="stat-value">${stats.totalNetProfit.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Overview Charts */}
            <div className="charts-section">
              <div className="chart-card full-width">
                <h3>All Projects Net Profit</h3>
                <div className="chart-container">
                  <Bar data={getOverviewChartData()} options={chartOptions} />
                </div>
              </div>

              <div className="chart-card full-width">
                <h3>Income vs Outcome Trend</h3>
                <div className="chart-container">
                  <Line data={getIncomeOutcomeTrend()} options={chartOptions} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Project Details Mode */}
        {viewMode === 'details' && (
          <>
            {/* Project Selector */}
            <div className="project-selector">
              <label>Select Project:</label>
              <select 
                value={selectedProject?._id || ''} 
                onChange={(e) => {
                  const project = projects.find(p => p._id === e.target.value);
                  setSelectedProject(project);
                }}
              >
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.projectNo} - {project.projectName}
                  </option>
                ))}
              </select>
            </div>

            {selectedProject && projectData && (
              <>
                {/* Project Info Card */}
                <div className="project-info-card">
                  <h2>{selectedProject.projectName}</h2>
                  <div className="project-meta">
                    <span><strong>Project No:</strong> {selectedProject.projectNo}</span>
                    <span><strong>Date:</strong> {new Date(selectedProject.projectDate).toLocaleDateString()}</span>
                    <span><strong>Supplier:</strong> {selectedProject.supplier?.proformaInvoice?.supplierName || 'N/A'}</span>
                    <span><strong>Buyer:</strong> {selectedProject.buyer?.proformaInvoice?.buyerName || 'N/A'}</span>
                  </div>
                </div>

                {/* Project Financial Stats */}
                <div className="stats-grid">
                  <div className="stat-card primary">
                    <div className="stat-icon">💵</div>
                    <div className="stat-content">
                      <h3>Income</h3>
                      <p className="stat-value">${projectData.income.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="stat-card danger">
                    <div className="stat-icon">💸</div>
                    <div className="stat-content">
                      <h3>Outcome</h3>
                      <p className="stat-value">${projectData.outcome.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="stat-card warning">
                    <div className="stat-icon">🏦</div>
                    <div className="stat-content">
                      <h3>Loans</h3>
                      <p className="stat-value">${projectData.loans.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="stat-card info">
                    <div className="stat-icon">📥</div>
                    <div className="stat-content">
                      <h3>TWL Received</h3>
                      <p className="stat-value">${projectData.twlReceived.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className={`stat-card ${projectData.netProfit >= 0 ? 'success' : 'danger'}`}>
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                      <h3>Net Profit</h3>
                      <p className="stat-value">${projectData.netProfit.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Project Charts */}
                <div className="charts-section">
                  <div className="chart-card">
                    <h3>Financial Overview</h3>
                    <div className="chart-container">
                      <Bar data={getProjectFinancialChart(projectData)} options={chartOptions} />
                    </div>
                  </div>

                  {getExpensesChart(projectData) && (
                    <div className="chart-card">
                      <h3>Expenses Breakdown</h3>
                      <div className="chart-container">
                        <Pie data={getExpensesChart(projectData)} options={pieChartOptions} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Detailed Numbers Table */}
                <div className="details-table">
                  <h3>Financial Details</h3>
                  <table>
                    <tbody>
                      <tr>
                        <td><strong>Total Income (Buyer)</strong></td>
                        <td className="text-success">${projectData.income.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><strong>Total Outcome (Supplier)</strong></td>
                        <td className="text-danger">${projectData.outcome.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><strong>Loan Amount</strong></td>
                        <td>${projectData.loans.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><strong>TWL Received (Total)</strong></td>
                        <td className="text-info">${projectData.twlReceived.toFixed(2)}</td>
                      </tr>
                      <tr className="separator">
                        <td colSpan="2"><strong>Expenses Breakdown</strong></td>
                      </tr>
                      <tr>
                        <td>In Going</td>
                        <td>${projectData.expenses.inGoing.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Out Going</td>
                        <td>${projectData.expenses.outGoing.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>CAL Charges</td>
                        <td>${projectData.expenses.calCharges.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Other</td>
                        <td>${projectData.expenses.other.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Foreign Bank Charges</td>
                        <td>${projectData.expenses.foreignBankCharges.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Loan Interest</td>
                        <td>${projectData.expenses.loanInterest.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Freight Charges</td>
                        <td>${projectData.expenses.freightCharges.toFixed(2)}</td>
                      </tr>
                      <tr className="total-row">
                        <td><strong>NET PROFIT</strong></td>
                        <td className={projectData.netProfit >= 0 ? 'text-success' : 'text-danger'}>
                          <strong>${projectData.netProfit.toFixed(2)}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {projects.length === 0 && (
          <div className="no-projects">
            <p>📭 No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserView;