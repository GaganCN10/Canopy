import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Users, MapPin, Phone } from 'lucide-react';
import { submitRoleProfile } from '../features/role-requests/roleRequestApi';
import { useToast } from '../components/Toast';

function RoleProfileForm() {
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    orgName: '',
    orgType: '',
    position: '',
    orgWebsite: '',
    phone: '',
    department: '',
    designation: '',
    badgeId: '',
    centerName: '',
    centerAddress: '',
    centerRole: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam && ['researcher_ngo', 'ranger', 'rescue_center_staff'].includes(roleParam)) {
      setRole(roleParam);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const fields = {};
      if (role === 'researcher_ngo') {
        fields.orgName = formData.orgName;
        fields.orgType = formData.orgType;
        fields.position = formData.position;
        fields.orgWebsite = formData.orgWebsite;
        fields.phone = formData.phone;
      } else if (role === 'ranger') {
        fields.department = formData.department;
        fields.designation = formData.designation;
        fields.badgeId = formData.badgeId;
        fields.phone = formData.phone;
      } else if (role === 'rescue_center_staff') {
        fields.centerName = formData.centerName;
        fields.centerAddress = formData.centerAddress;
        fields.centerRole = formData.centerRole;
        fields.phone = formData.phone;
      }

      await submitRoleProfile({ role, fields });
      showSuccess('Profile completed', 'Your role has been activated successfully.');
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit role profile');
    } finally {
      setLoading(false);
    }
  };

  const renderFields = () => {
    if (role === 'researcher_ngo') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Organization Name</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
              <input type="text" name="orgName" value={formData.orgName} onChange={handleChange} className="input-field pl-12" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Organization Type</label>
            <input type="text" name="orgType" value={formData.orgType} onChange={handleChange} className="input-field" placeholder="e.g., NGO, Research Institute" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Position / Title</label>
            <input type="text" name="position" value={formData.position} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Organization Website (optional)</label>
            <input type="url" name="orgWebsite" value={formData.orgWebsite} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Phone</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field pl-12" required />
            </div>
          </div>
        </>
      );
    }

    if (role === 'ranger') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Department / Forest Division</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
              <input type="text" name="department" value={formData.department} onChange={handleChange} className="input-field pl-12" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Designation</label>
            <input type="text" name="designation" value={formData.designation} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Badge / Employee ID</label>
            <input type="text" name="badgeId" value={formData.badgeId} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Contact Phone</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field pl-12" required />
            </div>
          </div>
        </>
      );
    }

    if (role === 'rescue_center_staff') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Center Name</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
              <input type="text" name="centerName" value={formData.centerName} onChange={handleChange} className="input-field pl-12" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Center Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
              <input type="text" name="centerAddress" value={formData.centerAddress} onChange={handleChange} className="input-field pl-12" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Your Role at Center</label>
            <input type="text" name="centerRole" value={formData.centerRole} onChange={handleChange} className="input-field" placeholder="e.g., Veterinarian, Caretaker" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Contact Phone</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field pl-12" required />
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  if (!role) {
    return (
      <div className="min-h-screen py-16 lg:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8 lg:p-10 text-center">
            <h1 className="text-2xl font-display font-semibold text-canopy-forest-950 mb-4">Invalid Role</h1>
            <p className="text-canopy-ink-900/70 mb-6">No role specified for profile completion.</p>
            <button onClick={() => navigate('/profile')} className="btn-primary">
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  const roleLabels = {
    researcher_ngo: 'Researcher / NGO',
    ranger: 'Ranger / Field Staff',
    rescue_center_staff: 'Rescue Center Staff',
  };

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

          <h1 className="text-3xl font-display font-semibold text-canopy-forest-950 mb-2">
            Complete Your {roleLabels[role]} Profile
          </h1>
          <p className="text-canopy-ink-900/70 mb-8">
            Provide your role-specific details to activate your new permissions.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderFields()}

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Submitting...' : 'Complete Profile'}
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

export default RoleProfileForm;
