const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');

console.log('Writing improved components with CSS...\n');

// Login.jsx - Enhanced with better UX
const loginJsx = `import { useState } from 'react';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Server error. Please make sure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>TWL System</h1>
          <p className="subtitle">Garment Management System</p>
        </div>
        
        <h2>Sign In</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              placeholder="Enter your email" 
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              placeholder="Enter your password" 
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="demo-credentials">
          <h4>Demo Credentials</h4>
          <div className="credential-item">
            <span className="badge admin">Admin</span>
            <span>admin@gmail.com / admin123</span>
          </div>
          <div className="credential-item">
            <span className="badge user">User</span>
            <span>user@gmail.com / user123</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;`;

// Login.css - Modern, animated design
const loginCss = `.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  animation: gradientShift 15s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 450px;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #667eea;
  margin: 0 0 5px 0;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -1px;
}

.subtitle {
  color: #888;
  margin: 0;
  font-size: 0.95rem;
}

.login-box h2 {
  color: #333;
  text-align: center;
  margin: 0 0 30px 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  font-family: inherit;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.error-message {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.error-icon {
  font-size: 1.2rem;
}

.login-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.demo-credentials {
  margin-top: 30px;
  padding-top: 25px;
  border-top: 2px solid #f0f0f0;
}

.demo-credentials h4 {
  color: #666;
  font-size: 0.85rem;
  margin: 0 0 15px 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.credential-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 0.85rem;
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge.admin {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.badge.user {
  background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%);
  color: white;
}

.credential-item span:last-child {
  color: #666;
  font-family: monospace;
  font-size: 0.8rem;
}

@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }
  
  .login-header h1 {
    font-size: 2rem;
  }
  
  .credential-item {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}`;

// Write Login files
fs.writeFileSync(path.join(componentsDir, 'Login.jsx'), loginJsx);
fs.writeFileSync(path.join(componentsDir, 'Login.css'), loginCss);
console.log('✓ Created Login.jsx with enhanced UX');
console.log('✓ Created Login.css with animations and modern design');

// AdminDashboard.jsx
const adminJsx = `import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>🏢 TWL System</h2>
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
          <p>You have full administrative access to the system</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card primary">
            <div className="card-icon">👥</div>
            <div className="card-content">
              <h3>Users</h3>
              <p>Manage system users and permissions</p>
              <span className="card-arrow">→</span>
            </div>
          </div>

          <div className="dashboard-card success">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>Projects</h3>
              <p>View and manage all projects</p>
              <span className="card-arrow">→</span>
            </div>
          </div>

          <div className="dashboard-card warning">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Payments</h3>
              <p>Track and manage payment records</p>
              <span className="card-arrow">→</span>
            </div>
          </div>

          <div className="dashboard-card info">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <h3>Reports</h3>
              <p>Generate comprehensive reports</p>
              <span className="card-arrow">→</span>
            </div>
          </div>

          <div className="dashboard-card purple">
            <div className="card-icon">🏢</div>
            <div className="card-content">
              <h3>Suppliers</h3>
              <p>Manage supplier information</p>
              <span className="card-arrow">→</span>
            </div>
          </div>

          <div className="dashboard-card teal">
            <div className="card-icon">🛒</div>
            <div className="card-content">
              <h3>Buyers</h3>
              <p>Manage buyer relationships</p>
              <span className="card-arrow">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;`;

// AdminDashboard.css
const adminCss = `.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

.dashboard-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.2rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand h2 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  font-weight: 600;
  font-size: 1rem;
}

.user-role {
  font-size: 0.75rem;
  opacity: 0.9;
}

.logout-button {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logout-button:hover {
  background: white;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.logout-icon {
  transition: transform 0.3s ease;
}

.logout-button:hover .logout-icon {
  transform: translateX(4px);
}

.dashboard-content {
  padding: 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.welcome-section {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  margin-bottom: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #667eea;
}

.welcome-section h1 {
  color: #2d3748;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.welcome-section p {
  color: #718096;
  margin: 0;
  font-size: 1.05rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.dashboard-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  border-left: 4px solid transparent;
}

.dashboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.dashboard-card:hover::before {
  opacity: 1;
}

.dashboard-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

.dashboard-card.primary { border-left-color: #667eea; }
.dashboard-card.success { border-left-color: #48bb78; }
.dashboard-card.warning { border-left-color: #ed8936; }
.dashboard-card.info { border-left-color: #4299e1; }
.dashboard-card.purple { border-left-color: #9f7aea; }
.dashboard-card.teal { border-left-color: #38b2ac; }

.card-icon {
  font-size: 3.5rem;
  margin-bottom: 1.2rem;
  display: inline-block;
  transition: transform 0.3s ease;
}

.dashboard-card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
}

.card-content {
  position: relative;
}

.card-content h3 {
  color: #2d3748;
  margin: 0 0 0.5rem 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.card-content p {
  color: #718096;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.card-arrow {
  position: absolute;
  right: 0;
  bottom: 0;
  font-size: 1.5rem;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  color: #667eea;
}

.dashboard-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: 1.5rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .nav-user {
    flex-direction: column;
    align-items: flex-end;
    gap: 0.8rem;
  }

  .welcome-section h1 {
    font-size: 1.5rem;
  }
}`;

// UserView.jsx
const userJsx = `import './UserView.css';

const UserView = ({ user, onLogout }) => {
  return (
    <div className="user-view-container">
      <nav className="user-nav">
        <div className="nav-brand">
          <h2>📋 TWL System</h2>
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
          <h1>Welcome, {user.name}! 👋</h1>
          <p>View your assigned tasks and projects below</p>
        </div>

        <div className="user-grid">
          <div className="user-card primary">
            <div className="card-icon">📋</div>
            <div className="card-content">
              <h3>My Projects</h3>
              <p>View your assigned projects</p>
              <div className="card-badge">5 Active</div>
            </div>
          </div>

          <div className="user-card success">
            <div className="card-icon">📝</div>
            <div className="card-content">
              <h3>Tasks</h3>
              <p>Your pending tasks</p>
              <div className="card-badge">12 Pending</div>
            </div>
          </div>

          <div className="user-card warning">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>Reports</h3>
              <p>View your submitted reports</p>
              <div className="card-badge">8 Reports</div>
            </div>
          </div>

          <div className="user-card info">
            <div className="card-icon">📅</div>
            <div className="card-content">
              <h3>Schedule</h3>
              <p>View your work schedule</p>
              <div className="card-badge">This Week</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView;`;

// UserView.css
const userCss = `.user-view-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

.user-nav {
  background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%);
  color: white;
  padding: 1.2rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.user-nav .nav-brand h2 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
}

.user-nav .nav-user {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-nav .user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-nav .user-name {
  font-weight: 600;
  font-size: 1rem;
}

.user-nav .user-role {
  font-size: 0.75rem;
  opacity: 0.9;
}

.user-nav .logout-button {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-nav .logout-button:hover {
  background: white;
  color: #5b86e5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-nav .logout-icon {
  transition: transform 0.3s ease;
}

.user-nav .logout-button:hover .logout-icon {
  transform: translateX(4px);
}

.user-content {
  padding: 2.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.user-view-container .welcome-section {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  margin-bottom: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #36d1dc;
}

.user-view-container .welcome-section h1 {
  color: #2d3748;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.user-view-container .welcome-section p {
  color: #718096;
  margin: 0;
  font-size: 1.05rem;
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.user-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  border-left: 4px solid transparent;
}

.user-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(54, 209, 220, 0.05), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.user-card:hover::before {
  opacity: 1;
}

.user-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

.user-card.primary { border-left-color: #667eea; }
.user-card.success { border-left-color: #48bb78; }
.user-card.warning { border-left-color: #ed8936; }
.user-card.info { border-left-color: #4299e1; }

.user-card .card-icon {
  font-size: 3.5rem;
  margin-bottom: 1.2rem;
  display: inline-block;
  transition: transform 0.3s ease;
}

.user-card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
}

.user-card .card-content {
  position: relative;
}

.user-card h3 {
  color: #2d3748;
  margin: 0 0 0.5rem 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.user-card p {
  color: #718096;
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
}

.card-badge {
  display: inline-block;
  background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .user-content {
    padding: 1.5rem;
  }

  .user-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .user-nav .nav-user {
    flex-direction: column;
    align-items: flex-end;
    gap: 0.8rem;
  }

  .user-view-container .welcome-section h1 {
    font-size: 1.5rem;
  }
}`;

// Write all files
fs.writeFileSync(path.join(componentsDir, 'AdminDashboard.jsx'), adminJsx);
fs.writeFileSync(path.join(componentsDir, 'AdminDashboard.css'), adminCss);
fs.writeFileSync(path.join(componentsDir, 'UserView.jsx'), userJsx);
fs.writeFileSync(path.join(componentsDir, 'UserView.css'), userCss);

console.log('✓ Created AdminDashboard.jsx with modern cards');
console.log('✓ Created AdminDashboard.css with hover effects');
console.log('✓ Created UserView.jsx with user interface');
console.log('✓ Created UserView.css with unique styling');
console.log('\\n✅ All components updated successfully!');
console.log('Restart your Vite dev server to see the changes.');
