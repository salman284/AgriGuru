import React, { useState, useEffect } from 'react';
import './ContractAdmin.css';

const ContractAdmin = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/contract-farming/applications');
      const result = await response.json();
      
      if (result.success) {
        setApplications(result.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/contract-farming/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateApplicationStatus = async (contractId, newStatus, remarks = '') => {
    try {
      const response = await fetch(`http://localhost:5000/api/contract-farming/application/${contractId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          remarks: remarks
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh applications and stats
        fetchApplications();
        fetchStats();
        alert('Status updated successfully!');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Network error. Please try again.');
    }
  };

  const filteredApplications = applications.filter(app => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending_verification: '#FFA726',
      under_review: '#42A5F5',
      approved: '#66BB6A',
      rejected: '#EF5350',
      active: '#26A69A',
      completed: '#9CCC65'
    };
    return colors[status] || '#757575';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading contract applications...</p>
      </div>
    );
  }

  return (
    <div className="contract-admin">
      <div className="admin-header">
        <h1>🌾 Contract Farming Administration</h1>
        <p>Manage contract farming applications and track statistics</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.totalApplications || 0}</h3>
            <p>Total Applications</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏞️</div>
          <div className="stat-content">
            <h3>{stats.totalLandAreaSatak || 0}</h3>
            <p>Total Land (Satak)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalContractValue || 0)}</h3>
            <p>Total Contract Value</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.averageContractValue || 0)}</h3>
            <p>Average Contract Value</p>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="filter-section">
        <label>Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="all">All Applications</option>
          <option value="pending_verification">Pending Verification</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="applications-section">
        <h2>Contract Applications ({filteredApplications.length})</h2>
        
        {filteredApplications.length === 0 ? (
          <div className="no-applications">
            <p>No applications found for the selected filter.</p>
          </div>
        ) : (
          <div className="applications-table">
            <table>
              <thead>
                <tr>
                  <th>Contract ID</th>
                  <th>Farmer Name</th>
                  <th>Land Area</th>
                  <th>Contract Value</th>
                  <th>Status</th>
                  <th>Submission Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app.contractId}>
                    <td>
                      <strong>{app.contractId}</strong>
                    </td>
                    <td>
                      <div className="farmer-info">
                        <strong>{app.personalInfo.fullName}</strong>
                        <br />
                        <small>{app.personalInfo.phoneNumber}</small>
                      </div>
                    </td>
                    <td>{app.landDetails.landAreaSatak} satak</td>
                    <td>{formatCurrency(app.contractTerms.totalContractValue)}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(app.status) }}
                      >
                        {app.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {new Date(app.submissionDate).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-view"
                          onClick={() => setSelectedApplication(app)}
                        >
                          👁️ View
                        </button>
                        <select
                          className="status-update"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              updateApplicationStatus(app.contractId, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        >
                          <option value="">Update Status</option>
                          <option value="pending_verification">Pending Verification</option>
                          <option value="under_review">Under Review</option>
                          <option value="approved">Approve</option>
                          <option value="rejected">Reject</option>
                          <option value="active">Activate</option>
                          <option value="completed">Complete</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="modal-overlay" onClick={() => setSelectedApplication(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Contract Application Details</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedApplication(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-section">
                  <h3>👤 Personal Information</h3>
                  <p><strong>Name:</strong> {selectedApplication.personalInfo.fullName}</p>
                  <p><strong>Father's Name:</strong> {selectedApplication.personalInfo.fatherName}</p>
                  <p><strong>Phone:</strong> {selectedApplication.personalInfo.phoneNumber}</p>
                  <p><strong>Email:</strong> {selectedApplication.personalInfo.emailAddress || 'Not provided'}</p>
                  <p><strong>Aadhar:</strong> {selectedApplication.personalInfo.aadharNumber}</p>
                </div>

                <div className="detail-section">
                  <h3>🏠 Address</h3>
                  <p><strong>Village:</strong> {selectedApplication.address.village}</p>
                  <p><strong>District:</strong> {selectedApplication.address.district}</p>
                  <p><strong>State:</strong> {selectedApplication.address.state}</p>
                  <p><strong>PIN Code:</strong> {selectedApplication.address.pinCode}</p>
                </div>

                <div className="detail-section">
                  <h3>🏞️ Land Details</h3>
                  <p><strong>Area:</strong> {selectedApplication.landDetails.landAreaSatak} satak</p>
                  <p><strong>Location:</strong> {selectedApplication.landDetails.landLocation}</p>
                  <p><strong>Soil Type:</strong> {selectedApplication.landDetails.soilType}</p>
                  <p><strong>Water Source:</strong> {selectedApplication.landDetails.waterSource}</p>
                  <p><strong>Previous Crop:</strong> {selectedApplication.landDetails.previousCrop || 'Not specified'}</p>
                </div>

                <div className="detail-section">
                  <h3>🏦 Banking Details</h3>
                  <p><strong>Bank Name:</strong> {selectedApplication.bankingDetails.bankName}</p>
                  <p><strong>Account Number:</strong> {selectedApplication.bankingDetails.accountNumber}</p>
                  <p><strong>IFSC Code:</strong> {selectedApplication.bankingDetails.ifscCode}</p>
                </div>

                <div className="detail-section">
                  <h3>💰 Contract Terms</h3>
                  <p><strong>Yearly Payment:</strong> {formatCurrency(selectedApplication.contractTerms.yearlyPayment)}</p>
                  <p><strong>Total Contract Value:</strong> {formatCurrency(selectedApplication.contractTerms.totalContractValue)}</p>
                  <p><strong>Training Allowance:</strong> {formatCurrency(selectedApplication.contractTerms.trainingAllowance)}</p>
                  <p><strong>Monthly Wages:</strong> {formatCurrency(selectedApplication.contractTerms.monthlyWages)}</p>
                  <p><strong>Contract Duration:</strong> {selectedApplication.contractTerms.contractDuration} years</p>
                </div>

                <div className="detail-section">
                  <h3>📋 Application Status</h3>
                  <p><strong>Contract ID:</strong> {selectedApplication.contractId}</p>
                  <p><strong>Status:</strong> 
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedApplication.status), marginLeft: '10px' }}
                    >
                      {selectedApplication.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </p>
                  <p><strong>Submitted:</strong> {new Date(selectedApplication.submissionDate).toLocaleString('en-IN')}</p>
                  {selectedApplication.lastUpdated && (
                    <p><strong>Last Updated:</strong> {new Date(selectedApplication.lastUpdated).toLocaleString('en-IN')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractAdmin;
