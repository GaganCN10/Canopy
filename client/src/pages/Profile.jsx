import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, LogOut, Save } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../features/admin/userApi';
import { logout } from '../features/auth/authSlice';
import { StatusBadge } from '../components/ui';

function Profile() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    organization: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [isAuthenticated]);

  const loadProfile = async () => {
    try {
      const result = await getProfile();
      const profile = result.data;
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        organization: profile.organization || '',
      });
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-canopy-forest-600 flex items-center justify-center text-white text-2xl font-display font-semibold">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-canopy-forest-950">
                  {user.firstName} {user.lastName}
                </p>
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
        </div>
      </div>
    </div>
  );
}

export default Profile;
