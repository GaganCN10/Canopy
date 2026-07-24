import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Lock, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from './authApi';
import Button from '../../components/Button';
import { useToast } from '../../components/Toast';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  useEffect(() => {
    if (!token) {
      setErrorInfo({
        title: 'Invalid Link',
        message: 'The password reset link is invalid or has expired.',
        remedy: 'Please request a new password reset link.',
      });
    }
  }, [token]);

  const validatePassword = () => {
    if (!hasMinLength) {
      showError('Weak Password', 'Password must be at least 8 characters long.', 'Add more characters to meet the minimum length.');
      return false;
    }
    if (!hasUppercase) {
      showError('Weak Password', 'Password must contain at least one uppercase letter.', 'Add an uppercase letter like A, B, C.');
      return false;
    }
    if (!hasLowercase) {
      showError('Weak Password', 'Password must contain at least one lowercase letter.', 'Add a lowercase letter like a, b, c.');
      return false;
    }
    if (!hasNumber) {
      showError('Weak Password', 'Password must contain at least one number.', 'Add a number like 1, 2, 3.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorInfo(null);

    if (password !== confirmPassword) {
      setErrorInfo({
        title: 'Password Mismatch',
        message: 'Passwords do not match.',
        remedy: 'Please re-enter both passwords to confirm they are identical.',
      });
      showError('Password Mismatch', 'Passwords do not match.', 'Please re-enter both passwords to confirm they are identical.');
      return;
    }

    if (!validatePassword()) {
      return;
    }

    if (!token) {
      setErrorInfo({
        title: 'Invalid Link',
        message: 'The password reset link is invalid or has expired.',
        remedy: 'Please request a new password reset link.',
      });
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);
      showSuccess('Password Reset', 'Your password has been reset successfully. You can now log in.');
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      setErrorInfo({
        title: 'Reset Failed',
        message,
        remedy: 'The link may have expired. Please request a new one.',
      });
      showError('Reset Failed', message, 'The link may have expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !errorInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Leaf className="w-12 h-12 text-canopy-forest-600 mx-auto mb-4 animate-pulse" />
          <p className="text-canopy-ink-900/70">Loading...</p>
        </div>
      </div>
    );
  }

  const PasswordRequirement = ({ met, text }) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <CheckCircle2 className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-red-400" />
      )}
      <span className={met ? 'text-green-700' : 'text-red-600'}>{text}</span>
    </div>
  );

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
            Set a new<br />password.
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Choose a strong password to secure your account.
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
            <p className="text-canopy-ink-900/70 mt-2">Set a new password for your account</p>
          </div>

          <div className="hidden lg:block mb-8">
            <h1 className="font-display text-3xl font-semibold text-canopy-forest-950 mb-2">Reset password</h1>
            <p className="text-canopy-ink-900/70">Set a new password for your account</p>
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

          {success ? (
            <div className="p-6 rounded-2xl bg-green-50 border border-green-200">
              <p className="text-sm font-semibold text-green-800 mb-2">Password updated</p>
              <p className="text-sm text-green-700 mb-4">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <Link
                to="/login"
                className="inline-block text-sm font-medium text-canopy-forest-600 hover:text-canopy-forest-800"
              >
                Go to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">New password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-12"
                    required
                    minLength={8}
                  />
                </div>
                <div className="mt-3 space-y-2">
                  <PasswordRequirement met={hasMinLength} text="At least 8 characters" />
                  <PasswordRequirement met={hasUppercase} text="At least one uppercase letter" />
                  <PasswordRequirement met={hasLowercase} text="At least one lowercase letter" />
                  <PasswordRequirement met={hasNumber} text="At least one number" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Confirm new password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-12"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-4">
                {loading ? 'Resetting...' : 'Reset password'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default ResetPassword;
