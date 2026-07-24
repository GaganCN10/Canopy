import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { forgotPassword } from './authApi';
import Button from '../../components/Button';
import { useToast } from '../../components/Toast';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);

  const { showSuccess } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorInfo(null);
    setLoading(true);

    try {
      await forgotPassword(email);
      setSent(true);
      showSuccess('Email Sent', 'If an account exists with this email, a password reset link has been sent.');
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      setErrorInfo({
        title: 'Request Failed',
        message,
        remedy: 'Double-check the email address and try again.',
      });
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
            Reset your<br />password.
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Enter your email and we'll send you a link to reset your password.
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
            <h1 className="font-display text-3xl font-semibold text-canopy-forest-950">Reset password</h1>
            <p className="text-canopy-ink-900/70 mt-2">We'll send you a reset link</p>
          </div>

          <div className="hidden lg:block mb-8">
            <h1 className="font-display text-3xl font-semibold text-canopy-forest-950 mb-2">Reset password</h1>
            <p className="text-canopy-ink-900/70">We'll send you a reset link</p>
          </div>

          {errorInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200"
            >
              <p className="text-sm font-semibold text-red-800">{errorInfo.title}</p>
              <p className="text-sm text-red-700 mt-1">{errorInfo.message}</p>
              <p className="text-xs text-red-600/80 mt-2 bg-red-100/50 rounded-lg px-2 py-1.5">
                <span className="font-medium">Remedy:</span> {errorInfo.remedy}
              </p>
            </motion.div>
          )}

          {sent ? (
            <div className="p-6 rounded-2xl bg-green-50 border border-green-200">
              <p className="text-sm font-semibold text-green-800 mb-2">Check your email</p>
              <p className="text-sm text-green-700">
                If an account exists with this email, a password reset link has been sent.
              </p>
              <Link
                to="/login"
                className="inline-block mt-4 text-sm font-medium text-canopy-forest-600 hover:text-canopy-forest-800"
              >
                Back to login
              </Link>
            </div>
          ) : (
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

              <button type="submit" disabled={loading} className="btn-primary w-full py-4">
                {loading ? 'Sending link...' : 'Send reset link'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-canopy-ink-900/70">
            Remember your password?{' '}
            <Link to="/login" className="text-canopy-forest-600 font-medium hover:text-canopy-forest-800 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default ForgotPassword;
