import { useState } from 'react';
import API_BASE_URL from '../config/api';
import './Login.css';

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
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
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        onLogin(data.user);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🏢 TWL System</h1>
          <p>{isRegister ? 'Create your account' : 'Sign in to your account'}</p>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                {isRegister ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              <>{isRegister ? 'Register' : 'Login'}</>
            )}
          </button>
        </form>

        <div className="toggle-form">
          <p>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setFormData({ name: '', email: '', password: '', role: 'user' });
              }}
              disabled={loading}
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
