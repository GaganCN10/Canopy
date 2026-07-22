import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from './authSlice';
import { login } from './authApi';
import Button from '../../components/Button';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      dispatch(setCredentials(result.data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
            backgroundImage: `url(https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-canopy-forest-950/80 to-canopy-forest-600/60" />
        </div>
        <div className="relative z-10 flex flex-col justify-end h-full p-12 text-white">
          <Leaf className="w-12 h-12 mb-6" />
          <h1 className="font-display text-4xl font-semibold mb-4 leading-tight">
            Welcome back to<br />the field.
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Access your sightings, reports, and conservation intelligence dashboard.
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
            <h1 className="font-display text-3xl font-semibold text-canopy-forest-950">Welcome back</h1>
            <p className="text-canopy-ink-900/70 mt-2">Sign in to continue to Canopy</p>
          </div>

          <div className="hidden lg:block mb-8">
            <h1 className="font-display text-3xl font-semibold text-canopy-forest-950 mb-2">Welcome back</h1>
            <p className="text-canopy-ink-900/70">Sign in to continue to Canopy</p>
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
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4">
              {loading ? 'Signing in...' : 'Sign in'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-canopy-ink-900/70">
            Don't have an account?{' '}
            <Link to="/register" className="text-canopy-forest-600 font-medium hover:text-canopy-forest-800 transition-colors">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
