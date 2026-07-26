import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import { getAllRoleRequests, decideRoleRequest } from '../features/role-requests/roleRequestApi';
import { useToast } from '../components/Toast';

const STATUSES = ['pending', 'approved', 'rejected'];
const ROLES = ['researcher_ngo', 'ranger', 'rescue_center_staff'];

function AdminRoleRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    requestedRole: '',
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadRequests();
  }, [filters]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.requestedRole) params.requestedRole = filters.requestedRole;
      const result = await getAllRoleRequests(params);
      setRequests(result.data || []);
    } catch (err) {
      setError('Failed to load role requests');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDecide = async (requestId, action) => {
    try {
      setActionLoading(true);
      await decideRoleRequest(requestId, action, '');
      showSuccess(`Request ${action}d`, `The role request has been ${action}d.`);
      loadRequests();
      setSelectedRequest(null);
    } catch (err) {
      showError('Action failed', err.response?.data?.message || 'Please try again');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700';
      case 'approved': return 'bg-green-50 text-green-700';
      case 'rejected': return 'bg-red-50 text-red-700';
      default: return 'bg-canopy-sand-100 text-canopy-ink-900/70';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-display font-semibold text-white mb-3">Role Requests</h1>
          <p className="text-lg text-canopy-sand-200 max-w-2xl">Review and manage user role elevation requests.</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="card p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input-field pl-12"
              />
            </div>
            <select name="status" value={filters.status} onChange={handleFilterChange} className="input-field sm:w-48">
              <option value="">All Statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
            <select name="requestedRole" value={filters.requestedRole} onChange={handleFilterChange} className="input-field sm:w-48">
              <option value="">All Roles</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>{role.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 text-canopy-ink-900/60">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-canopy-ink-900/60">No role requests found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request._id} className="p-6 bg-canopy-sand-50 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-canopy-forest-950">
                          {request.user?.firstName} {request.user?.lastName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-canopy-ink-900/70 mb-1">{request.user?.email}</p>
                      <p className="text-sm text-canopy-ink-900/70 mb-1">
                        Requested: <strong>{request.requestedRole.replace('_', ' ').toUpperCase()}</strong>
                      </p>
                      <p className="text-sm text-canopy-ink-900/70 mb-1">
                        Organization: {request.orgOrDeptName}
                      </p>
                      <p className="text-sm text-canopy-ink-900/70 mb-2">
                        Reason: {request.reason}
                      </p>
                      {request.documentFile && (
                        <p className="text-xs text-canopy-forest-600">
                          Document: {request.documentOriginalName}
                        </p>
                      )}
                      {request.inviteCode && (
                        <p className="text-xs text-canopy-forest-600">
                          Invite Code: {request.inviteCode}
                        </p>
                      )}
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleDecide(request._id, 'approve')}
                          disabled={actionLoading}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDecide(request._id, 'reject')}
                          disabled={actionLoading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminRoleRequests;
