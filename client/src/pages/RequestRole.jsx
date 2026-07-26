import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Shield } from 'lucide-react';
import { useSelector } from 'react-redux';
import { submitRoleRequest } from '../features/role-requests/roleRequestApi';
import { useToast } from '../components/Toast';

const REQUESTABLE_ROLES = [
  { value: 'researcher_ngo', label: 'Researcher / NGO', description: 'For researchers, scientists, and NGO staff members' },
  { value: 'ranger', label: 'Ranger / Field Staff', description: 'For forest department rangers and field staff' },
  { value: 'rescue_center_staff', label: 'Rescue Center Staff', description: 'For wildlife rescue and rehabilitation center staff' },
];

function RequestRole() {
  const [formData, setFormData] = useState({
    requestedRole: '',
    reason: '',
    orgOrDeptName: '',
    inviteCode: '',
  });
  const [document, setDocument] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alreadyElevated, setAlreadyElevated] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { showSuccess, showError } = useToast();

  const elevatedRoles = ['ranger', 'researcher', 'rescue', 'admin'];

  useEffect(() => {
    if (user?.role && elevatedRoles.includes(user.role)) {
      setAlreadyElevated(true);
    }
  }, [user?.role]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF, DOC, DOCX, and image files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setDocument(file);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await submitRoleRequest(formData, document);
      showSuccess('Request submitted', 'Your role request has been submitted for review. You will be notified via email.');
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit role request');
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = REQUESTABLE_ROLES.find((r) => r.value === formData.requestedRole);

  if (alreadyElevated) {
    return (
      <div className="min-h-screen py-16 lg:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8 lg:p-10 text-center">
            <Shield className="w-12 h-12 text-canopy-forest-600 mx-auto mb-4" />
            <h1 className="text-2xl font-display font-semibold text-canopy-forest-950 mb-4">You already have elevated access</h1>
            <p className="text-canopy-ink-900/70 mb-6">Your account is already assigned the <strong>{user?.role}</strong> role.</p>
            <button onClick={() => navigate('/profile')} className="btn-primary">Back to Profile</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 lg:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8 lg:p-10">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-canopy-forest-600 hover:text-canopy-forest-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Profile
          </button>

          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-canopy-forest-600" />
            <div>
              <h1 className="text-3xl font-display font-semibold text-canopy-forest-950">Request a Role</h1>
              <p className="text-canopy-ink-900/70 mt-1">Request elevation to a trusted role with verified credentials.</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-3">Select Role</label>
              <div className="space-y-3">
                {REQUESTABLE_ROLES.map((role) => (
                  <label
                    key={role.value}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.requestedRole === role.value
                        ? 'border-canopy-forest-600 bg-canopy-forest-600/5'
                        : 'border-canopy-mist-200 hover:border-canopy-forest-600/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="requestedRole"
                      value={role.value}
                      checked={formData.requestedRole === role.value}
                      onChange={handleChange}
                      className="w-4 h-4 text-canopy-forest-600 mt-1"
                    />
                    <div>
                      <p className="font-medium text-canopy-forest-950">{role.label}</p>
                      <p className="text-sm text-canopy-ink-900/70">{role.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Organization / Department Name</label>
              <input
                type="text"
                name="orgOrDeptName"
                value={formData.orgOrDeptName}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Karnataka Forest Department, WWF-India"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Reason for Request</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={4}
                className="input-field resize-none"
                placeholder="Explain why you're requesting this role and how you'll use it..."
                required
              />
            </div>

            {formData.requestedRole === 'ranger' && (
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Invite Code (optional)</label>
                <input
                  type="text"
                  name="inviteCode"
                  value={formData.inviteCode}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter invite code if you have one"
                />
                <p className="text-xs text-canopy-ink-900/50 mt-1">
                  If you have an invite code from your department, enter it here as an alternative to document upload.
                </p>
              </div>
            )}

            {!formData.requestedRole ? (
              <div className="p-4 bg-canopy-sand-50 rounded-xl text-sm text-canopy-ink-900/70">
                Please select a role above to continue.
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">
                  Supporting Document {formData.requestedRole === 'ranger' && formData.inviteCode ? '(optional with invite code)' : ''}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-canopy-mist-200 rounded-xl cursor-pointer hover:border-canopy-forest-600 transition-colors">
                    <Upload className="w-5 h-5 text-canopy-forest-600" />
                    <span className="text-sm text-canopy-ink-900/70">
                      {document ? document.name : 'Click to upload PDF, DOC, or image'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-canopy-ink-900/50 mt-1">
                  Upload employment ID, appointment letter, NGO registration certificate, or similar official document.
                </p>
              </div>
            )}

            <div className="p-4 bg-canopy-sand-50 rounded-xl">
              <h3 className="font-medium text-canopy-forest-950 mb-2">What happens next?</h3>
              <ol className="text-sm text-canopy-ink-900/70 space-y-1 list-decimal list-inside">
                <li>Your request is reviewed by an Admin</li>
                <li>You'll receive an email notification with the decision</li>
                <li>If approved, you'll complete a role-specific profile form</li>
                <li>Your new permissions become active immediately after profile completion</li>
              </ol>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={loading || !formData.requestedRole} className="btn-primary flex-1">
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
              <button type="button" onClick={() => navigate('/profile')} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RequestRole;
