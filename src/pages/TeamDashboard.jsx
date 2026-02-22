import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const TeamDashboard = () => {
  const navigate = useNavigate();
  const [teamMember, setTeamMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [helpRequests, setHelpRequests] = useState([]);

  useEffect(() => {
    checkTeamMember();
    // In a real app, this would fetch from a database
    // For now, we'll use mock data
    setHelpRequests([
      {
        id: 1,
        userName: 'Alice Johnson',
        email: 'alice@example.com',
        workDescription: 'I need help setting up a machine learning pipeline for image classification. New to GPUs.',
        timestamp: '2024-02-20 14:30',
        status: 'pending'
      },
      {
        id: 2,
        userName: 'Bob Smith',
        email: 'bob@example.com',
        workDescription: 'Need assistance with CUDA setup for neural network training.',
        timestamp: '2024-02-20 15:45',
        status: 'in-progress'
      }
    ]);
  }, []);

  const checkTeamMember = () => {
    const member = sessionStorage.getItem('teamMember');
    if (!member) {
      navigate('/login');
    } else {
      setTeamMember(JSON.parse(member));
    }
    setLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('teamMember');
    navigate('/');
  };

  const handleAssist = (requestId) => {
    // In a real app, this would update the database
    setHelpRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'in-progress' } : req
    ));
    alert('You have been assigned to assist this user!');
  };

  const handleComplete = (requestId) => {
    // In a real app, this would update the database
    setHelpRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'completed' } : req
    ));
    alert('Request marked as completed!');
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">
          <h2>NEURON NET</h2>
          <span className="dashboard-role team">Team Dashboard</span>
        </div>
        <nav className="dashboard-nav">
          <a href="#overview" className="nav-item active">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            Overview
          </a>
          <a href="#help-requests" className="nav-item">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
            </svg>
            Help Requests
          </a>
          <a href="#users" className="nav-item">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            Active Users
          </a>
          <a href="#analytics" className="nav-item">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
            Analytics
          </a>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          Logout
        </button>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Welcome, {teamMember?.name || 'Team Member'}! 👋</h1>
            <p>Support Dashboard - Help users with their compute needs</p>
          </div>
          <div className="user-profile">
            <div className="user-avatar team">
              {teamMember?.name?.charAt(0) || 'T'}
            </div>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon green">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Pending Requests</h3>
              <p className="stat-value">{helpRequests.filter(r => r.status === 'pending').length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>In Progress</h3>
              <p className="stat-value">{helpRequests.filter(r => r.status === 'in-progress').length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Completed Today</h3>
              <p className="stat-value">{helpRequests.filter(r => r.status === 'completed').length}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="content-card">
            <h2>User Assistance Requests</h2>
            <p className="card-subtitle">Help non-technical users with their compute tasks</p>
            
            {helpRequests.length === 0 ? (
              <div className="empty-state">
                <p>No help requests at the moment</p>
              </div>
            ) : (
              <div className="help-requests-list">
                {helpRequests.map(request => (
                  <div key={request.id} className={`help-request-item status-${request.status}`}>
                    <div className="request-header">
                      <div className="request-user">
                        <h4>{request.userName}</h4>
                        <p className="user-email">{request.email}</p>
                      </div>
                      <span className={`status-badge ${request.status}`}>
                        {request.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="request-body">
                      <p className="request-description">{request.workDescription}</p>
                      <span className="request-time">{request.timestamp}</span>
                    </div>
                    <div className="request-actions">
                      {request.status === 'pending' && (
                        <button 
                          className="btn-assist"
                          onClick={() => handleAssist(request.id)}
                        >
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                          </svg>
                          Start Assisting
                        </button>
                      )}
                      {request.status === 'in-progress' && (
                        <button 
                          className="btn-complete"
                          onClick={() => handleComplete(request.id)}
                        >
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          Mark Complete
                        </button>
                      )}
                      <button className="btn-contact">
                        Contact User
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;
