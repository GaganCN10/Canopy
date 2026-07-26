import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, LogOut, Save, Camera, Lock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../features/admin/userApi';
import { logout } from '../features/auth/authSlice';
import { changePassword as changePasswordApi } from '../features/auth/authApi';
import { getMyMissions } from '../features/missions/missionApi';
import { getQuizAttempts } from '../features/articles/articleApi';
import { getMyRoleRequests } from '../features/role-requests/roleRequestApi';
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

  if (!user) {
    return <div>Loading...</div>;
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  const initials = `${(user.firstName?.[0] || '').toUpperCase()}${(user.lastName?.[0] || '').toUpperCase()}`;

  return (
    <div className="min-h-screen py-16 lg:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8 lg:p-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-semibold text-canopy-forest-950">My Profile</h1>
              <p className="text-canopy-ink-900/70 mt-1">Manage your account settings and information.</p>
            </div>
            <button onClick={handleLogout} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50">
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
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

          {user?.role === 'public' || user?.role === 'citizen' ? (
            <div className="mb-6 p-4 bg-canopy-sand-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-canopy-forest-950 mb-1">Need elevated access?</h3>
                  <p className="text-sm text-canopy-ink-900/70">Request a role as Researcher, Ranger, or Rescue Center Staff.</p>
                </div>
                <button onClick={() => navigate('/roles/request')} className="btn-primary whitespace-nowrap">
                  Request a Role
                </button>
              </div>
            </div>
          ) : null}

          {roleRequests.length > 0 && (
            <div className="mb-6 space-y-3">
              <h3 className="font-medium text-canopy-forest-950">Your Role Requests</h3>
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
                  {request.status === 'approved' && (
                    <button
                      onClick={() => navigate(`/roles/profile?role=${request.requestedRole}`)}
                      className="mt-3 text-sm text-canopy-forest-600 hover:underline"
                    >
                      Complete your role profile
                    </button>
                  )}
                  {request.status === 'rejected' && request.rejectionReason && (
                    <p className="text-xs text-red-600 mt-2">Reason: {request.rejectionReason}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                <Save className="w-5 h-5 mr-2" />
                {loading ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </form>

          <hr className="my-10 border-canopy-mist-200" />

          <div>
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5 text-canopy-forest-600" />
              <h2 className="text-xl font-display font-semibold text-canopy-forest-950">Change Password</h2>
            </div>

            {passwordMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-2xl bg-canopy-moss-300/10 border border-canopy-moss-300/30 text-canopy-forest-600"
              >
                {passwordMessage}
              </motion.div>
            )}
            {passwordError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700"
              >
                {passwordError}
              </motion.div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-6">
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

          <hr className="my-10 border-canopy-mist-200" />

          <div>
            <h2 className="text-xl font-display font-semibold text-canopy-forest-950 mb-4">My Missions</h2>

            {missionsLoading ? (
              <p className="text-canopy-ink-900/60">Loading missions...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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

          <hr className="my-10 border-canopy-mist-200" />

          <div>
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
