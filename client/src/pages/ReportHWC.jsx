import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, FileText, Users } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createHWCIncident } from '../features/map/hwcApi';
import Button from '../components/Button';
import { PageHeader } from '../components/ui';

const INCIDENT_TYPES = [
  { value: 'crop_raiding', label: 'Crop Raiding', color: 'bg-amber-100 text-amber-700' },
  { value: 'livestock_predation', label: 'Livestock Predation', color: 'bg-red-100 text-red-700' },
  { value: 'property_damage', label: 'Property Damage', color: 'bg-orange-100 text-orange-700' },
  { value: 'injury', label: 'Injury', color: 'bg-red-100 text-red-700' },
  { value: 'fatal', label: 'Fatal', color: 'bg-red-100 text-red-700' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-700' },
];

function ReportHWC() {
  const [formData, setFormData] = useState({
    type: 'crop_raiding',
    description: '',
    lat: '',
    lng: '',
    lossDescription: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await createHWCIncident(formData);
      setMessage('Incident reported successfully. Help is on the way.');
      setFormData({ type: 'crop_raiding', description: '', lat: '', lng: '', lossDescription: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-red-900 to-canopy-clay-500 pt-16 lg:pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Report Human-Wildlife Conflict"
            subtitle="Report an incident to alert rangers and conservation teams."
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <AlertTriangle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Emergency contact</p>
              <p className="text-white/80 text-sm">If this is a life-threatening emergency, contact local authorities immediately.</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <form onSubmit={handleSubmit} className="card p-8 lg:p-10">
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700"
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
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Incident Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {INCIDENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                      formData.type === type.value
                        ? 'bg-canopy-forest-600 text-white shadow-ambient'
                        : 'bg-canopy-sand-100 text-canopy-ink-900/70 hover:bg-canopy-sand-100/80'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                rows="4"
                required
                placeholder="Describe what happened..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Latitude</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                  <input
                    type="number"
                    step="any"
                    name="lat"
                    value={formData.lat}
                    onChange={handleChange}
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Longitude</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                  <input
                    type="number"
                    step="any"
                    name="lng"
                    value={formData.lng}
                    onChange={handleChange}
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Loss Description</label>
              <textarea
                name="lossDescription"
                value={formData.lossDescription}
                onChange={handleChange}
                className="input-field"
                rows="3"
                placeholder="Describe any damage or loss..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-clay flex-1">
                {loading ? 'Submitting...' : 'Report Incident'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportHWC;
