const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');

// Create components directory
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
  console.log('✓ Created components directory');
}

// Login.jsx
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
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>TWL System</h1>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Enter your password" disabled={loading} />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="demo-credentials">
          <h4>Demo Credentials:</h4>
          <p><strong>Admin:</strong> admin@gmail.com / admin123</p>
          <p><strong>User:</strong> user@gmail.com / user123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
`;

// Login.css
const loginCss = `.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.login-box h1 {
  color: #667eea;
  text-align: center;
  margin-bottom: 10px;
  font-size: 2rem;
}

.login-box h2 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.5rem;
  font-weight: 400;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}

.login-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.demo-credentials {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.demo-credentials h4 {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.demo-credentials p {
  color: #888;
  font-size: 13px;
  margin: 5px 0;
}

.demo-credentials strong {
  color: #667eea;
}
`;

// AdminDashboard.jsx
const adminJsx = `import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand"><h2>TWL System</h2></div>
        <div className="nav-user">
          <span className="user-name">{user.name} (Admin)</span>
          <button onClick={onLogout} className="logout-button">Logout</button>
        </div>
      </nav>
      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user.name}! You have full administrative access.</p>
        </div>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">👥</div>
            <h3>Users</h3>
            <p>Manage system users</p>
          </div>
          <div className="dashboard-card">
            <div className="card-icon">📊</div>
            <h3>Projects</h3>
            <p>View and manage projects</p>
          </div>
          <div className="dashboard-card">
            <div className="card-icon">💰</div>
            <h3>Payments</h3>
            <p>Track payment records</p>
          </div>
          <div className="dashboard-card">
            <div className="card-icon">📈</div>
            <h3>Reports</h3>
            <p>Generate system reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
`;

// AdminDashboard.css
const adminCss = `.dashboard-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.dashboard-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-brand h2 {
  margin: 0;
  font-size: 1.5rem;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-weight: 500;
}

.logout-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid white;
  color: white;
  padding: 8px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.logout-button:hover {
  background: white;
  color: #667eea;
}

.dashboard-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.welcome-section h1 {
  color: #333;
  margin: 0 0 0.5rem 0;
}

.welcome-section p {
  color: #666;
  margin: 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.dashboard-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.2);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.dashboard-card h3 {
  color: #333;
  margin: 0 0 0.5rem 0;
}

.dashboard-card p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}
`;

// UserView.jsx
const userJsx = `import './UserView.css';

const UserView = ({ user, onLogout }) => {
  return (
    <div className="user-view-container">
      <nav className="user-nav">
        <div className="nav-brand"><h2>TWL System</h2></div>
        <div className="nav-user">
          <span className="user-name">{user.name}</span>
          <button onClick={onLogout} className="logout-button">Logout</button>
        </div>
      </nav>
      <div className="user-content">
        <div className="welcome-section">
          <h1>User Dashboard</h1>
          <p>Welcome, {user.name}! View your assigned tasks and projects below.</p>
        </div>
        <div className="user-grid">
          <div className="user-card">
            <div className="card-icon">📋</div>
            <h3>My Projects</h3>
            <p>View assigned projects</p>
          </div>
          <div className="user-card">
            <div className="card-icon">📝</div>
            <h3>Tasks</h3>
            <p>Your pending tasks</p>
          </div>
          <div className="user-card">
            <div className="card-icon">📊</div>
            <h3>Reports</h3>
            <p>View your reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView;
`;

// UserView.css
const userCss = `.user-view-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.user-nav {
  background: linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.user-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.user-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s;
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(54, 209, 220, 0.2);
}

.user-card .card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.user-card h3 {
  color: #333;
  margin: 0 0 0.5rem 0;
}

.user-card p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}
`;

// Write all files
fs.writeFileSync(path.join(componentsDir, 'Login.jsx'), loginJsx);
fs.writeFileSync(path.join(componentsDir, 'Login.css'), loginCss);
fs.writeFileSync(path.join(componentsDir, 'AdminDashboard.jsx'), adminJsx);
fs.writeFileSync(path.join(componentsDir, 'AdminDashboard.css'), adminCss);
fs.writeFileSync(path.join(componentsDir, 'UserView.jsx'), userJsx);
fs.writeFileSync(path.join(componentsDir, 'UserView.css'), userCss);

console.log('✓ Created Login.jsx and Login.css');
console.log('✓ Created AdminDashboard.jsx and AdminDashboard.css');
console.log('✓ Created UserView.jsx and UserView.css');
console.log('\\n✅ Frontend components created! Restart your dev server.');
