import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Heart, MapPin, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getSpecies } from '../features/sightings/speciesApi';
import { createRescueCase } from '../features/sightings/rescueApi';
import Button from '../components/Button';
import { PageHeader } from '../components/ui';

function CreateRescueCase() {
  const [formData, setFormData] = useState({
    species: '',
    rescueReason: '',
    center: '',
    animalDetails: { age: '', sex: '', weight: '', condition: '' },
    lat: '',
    lng: '',
  });
  const [speciesList, setSpeciesList] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadSpecies();
  }, [isAuthenticated]);

  const loadSpecies = async () => {
    try {
      const result = await getSpecies({ limit: 100 });
      setSpeciesList(result.data.species);
    } catch (err) {
      setError('Failed to load species');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('animalDetails.')) {
      const field = name.split('.')[1];
      setFormData({ ...formData, animalDetails: { ...formData.animalDetails, [field]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await createRescueCase(formData);
      setMessage('Rescue case created successfully');
      navigate('/rescue');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader title="New Rescue Case" subtitle="Document a new wildlife rescue operation." />
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
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Species</label>
              <select
                name="species"
                value={formData.species}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select a species</option>
                {speciesList.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Rescue Center</label>
              <div className="relative">
                <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                <input
                  type="text"
                  name="center"
                  value={formData.center}
                  onChange={handleChange}
                  className="input-field pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Rescue Reason</label>
              <textarea
                name="rescueReason"
                value={formData.rescueReason}
                onChange={handleChange}
                className="input-field"
                rows="3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-3">Animal Details</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="animalDetails.age"
                    value={formData.animalDetails.age}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Age"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="animalDetails.sex"
                    value={formData.animalDetails.sex}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Sex"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="animalDetails.weight"
                    value={formData.animalDetails.weight}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Weight"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="animalDetails.condition"
                    value={formData.animalDetails.condition}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Condition"
                  />
                </div>
              </div>
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
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => navigate('/rescue')} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Creating...' : 'Create Case'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRescueCase;
