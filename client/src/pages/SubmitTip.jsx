import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, User, Phone } from 'lucide-react';
import { submitTip } from '../features/sightings/tipApi';
import { PageHeader } from '../components/ui';

function SubmitTip() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lat: '',
    lng: '',
    submitterEmail: '',
    submitterPhone: '',
    isAnonymous: true,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await submitTip(formData);
      setMessage('Tip submitted successfully. Thank you for helping protect wildlife.');
      setFormData({ title: '', description: '', lat: '', lng: '', submitterEmail: '', submitterPhone: '', isAnonymous: true });
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Report a Poaching Tip"
            subtitle="Your report is anonymous by default. Provide contact info only if you wish to be reached."
          />

          <div className="flex items-center gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= s ? 'bg-white text-canopy-forest-800' : 'bg-white/20 text-white/60'
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`flex-grow h-0.5 ${step > s ? 'bg-white' : 'bg-white/20'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <form onSubmit={handleSubmit} className="card p-8 lg:p-10">
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

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                required
                placeholder="Brief summary of the incident"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                rows="5"
                required
                placeholder="Please provide as much detail as possible..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Latitude (optional)</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                  <input
                    type="number"
                    step="any"
                    name="lat"
                    value={formData.lat}
                    onChange={handleChange}
                    className="input-field pl-12"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Longitude (optional)</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                  <input
                    type="number"
                    step="any"
                    name="lng"
                    value={formData.lng}
                    onChange={handleChange}
                    className="input-field pl-12"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-canopy-sand-100 border border-canopy-mist-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-canopy-mist-200 text-canopy-forest-600 focus:ring-canopy-forest-400"
                />
                <div>
                  <p className="font-medium text-canopy-ink-900">Submit anonymously</p>
                  <p className="text-sm text-canopy-ink-900/70">Your identity will not be recorded or shared.</p>
                </div>
              </label>
            </div>

            {!formData.isAnonymous && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Your Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                    <input
                      type="email"
                      name="submitterEmail"
                      value={formData.submitterEmail}
                      onChange={handleChange}
                      className="input-field pl-12"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Your Phone (optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                    <input
                      type="tel"
                      name="submitterPhone"
                      value={formData.submitterPhone}
                      onChange={handleChange}
                      className="input-field pl-12"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <button type="submit" disabled={loading} className="btn-clay w-full py-4 text-base">
              {loading ? 'Submitting...' : 'Submit Tip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubmitTip;
