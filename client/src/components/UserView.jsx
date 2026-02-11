import './UserView.css';

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

export default UserView;