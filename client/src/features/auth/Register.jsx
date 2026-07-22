import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from './authSlice';
import { register } from './authApi';
import Button from '../../components/Button';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    organization: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      const result = await register(userData);
      dispatch(setCredentials(result.data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1200&q=80)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-canopy-forest-950/80 to-canopy-forest-600/60" />
        </div>
        <div className="relative z-10 flex flex-col justify-end h-full p-12 text-white">
          <Leaf className="w-12 h-12 mb-6" />
          <h1 className="font-display text-4xl font-semibold mb-4 leading-tight">
            Join the<br />conservation effort.
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Create an account to start reporting sightings, submitting tips, and tracking wildlife.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-10">
            <Leaf className="w-10 h-10 text-canopy-forest-600 mx-auto mb-4" />
            <h1 className="font-display text-3xl font-semibold text-canopy-forest-950">Create account</h1>
            <p className="text-canopy-ink-900/70 mt-2">Join the Canopy conservation network</p>
          </div>

          <div className="hidden lg:block mb-8">
            <h1 className="font-display text-3xl font-semibold text-canopy-forest-950 mb-2">Create account</h1>
            <p className="text-canopy-ink-900/70">Join the Canopy conservation network</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">First name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Last name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-field pl-12"
                    required
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-12"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Organization (optional)</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="input-field pl-12"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4">
              {loading ? 'Creating account...' : 'Create account'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-canopy-ink-900/70">
            Already have an account?{' '}
            <Link to="/login" className="text-canopy-forest-600 font-medium hover:text-canopy-forest-800 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;
