import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

const TeamDashboard = () => {
  const navigate = useNavigate();
  const [teamMember, setTeamMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [helpRequests, setHelpRequests] = useState([]);
  const [adRequests, setAdRequests] = useState([]);
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [outputFile, setOutputFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeView, setActiveView] = useState('overview'); // overview, help-requests, ad-requests, users, analytics
  const [analytics, setAnalytics] = useState({
    totalRequests: 0,
    completedRequests: 0,
    activeUsers: 0,
    averageResponseTime: 0,
    requestsThisWeek: [],
    topGPUs: []
  });

  useEffect(() => {
    checkTeamMember();
    
    // Load assistance requests from localStorage
    const loadRequests = () => {
      const savedRequests = localStorage.getItem('assistanceRequests');
      if (savedRequests) {
        const requests = JSON.parse(savedRequests);
        setHelpRequests(requests);
      }
    };
    
    // Load ad requests from localStorage
    const loadAdRequests = () => {
      const savedAdRequests = localStorage.getItem('adRequests');
      if (savedAdRequests) {
        const requests = JSON.parse(savedAdRequests);
        setAdRequests(requests);
      } else {
        // Initialize with sample data if none exists
        setAdRequests([
          {
            id: 1,
            email: 'marketing@gpucloud.io',
            messageType: 'advertisement',
            message: 'We would like to advertise our GPU cloud services for AI training. Budget: $500/month.',
            timestamp: new Date().toLocaleString(),
            status: 'pending'
          }
        ]);
      }
    };
    
    loadRequests();
    loadAdRequests();
    
    // Reload every 10 seconds to check for new requests
    const interval = setInterval(() => {
      loadRequests();
      loadAdRequests();
      updateAnalytics();
    }, 10000);
    
    // Initial analytics load
    updateAnalytics();
    
    return () => clearInterval(interval);
  }, []);

  const updateAnalytics = () => {
    const jobs = JSON.parse(localStorage.getItem('activeJobs') || '[]');
    const requests = JSON.parse(localStorage.getItem('assistanceRequests') || '[]');
    
    // Calculate metrics
    const totalRequests = requests.length;
    const completedRequests = requests.filter(r => r.status === 'completed').length;
    const activeUsers = jobs.filter(j => j.status === 'running').length;
    
    // Simulate response time (in minutes)
    const avgResponseTime = requests.length > 0 
      ? Math.floor(Math.random() * 15) + 5 
      : 0;
    
    // Generate weekly data (last 7 days)
    const today = new Date();
    const requestsThisWeek = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      requestsThisWeek.push({
        day: dayName,
        count: Math.floor(Math.random() * 20) + 5
      });
    }
    
    // Top GPUs used
    const gpuCounts = {};
    jobs.forEach(job => {
      gpuCounts[job.resourceName] = (gpuCounts[job.resourceName] || 0) + 1;
    });
    
    const topGPUs = Object.entries(gpuCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    
    setAnalytics({
      totalRequests,
      completedRequests,
      activeUsers,
      averageResponseTime: avgResponseTime,
      requestsThisWeek,
      topGPUs
    });
  };

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
    const request = helpRequests.find(req => req.id === requestId);
    if (!request) return;
    
    // Update assistance request status
    const updatedRequests = helpRequests.map(req => 
      req.id === requestId ? { ...req, status: 'in-progress' } : req
    );
    setHelpRequests(updatedRequests);
    localStorage.setItem('assistanceRequests', JSON.stringify(updatedRequests));
    
    // Update the job logs in activeJobs
    const currentTime = new Date().toLocaleTimeString();
    const jobs = JSON.parse(localStorage.getItem('activeJobs') || '[]');
    const updatedJobs = jobs.map(job => 
      job.id === request.jobId 
        ? { 
            ...job, 
            logs: [...job.logs, `[${currentTime}] ✅ Team accepted assistance request and is now working on it`] 
          }
        : job
    );
    localStorage.setItem('activeJobs', JSON.stringify(updatedJobs));
    
    alert('You have been assigned to assist this user! User will see updates in their dashboard.');
  };

  const handleComplete = (requestId) => {
    const request = helpRequests.find(req => req.id === requestId);
    if (!request) return;
    
    // Update assistance request status
    const updatedRequests = helpRequests.map(req => 
      req.id === requestId ? { ...req, status: 'completed' } : req
    );
    setHelpRequests(updatedRequests);
    localStorage.setItem('assistanceRequests', JSON.stringify(updatedRequests));
    
    // Update the job logs in activeJobs
    const currentTime = new Date().toLocaleTimeString();
    const jobs = JSON.parse(localStorage.getItem('activeJobs') || '[]');
    const updatedJobs = jobs.map(job => 
      job.id === request.jobId 
        ? { 
            ...job, 
            logs: [...job.logs, `[${currentTime}] ✅ Assistance completed! Your GPU task has been optimized.`] 
          }
        : job
    );
    localStorage.setItem('activeJobs', JSON.stringify(updatedJobs));
    
    alert('Request marked as completed! User will see the completion in their dashboard.');
  };

  const handleApproveAd = (adId) => {
    setAdRequests(prev => prev.map(ad => 
      ad.id === adId ? { ...ad, status: 'approved' } : ad
    ));
    alert('✅ Advertisement request approved!');
  };

  const handleDenyAd = (adId) => {
    setAdRequests(prev => prev.map(ad => 
      ad.id === adId ? { ...ad, status: 'denied' } : ad
    ));
    alert('❌ Advertisement request denied.');
  };

  const handleUploadOutput = (request) => {
    setSelectedRequest(request);
    setShowOutputModal(true);
  };

  const handleOutputSubmit = async (e) => {
    e.preventDefault();
    
    if (!outputFile) {
      alert('Please select a file to upload');
      return;
    }
    
    setUploading(true);
    
    try {
      // Generate unique file name
      const timestamp = Date.now();
      const fileExt = outputFile.name.split('.').pop();
      const fileName = `${selectedRequest.id}_${timestamp}.${fileExt}`;
      const filePath = `outputs/${fileName}`;
      
      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('neuron-outputs')
        .upload(filePath, outputFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      console.log('File uploaded successfully:', uploadData);
      
      // Update request status
      const updatedRequests = helpRequests.map(req => 
        req.id === selectedRequest.id 
          ? { 
              ...req, 
              outputUploaded: true,
              outputFileName: outputFile.name,
              outputFilePath: filePath,
              outputUploadedAt: new Date().toISOString()
            } 
          : req
      );
      
      setHelpRequests(updatedRequests);
      localStorage.setItem('assistanceRequests', JSON.stringify(updatedRequests));
      
      // Notify user via job logs
      const jobs = JSON.parse(localStorage.getItem('activeJobs') || '[]');
      const currentTime = new Date().toLocaleTimeString();
      const updatedJobs = jobs.map(job => 
        job.id === selectedRequest.jobId
          ? {
              ...job,
              hasOutput: true,
              outputFileName: outputFile.name,
              outputFilePath: filePath,
              logs: [
                ...job.logs,
                `[${currentTime}] 📦 Output file ready: ${outputFile.name}`,
                `[${currentTime}] ✅ Click "View Output" to download your results!`
              ]
            }
          : job
      );
      localStorage.setItem('activeJobs', JSON.stringify(updatedJobs));
      
      alert(`✅ Output uploaded successfully for ${selectedRequest.userName}!\nFile: ${outputFile.name}`);
      
      setShowOutputModal(false);
      setOutputFile(null);
      setSelectedRequest(null);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`❌ Error uploading file: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleContactAdvertiser = (ad) => {
    const subject = encodeURIComponent(`Re: ${ad.messageType} Request - Neuron Net`);
    const body = encodeURIComponent(`Hi,\n\nThank you for your interest in Neuron Net.\n\nRegarding your ${ad.messageType} request:\n"${ad.message}"\n\nWe would like to discuss this further with you.\n\nBest regards,\nNeuron Net Team`);
    window.location.href = `mailto:${ad.email}?subject=${subject}&body=${body}`;
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
          <a 
            href="#overview" 
            className={`nav-item ${activeView === 'overview' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveView('overview'); }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            Overview
          </a>
          <a 
            href="#help-requests" 
            className={`nav-item ${activeView === 'help-requests' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveView('help-requests'); }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
            </svg>
            Help Requests
          </a>
          <a 
            href="#ad-requests" 
            className={`nav-item ${activeView === 'ad-requests' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveView('ad-requests'); }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
            </svg>
            Ad Requests
          </a>
          <a 
            href="#users" 
            className={`nav-item ${activeView === 'users' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveView('users'); }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            Active Users
          </a>
          <a 
            href="#analytics" 
            className={`nav-item ${activeView === 'analytics' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setActiveView('analytics'); }}
          >
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

        {activeView === 'overview' && (
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

            <div className="stat-card">
              <div className="stat-icon orange">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <div className="stat-content">
                <h3>Active Users</h3>
                <p className="stat-value">{(() => {
                  const jobs = JSON.parse(localStorage.getItem('activeJobs') || '[]');
                  const runningJobs = jobs.filter(j => j.status === 'running');
                  return runningJobs.length;
                })()}</p>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-content">
          {activeView === 'help-requests' && (
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
                        <>
                          <button 
                            className="btn-complete"
                            onClick={() => handleComplete(request.id)}
                          >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            Mark Complete
                          </button>
                          <button 
                            className="btn-upload"
                            onClick={() => handleUploadOutput(request)}
                          >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                            </svg>
                            Upload Output
                          </button>
                        </>
                      )}
                      {request.status === 'completed' && request.outputUploaded && (
                        <span className="output-badge">
                          ✓ Output Delivered
                        </span>
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
          )}

          {/* Ad Requests Section */}
          {activeView === 'ad-requests' && (
            <div className="content-card">
              <h2>Advertisement Requests</h2>
              <p className="card-subtitle">Review and manage advertisement inquiries</p>
            
            {adRequests.length === 0 ? (
              <div className="empty-state">
                <p>No ad requests at the moment</p>
              </div>
            ) : (
              <div className="help-requests-list">
                {adRequests.map(ad => (
                  <div key={ad.id} className={`help-request-item status-${ad.status}`}>
                    <div className="request-header">
                      <div className="request-user">
                        <h4>{ad.email}</h4>
                        <p className="user-email">{ad.messageType.replace('-', ' ').toUpperCase()}</p>
                      </div>
                      <span className={`status-badge ${ad.status}`}>
                        {ad.status}
                      </span>
                    </div>
                    <div className="request-body">
                      <p className="request-description">{ad.message}</p>
                      <span className="request-time">{ad.timestamp}</span>
                    </div>
                    {ad.status === 'pending' && (
                      <div className="request-actions">
                        <button 
                          className="btn-assist"
                          onClick={() => handleApproveAd(ad.id)}
                        >
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                          </svg>
                          Approve
                        </button>
                        <button 
                          className="btn-cancel"
                          onClick={() => handleDenyAd(ad.id)}
                        >
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                          </svg>
                          Deny
                        </button>
                        <button 
                          className="btn-contact"
                          onClick={() => handleContactAdvertiser(ad)}
                        >
                          Contact Advertiser
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {/* Users View */}
          {activeView === 'users' && (
            <div className="content-card">
              <h2>Active Users</h2>
              <p className="card-subtitle">Monitor users currently running GPU compute tasks</p>
              <div className="empty-state">
                <svg width="64" height="64" fill="rgba(102, 126, 234, 0.3)" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                <p>User monitoring dashboard coming soon</p>
              </div>
            </div>
          )}

          {/* Analytics View */}
          {activeView === 'analytics' && (
            <div className="analytics-view">
              <h2 className="view-title">Real-Time Analytics Dashboard</h2>
              <p className="view-subtitle">Live performance metrics and usage statistics</p>
              
              {/* Key Metrics Cards */}
              <div className="analytics-metrics">
                <div className="metric-card">
                  <div className="metric-icon blue">
                    <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                  </div>
                  <div className="metric-content">
                    <h3 className="metric-label">Total Requests</h3>
                    <p className="metric-value">{analytics.totalRequests}</p>
                    <span className="metric-change positive">+{Math.floor(Math.random() * 15) + 5}% this week</span>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-icon green">
                    <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div className="metric-content">
                    <h3 className="metric-label">Completed</h3>
                    <p className="metric-value">{analytics.completedRequests}</p>
                    <span className="metric-change positive">{analytics.totalRequests > 0 ? Math.round((analytics.completedRequests / analytics.totalRequests) * 100) : 0}% completion rate</span>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-icon orange">
                    <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                  </div>
                  <div className="metric-content">
                    <h3 className="metric-label">Active Users</h3>
                    <p className="metric-value">{analytics.activeUsers}</p>
                    <span className="metric-change neutral">Currently running tasks</span>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-icon purple">
                    <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                  </div>
                  <div className="metric-content">
                    <h3 className="metric-label">Avg Response Time</h3>
                    <p className="metric-value">{analytics.averageResponseTime}m</p>
                    <span className="metric-change positive">-{Math.floor(Math.random() * 5) + 1}m from last week</span>
                  </div>
                </div>
              </div>
              
              {/* Charts Section */}
              <div className="analytics-charts">
                <div className="chart-card">
                  <h3 className="chart-title">Requests This Week</h3>
                  <div className="chart-container">
                    <div className="bar-chart">
                      {analytics.requestsThisWeek.map((day, index) => (
                        <div key={index} className="bar-item">
                          <div className="bar-column">
                            <div 
                              className="bar-fill" 
                              style={{ 
                                height: `${(day.count / 25) * 100}%`,
                                animationDelay: `${index * 0.1}s`
                              }}
                            >
                              <span className="bar-value">{day.count}</span>
                            </div>
                          </div>
                          <span className="bar-label">{day.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="chart-card">
                  <h3 className="chart-title">Top GPU Models</h3>
                  <div className="chart-container">
                    {analytics.topGPUs.length > 0 ? (
                      <div className="gpu-list">
                        {analytics.topGPUs.map((gpu, index) => (
                          <div key={index} className="gpu-item">
                            <div className="gpu-info">
                              <span className="gpu-rank">#{index + 1}</span>
                              <span className="gpu-name">{gpu.name}</span>
                            </div>
                            <div className="gpu-bar">
                              <div 
                                className="gpu-bar-fill" 
                                style={{ 
                                  width: `${(gpu.count / Math.max(...analytics.topGPUs.map(g => g.count))) * 100}%`,
                                  animationDelay: `${index * 0.15}s`
                                }}
                              ></div>
                            </div>
                            <span className="gpu-count">{gpu.count} tasks</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state-small">
                        <p>No GPU usage data yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Live Activity Feed */}
              <div className="activity-feed">
                <h3 className="chart-title">Live Activity Feed</h3>
                <div className="activity-list">
                  {helpRequests.slice(0, 5).map((request, index) => (
                    <div key={index} className="activity-item">
                      <div className={`activity-icon ${request.status}`}>
                        {request.status === 'completed' ? '✅' : request.status === 'in-progress' ? '⚡' : '🔔'}
                      </div>
                      <div className="activity-content">
                        <p className="activity-text">
                          <strong>{request.userName}</strong> {request.status === 'completed' ? 'completed' : request.status === 'in-progress' ? 'is working on' : 'requested'} assistance
                        </p>
                        <span className="activity-time">{request.timestamp}</span>
                      </div>
                      <span className={`activity-badge ${request.status}`}>{request.status}</span>
                    </div>
                  ))}
                  {helpRequests.length === 0 && (
                    <div className="empty-state-small">
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Output Upload Modal */}
      {showOutputModal && (
        <div className="modal-overlay" onClick={() => setShowOutputModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Task Output</h2>
              <button className="modal-close" onClick={() => setShowOutputModal(false)}>
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="user-info-section">
                <p><strong>User:</strong> {selectedRequest?.userName}</p>
                <p><strong>Email:</strong> {selectedRequest?.email}</p>
                <p><strong>Task:</strong> {selectedRequest?.workDescription}</p>
              </div>

              <form onSubmit={handleOutputSubmit}>
                <div className="form-group">
                  <label htmlFor="outputFile">
                    Upload Output File (Results, Models, Reports, etc.)
                    <span className="label-required">*</span>
                  </label>
                  <input
                    id="outputFile"
                    type="file"
                    onChange={(e) => setOutputFile(e.target.files[0])}
                    required
                    className="file-input"
                  />
                  {outputFile && (
                    <p className="file-name">Selected: {outputFile.name}</p>
                  )}
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-cancel" 
                    onClick={() => setShowOutputModal(false)}
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={uploading || !outputFile}
                  >
                    {uploading ? (
                      <>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="spinning">
                          <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                        </svg>
                        Upload Output
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDashboard;
