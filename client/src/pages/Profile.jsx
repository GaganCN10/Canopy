import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, LogOut, Save, Camera, Lock, MapPin, Briefcase, Award, FileText } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../features/admin/userApi';
import { logout, setCredentials } from '../features/auth/authSlice';
import { changePassword as changePasswordApi } from '../features/auth/authApi';
import { getMyMissions } from '../features/missions/missionApi';
import { getQuizAttempts } from '../features/articles/articleApi';
import { getMyRoleRequests, submitRoleProfile, updateMyRoleProfile } from '../features/role-requests/roleRequestApi';
import { StatusBadge } from '../components/ui';
import api from '../api/axiosInstance';

function Profile() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    organization: '',
    photo: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [myMissions, setMyMissions] = useState({ led: [], joined: [], completed: [], stats: { actionItemsDone: 0, missionsParticipated: 0 } });
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [quizAttemptsLoading, setQuizAttemptsLoading] = useState(false);
  const [roleRequests, setRoleRequests] = useState([]);
  const [roleRequestsLoading, setRoleRequestsLoading] = useState(false);
  const [roleProfile, setRoleProfile] = useState(null);
  const [roleProfileLoading, setRoleProfileLoading] = useState(false);
  const [roleProfileForm, setRoleProfileForm] = useState({});
  const [roleProfileError, setRoleProfileError] = useState('');
  const [roleProfileSuccess, setRoleProfileSuccess] = useState('');
  const [roleProfileMessage, setRoleProfileMessage] = useState('');
  const [roleProfileUpdating, setRoleProfileUpdating] = useState(false);

  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadProfile();
    loadMyMissions();
    loadQuizAttempts();
    loadRoleRequests();
    loadRoleProfile();
  }, [isAuthenticated]);

  const loadMyMissions = async () => {
    try {
      setMissionsLoading(true);
      const result = await getMyMissions();
      setMyMissions(result.data || { led: [], joined: [], completed: [], stats: { actionItemsDone: 0, missionsParticipated: 0 } });
    } catch (err) {
      console.error('Failed to load my missions', err);
    } finally {
      setMissionsLoading(false);
    }
  };

  const loadQuizAttempts = async () => {
    try {
      setQuizAttemptsLoading(true);
      const result = await getQuizAttempts();
      setQuizAttempts(result.data || []);
    } catch (err) {
      console.error('Failed to load quiz attempts', err);
    } finally {
      setQuizAttemptsLoading(false);
    }
  };

  const loadRoleRequests = async () => {
    try {
      setRoleRequestsLoading(true);
      const result = await getMyRoleRequests();
      setRoleRequests(result.data || []);
    } catch (err) {
      console.error('Failed to load role requests', err);
    } finally {
      setRoleRequestsLoading(false);
    }
  };

  const loadRoleProfile = async () => {
    try {
      setRoleProfileLoading(true);
      const result = await api.get('/role-requests/role-profiles/me');
      const profile = result.data?.data || null;
      setRoleProfile(profile);
      if (profile?.fields) {
        setRoleProfileForm(profile.fields);
      }
    } catch (err) {
      setRoleProfile(null);
    } finally {
      setRoleProfileLoading(false);
    }
  };

  const handleUpdateRoleProfile = async (e) => {
    e.preventDefault();
    setRoleProfileMessage('');
    setRoleProfileUpdating(true);

    try {
      await updateMyRoleProfile(roleProfileForm);
      setRoleProfileMessage('Role profile updated successfully');
      await loadRoleProfile();
    } catch (err) {
      setRoleProfileMessage(err.response?.data?.message || 'Failed to update role profile');
    } finally {
      setRoleProfileUpdating(false);
    }
  };

  const handleRoleProfileSubmit = async (e) => {
    e.preventDefault();
    setRoleProfileError('');
    setRoleProfileSuccess('');
    setLoading(true);

    try {
      const approvedRequest = roleRequests.find((r) => r.status === 'approved');
      if (!approvedRequest) {
        throw new Error('No approved role request found');
      }

      const result = await submitRoleProfile({
        role: approvedRequest.requestedRole,
        fields: roleProfileForm,
      });

      const updatedUser = result.data;
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (updatedUser && accessToken) {
        dispatch(setCredentials({
          user: updatedUser,
          accessToken,
          refreshToken,
        }));
      }

      setRoleProfileSuccess('Role profile completed successfully! Your permissions have been activated.');
      setRoleProfileForm({});
      await loadRoleProfile();
      await loadProfile();
      await loadRoleRequests();
    } catch (err) {
      setRoleProfileError(err.response?.data?.message || 'Failed to submit role profile');
    } finally {
      setLoading(false);
    }
  };

  const renderRoleProfileForm = () => {
    const approvedRequest = roleRequests.find((r) => r.status === 'approved');
    if (!approvedRequest || roleProfile) return null;

    const role = approvedRequest.requestedRole;

    return (
      <div className="mb-8 p-6 bg-canopy-sand-50 rounded-xl border-2 border-canopy-forest-600/20">
        <h3 className="text-xl font-display font-semibold text-canopy-forest-950 mb-2">
          Complete Your {role.replace('_', ' ').toUpperCase()} Profile
        </h3>
        <p className="text-sm text-canopy-ink-900/70 mb-6">
          Provide your role-specific details to activate your new permissions.
        </p>

        {roleProfileError && (
          <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
            {roleProfileError}
          </div>
        )}
        {roleProfileSuccess && (
          <div className="mb-4 p-4 rounded-2xl bg-canopy-moss-300/10 border border-canopy-moss-300/30 text-canopy-forest-600">
            {roleProfileSuccess}
          </div>
        )}

        <form onSubmit={handleRoleProfileSubmit} className="space-y-4">
          {role === 'researcher_ngo' && (
            <>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={roleProfileForm.fullName || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, fullName: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Organization Name</label>
                <input
                  type="text"
                  name="orgName"
                  value={roleProfileForm.orgName || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, orgName: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Organization Type</label>
                <input
                  type="text"
                  name="orgType"
                  value={roleProfileForm.orgType || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, orgType: e.target.value })}
                  className="input-field"
                  placeholder="e.g., NGO, Research Institute"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Position / Title</label>
                <input
                  type="text"
                  name="position"
                  value={roleProfileForm.position || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, position: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Organization Website (optional)</label>
                <input
                  type="url"
                  name="orgWebsite"
                  value={roleProfileForm.orgWebsite || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, orgWebsite: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={roleProfileForm.phone || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, phone: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Qualifications</label>
                <input
                  type="text"
                  name="qualifications"
                  value={roleProfileForm.qualifications || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, qualifications: e.target.value })}
                  className="input-field"
                  placeholder="e.g., PhD in Wildlife Biology"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Specializations</label>
                <input
                  type="text"
                  name="specializations"
                  value={roleProfileForm.specializations || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, specializations: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Ornithology, Conservation Genetics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Bio (optional)</label>
                <textarea
                  name="bio"
                  value={roleProfileForm.bio || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, bio: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Brief description of your work..."
                />
              </div>
            </>
          )}

          {role === 'ranger' && (
            <>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={roleProfileForm.fullName || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, fullName: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Department / Forest Division</label>
                <input
                  type="text"
                  name="department"
                  value={roleProfileForm.department || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, department: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={roleProfileForm.designation || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, designation: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Badge / Employee ID</label>
                <input
                  type="text"
                  name="badgeId"
                  value={roleProfileForm.badgeId || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, badgeId: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Contact Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={roleProfileForm.phone || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, phone: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Qualifications</label>
                <input
                  type="text"
                  name="qualifications"
                  value={roleProfileForm.qualifications || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, qualifications: e.target.value })}
                  className="input-field"
                  placeholder="e.g., BSc Forestry, Ranger Certification"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Experience (years)</label>
                <input
                  type="number"
                  name="experience"
                  value={roleProfileForm.experience || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, experience: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 5"
                />
              </div>
            </>
          )}

          {role === 'rescue_center_staff' && (
            <>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={roleProfileForm.fullName || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, fullName: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Center Name</label>
                <input
                  type="text"
                  name="centerName"
                  value={roleProfileForm.centerName || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, centerName: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Center Address</label>
                <input
                  type="text"
                  name="centerAddress"
                  value={roleProfileForm.centerAddress || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, centerAddress: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Your Role at Center</label>
                <input
                  type="text"
                  name="centerRole"
                  value={roleProfileForm.centerRole || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, centerRole: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Veterinarian, Caretaker"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Contact Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={roleProfileForm.phone || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, phone: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Qualifications</label>
                <input
                  type="text"
                  name="qualifications"
                  value={roleProfileForm.qualifications || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, qualifications: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Veterinary Science, Animal Care"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Certifications (optional)</label>
                <input
                  type="text"
                  name="certifications"
                  value={roleProfileForm.certifications || ''}
                  onChange={(e) => setRoleProfileForm({ ...roleProfileForm, certifications: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Wildlife Rehabilitation Certificate"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Submitting...' : 'Complete Profile & Activate Permissions'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const loadProfile = async () => {
    try {
      const result = await getProfile();
      const profile = result.data;
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        organization: profile.organization || '',
        photo: profile.photo || '',
      });
      setRoleProfile(profile.roleProfile || null);
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordError('');
    setPasswordMessage('');
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setUploadingPhoto(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload/species', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const photoUrl = response.data.data.url;
      setFormData((prev) => ({ ...prev, photo: photoUrl }));
      await updateProfile({ photo: photoUrl });
      setMessage('Profile photo updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await updateProfile(formData);
      setMessage('Profile updated successfully');
      await loadProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      await changePasswordApi(passwordData.currentPassword, passwordData.newPassword);
      setPasswordMessage('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const elevatedRoles = ['ranger', 'researcher', 'rescue'];

  const renderRoleSpecificFields = () => {
    if (!user?.role || !elevatedRoles.includes(user.role)) return null;

    const handleRoleFieldChange = (name, value) => {
      setRoleProfileForm((prev) => ({ ...prev, [name]: value }));
    };

    return (
      <div className="mt-6 p-6 bg-canopy-forest-50/50 rounded-xl border border-canopy-forest-600/10">
        <h3 className="text-lg font-display font-semibold text-canopy-forest-950 mb-4">
          {user.role === 'ranger' && 'Ranger Details'}
          {user.role === 'researcher' && 'Researcher / NGO Details'}
          {user.role === 'rescue' && 'Rescue Center Details'}
        </h3>

        {roleProfileMessage && (
          <div className={`mb-4 p-3 rounded-xl ${roleProfileMessage.includes('success') ? 'bg-canopy-moss-300/10 border border-canopy-moss-300/30 text-canopy-forest-600' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {roleProfileMessage}
          </div>
        )}

        {user.role === 'researcher' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={roleProfileForm.fullName || ''}
                onChange={(e) => handleRoleFieldChange('fullName', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Organization Name</label>
              <input
                type="text"
                name="orgName"
                value={roleProfileForm.orgName || ''}
                onChange={(e) => handleRoleFieldChange('orgName', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Organization Type</label>
              <input
                type="text"
                name="orgType"
                value={roleProfileForm.orgType || ''}
                onChange={(e) => handleRoleFieldChange('orgType', e.target.value)}
                className="input-field"
                placeholder="e.g., NGO, Research Institute"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Position / Title</label>
              <input
                type="text"
                name="position"
                value={roleProfileForm.position || ''}
                onChange={(e) => handleRoleFieldChange('position', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Organization Website (optional)</label>
              <input
                type="url"
                name="orgWebsite"
                value={roleProfileForm.orgWebsite || ''}
                onChange={(e) => handleRoleFieldChange('orgWebsite', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={roleProfileForm.phone || ''}
                onChange={(e) => handleRoleFieldChange('phone', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Qualifications</label>
              <input
                type="text"
                name="qualifications"
                value={roleProfileForm.qualifications || ''}
                onChange={(e) => handleRoleFieldChange('qualifications', e.target.value)}
                className="input-field"
                placeholder="e.g., PhD in Wildlife Biology"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Specializations</label>
              <input
                type="text"
                name="specializations"
                value={roleProfileForm.specializations || ''}
                onChange={(e) => handleRoleFieldChange('specializations', e.target.value)}
                className="input-field"
                placeholder="e.g., Ornithology, Conservation Genetics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Bio (optional)</label>
              <textarea
                name="bio"
                value={roleProfileForm.bio || ''}
                onChange={(e) => handleRoleFieldChange('bio', e.target.value)}
                className="input-field"
                rows={3}
                placeholder="Brief description of your work..."
              />
            </div>
          </div>
        )}

        {user.role === 'ranger' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={roleProfileForm.fullName || ''}
                onChange={(e) => handleRoleFieldChange('fullName', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Department / Forest Division</label>
              <input
                type="text"
                name="department"
                value={roleProfileForm.department || ''}
                onChange={(e) => handleRoleFieldChange('department', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Designation</label>
              <input
                type="text"
                name="designation"
                value={roleProfileForm.designation || ''}
                onChange={(e) => handleRoleFieldChange('designation', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Badge / Employee ID</label>
              <input
                type="text"
                name="badgeId"
                value={roleProfileForm.badgeId || ''}
                onChange={(e) => handleRoleFieldChange('badgeId', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Contact Phone</label>
              <input
                type="tel"
                name="phone"
                value={roleProfileForm.phone || ''}
                onChange={(e) => handleRoleFieldChange('phone', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Qualifications</label>
              <input
                type="text"
                name="qualifications"
                value={roleProfileForm.qualifications || ''}
                onChange={(e) => handleRoleFieldChange('qualifications', e.target.value)}
                className="input-field"
                placeholder="e.g., BSc Forestry, Ranger Certification"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Experience (years)</label>
              <input
                type="number"
                name="experience"
                value={roleProfileForm.experience || ''}
                onChange={(e) => handleRoleFieldChange('experience', e.target.value)}
                className="input-field"
                placeholder="e.g., 5"
              />
            </div>
          </div>
        )}

        {user.role === 'rescue' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={roleProfileForm.fullName || ''}
                onChange={(e) => handleRoleFieldChange('fullName', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Center Name</label>
              <input
                type="text"
                name="centerName"
                value={roleProfileForm.centerName || ''}
                onChange={(e) => handleRoleFieldChange('centerName', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Center Address</label>
              <input
                type="text"
                name="centerAddress"
                value={roleProfileForm.centerAddress || ''}
                onChange={(e) => handleRoleFieldChange('centerAddress', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Your Role at Center</label>
              <input
                type="text"
                name="centerRole"
                value={roleProfileForm.centerRole || ''}
                onChange={(e) => handleRoleFieldChange('centerRole', e.target.value)}
                className="input-field"
                placeholder="e.g., Veterinarian, Caretaker"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Contact Phone</label>
              <input
                type="tel"
                name="phone"
                value={roleProfileForm.phone || ''}
                onChange={(e) => handleRoleFieldChange('phone', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Qualifications</label>
              <input
                type="text"
                name="qualifications"
                value={roleProfileForm.qualifications || ''}
                onChange={(e) => handleRoleFieldChange('qualifications', e.target.value)}
                className="input-field"
                placeholder="e.g., Veterinary Science, Animal Care"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Certifications (optional)</label>
              <input
                type="text"
                name="certifications"
                value={roleProfileForm.certifications || ''}
                onChange={(e) => handleRoleFieldChange('certifications', e.target.value)}
                className="input-field"
                placeholder="e.g., Wildlife Rehabilitation Certificate"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={handleUpdateRoleProfile} disabled={roleProfileUpdating} className="btn-primary">
            {roleProfileUpdating ? 'Saving...' : 'Save Role Profile'}
          </button>
        </div>
      </div>
    );
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  const initials = `${(user.firstName?.[0] || '').toUpperCase()}${(user.lastName?.[0] || '').toUpperCase()}`;

  return (
    <div className="min-h-screen py-8 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-6 lg:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-semibold text-canopy-forest-950">My Profile</h1>
              <p className="text-canopy-ink-900/70 mt-1">Manage your account settings and information.</p>
            </div>
            <button onClick={handleLogout} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50">
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-canopy-moss-300/10 border border-canopy-moss-300/30 text-canopy-forest-600"
          >
            {message}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-display font-semibold text-canopy-forest-950 mb-4">Basic Information</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt={fullName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-canopy-mist-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-canopy-forest-600 flex items-center justify-center text-white text-2xl font-display font-semibold">
                      {initials}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handlePhotoClick}
                    disabled={uploadingPhoto}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-canopy-moss-300 text-white rounded-full hover:bg-canopy-moss-400 transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="font-display text-xl font-semibold text-canopy-forest-950">{fullName}</p>
                  <p className="text-sm text-canopy-ink-900/70">{user.email}</p>
                  <div className="mt-1">
                    <StatusBadge status={user.role} />
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-canopy-ink-900 mb-2">First Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="input-field pl-12"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Last Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="input-field pl-12"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="input-field pl-12 bg-canopy-sand-100 opacity-70"
                    />
                  </div>
                  <p className="text-xs text-canopy-ink-900/50 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field pl-12"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Organization</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      className="input-field pl-12"
                      placeholder="Your organization"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    <Save className="w-5 h-5 mr-2" />
                    {loading ? 'Saving...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-display font-semibold text-canopy-forest-950 mb-4">Role Requests</h2>
              {roleRequests.length === 0 ? (
                <p className="text-sm text-canopy-ink-900/60">No role requests yet.</p>
              ) : (
                <div className="space-y-3">
                  {roleRequests.map((request) => (
                    <div key={request._id} className="p-4 bg-canopy-sand-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-canopy-forest-950">
                            {request.requestedRole.replace('_', ' ').toUpperCase()}
                          </p>
                          <p className="text-xs text-canopy-ink-900/50">
                            Submitted {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          request.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                          request.status === 'approved' ? 'bg-green-50 text-green-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      {request.status === 'approved' && !roleProfile && (
                        <p className="text-xs text-canopy-forest-600 mt-2">
                          Please complete your role profile below to activate your permissions.
                        </p>
                      )}
                      {request.status === 'rejected' && request.rejectionReason && (
                        <p className="text-xs text-red-600 mt-2">Reason: {request.rejectionReason}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!roleProfile && roleRequests.some((r) => r.status === 'approved') && (
              <div className="card p-6 border-2 border-canopy-forest-600/20">
                <h2 className="text-xl font-display font-semibold text-canopy-forest-950 mb-2">Complete Your Role Profile</h2>
                <p className="text-sm text-canopy-ink-900/70 mb-4">Provide your role-specific details to activate your new permissions.</p>
                {renderRoleProfileForm()}
              </div>
            )}

            {renderRoleSpecificFields()}

            <div className="card p-6">
              <h2 className="text-xl font-display font-semibold text-canopy-forest-950 mb-4">Change Password</h2>

              {passwordMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 rounded-2xl bg-canopy-moss-300/10 border border-canopy-moss-300/30 text-canopy-forest-600"
                >
                  {passwordMessage}
                </motion.div>
              )}
              {passwordError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700"
                >
                  {passwordError}
                </motion.div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="input-field"
                    placeholder="Enter your current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-canopy-ink-900 mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="input-field"
                    placeholder="At least 8 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="input-field"
                    placeholder="Re-enter new password"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={passwordLoading} className="btn-primary">
                    <Lock className="w-5 h-5 mr-2" />
                    {passwordLoading ? 'Updating...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="card p-6">
            <h2 className="text-xl font-display font-semibold text-canopy-forest-950 mb-4">My Missions</h2>

            {missionsLoading ? (
              <p className="text-canopy-ink-900/60">Loading missions...</p>
            ) : (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-canopy-sand-50 rounded-xl">
                  <p className="text-2xl font-display font-semibold text-canopy-forest-950">{myMissions.led?.length || 0}</p>
                  <p className="text-sm text-canopy-ink-900/70">Leading</p>
                </div>
                <div className="p-4 bg-canopy-sand-50 rounded-xl">
                  <p className="text-2xl font-display font-semibold text-canopy-forest-950">{myMissions.joined?.length || 0}</p>
                  <p className="text-sm text-canopy-ink-900/70">Joined</p>
                </div>
                <div className="p-4 bg-canopy-sand-50 rounded-xl">
                  <p className="text-2xl font-display font-semibold text-canopy-forest-950">{myMissions.completed?.length || 0}</p>
                  <p className="text-sm text-canopy-ink-900/70">Completed</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {(myMissions.led || []).length === 0 && (myMissions.joined || []).length === 0 && (myMissions.completed || []).length === 0 ? (
                <p className="text-canopy-ink-900/60 text-center py-4">You haven't joined any missions yet.</p>
              ) : (
                <>
                  {(myMissions.led || []).map((mission) => (
                    <div key={mission._id} className="flex items-center justify-between p-4 bg-canopy-sand-50 rounded-xl">
                      <div>
                        <p className="font-medium text-canopy-forest-950">{mission.title}</p>
                        <p className="text-xs text-canopy-ink-900/50">Leading</p>
                      </div>
                      <button onClick={() => navigate(`/missions/${mission._id}`)} className="text-sm text-canopy-forest-600 hover:underline">
                        View
                      </button>
                    </div>
                  ))}
                  {(myMissions.joined || []).map((mission) => (
                    <div key={mission._id} className="flex items-center justify-between p-4 bg-canopy-sand-50 rounded-xl">
                      <div>
                        <p className="font-medium text-canopy-forest-950">{mission.title}</p>
                        <p className="text-xs text-canopy-ink-900/50">Member</p>
                      </div>
                      <button onClick={() => navigate(`/missions/${mission._id}`)} className="text-sm text-canopy-forest-600 hover:underline">
                        View
                      </button>
                    </div>
                  ))}
                  {(myMissions.completed || []).map((mission) => (
                    <div key={mission._id} className="flex items-center justify-between p-4 bg-canopy-sand-50 rounded-xl">
                      <div>
                        <p className="font-medium text-canopy-forest-950">{mission.title}</p>
                        <p className="text-xs text-canopy-ink-900/50">Completed</p>
                      </div>
                      <button onClick={() => navigate(`/missions/${mission._id}`)} className="text-sm text-canopy-forest-600 hover:underline">
                        View
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-display font-semibold text-canopy-forest-950 mb-4">My Learning</h2>

            {quizAttemptsLoading ? (
              <p className="text-canopy-ink-900/60">Loading quiz attempts...</p>
            ) : quizAttempts.length === 0 ? (
              <p className="text-canopy-ink-900/60 text-center py-4">You haven't taken any quizzes yet.</p>
            ) : (
              <div className="space-y-3">
                {quizAttempts.map((attempt) => (
                  <div key={attempt._id} className="flex items-center justify-between p-4 bg-canopy-sand-50 rounded-xl">
                    <div>
                      <p className="font-medium text-canopy-forest-950">
                        {attempt.quiz?.article?.title || 'Unknown Article'}
                      </p>
                      <p className="text-xs text-canopy-ink-900/50">
                        Score: {attempt.score}/{attempt.totalQuestions} ({attempt.scorePercent}%)
                        {attempt.passed !== null && (
                          <span className={`ml-2 ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {attempt.passed ? 'Passed' : 'Not passed'}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-canopy-ink-900/50">
                        {new Date(attempt.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/articles/${attempt.quiz?.article?.slug}`)}
                      className="text-sm text-canopy-forest-600 hover:underline"
                    >
                      View Article
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
