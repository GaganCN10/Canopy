import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { getAllRoleRequests, getRoleRequestById, decideRoleRequest } from '../features/role-requests/roleRequestApi';
import { useToast } from '../components/Toast';
import { useSelector } from 'react-redux';

export default function ReviewRoleRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { user } = useSelector((state) => state.auth);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [action, setAction] = useState(null);

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    try {
      const result = await getRoleRequestById(id);
      setRequest(result.data || null);
    } catch (err) {
      showError('Failed to load request', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleDecide = async (selectedAction) => {
    setAction(selectedAction);
    if (selectedAction === 'reject' && !rejectionReason.trim()) {
      showError('Reason required', 'Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      await decideRoleRequest(id, selectedAction, rejectionReason);
      showSuccess(`Request ${selectedAction}d`, `The role request has been ${selectedAction}d.`);
      navigate('/admin/role-requests');
    } catch (err) {
      showError('Action failed', err.response?.data?.message || 'Please try again');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Role Request Not Found</h1>
          <p className="text-canopy-ink-900/70 mb-6">The request you are looking for does not exist or has been removed.</p>
          <button onClick={() => navigate('/admin/role-requests')} className="primary-btn">
            Back to Role Requests
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/admin/role-requests')} className="flex items-center gap-2 text-canopy-sand-200 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Role Requests
          </button>
          <h1 className="text-3xl lg:text-4xl font-display font-semibold text-white mb-3">Role Request Review</h1>
          <p className="text-lg text-canopy-sand-200 max-w-2xl">Review and take action on this role elevation request.</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="card p-6 lg:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-canopy-forest-950">
                  {request.user?.firstName} {request.user?.lastName}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  request.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                  request.status === 'approved' ? 'bg-green-50 text-green-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {request.status}
                </span>
              </div>
              <p className="text-sm text-canopy-ink-900/70">{request.user?.email}</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-4 bg-canopy-sand-50 rounded-xl">
              <h3 className="font-semibold text-canopy-forest-950 mb-2">Requested Role</h3>
              <p className="text-canopy-ink-900/80">{request.requestedRole?.replace('_', ' ').toUpperCase()}</p>
            </div>

            <div className="p-4 bg-canopy-sand-50 rounded-xl">
              <h3 className="font-semibold text-canopy-forest-950 mb-2">Organization / Department</h3>
              <p className="text-canopy-ink-900/80">{request.orgOrDeptName}</p>
            </div>

            <div className="p-4 bg-canopy-sand-50 rounded-xl">
              <h3 className="font-semibold text-canopy-forest-950 mb-2">Reason</h3>
              <p className="text-canopy-ink-900/80 whitespace-pre-wrap">{request.reason}</p>
            </div>

            {request.documentFile && (
              <div className="p-4 bg-canopy-sand-50 rounded-xl">
                <h3 className="font-semibold text-canopy-forest-950 mb-2">Supporting Document</h3>
                <p className="text-sm text-canopy-ink-900/70">{request.documentOriginalName || 'Document uploaded'}</p>
              </div>
            )}

            {request.inviteCode && (
              <div className="p-4 bg-canopy-sand-50 rounded-xl">
                <h3 className="font-semibold text-canopy-forest-950 mb-2">Invite Code</h3>
                <p className="text-sm text-canopy-ink-900/70 font-mono">{request.inviteCode}</p>
              </div>
            )}
          </div>

          {isAdmin && request.status === 'pending' && (
            <div className="border-t border-canopy-mist-200 pt-6">
              <h3 className="font-semibold text-canopy-forest-950 mb-4">Decision</h3>

              {action === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-canopy-ink-900/80 mb-2">Rejection Reason</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="input-field w-full"
                    placeholder="Provide a reason for rejection..."
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleDecide('approve')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve
                </button>
                <button
                  onClick={() => handleDecide('reject')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </div>
          )}

          {!isAdmin && (
            <div className="border-t border-canopy-mist-200 pt-6">
              <p className="text-sm text-canopy-ink-900/70">Only administrators can approve or reject role requests.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
