import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, FileText, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createSighting, uploadSightingImage } from '../features/sightings/sightingApi';
import { getSpecies } from '../features/sightings/speciesApi';
import Button from '../components/Button';
import { PageHeader } from '../components/ui';

const STEPS = [
  { id: 1, label: 'Species', icon: FileText },
  { id: 2, label: 'Location', icon: MapPin },
  { id: 3, label: 'Photo', icon: Camera },
];

function ReportSighting() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    species: '',
    lat: '',
    lng: '',
    notes: '',
    images: [],
  });
  const [imageFile, setImageFile] = useState(null);
  const [speciesList, setSpeciesList] = useState([]);
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
      setError('Failed to load species list');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let images = [];
      if (imageFile) {
        const uploadForm = new FormData();
        uploadForm.append('image', imageFile);
        const uploadResult = await uploadSightingImage(uploadForm);
        images = [{ url: uploadResult.data.url, filename: imageFile.name }];
      }

      await createSighting({
        species: formData.species,
        lat: formData.lat,
        lng: formData.lng,
        notes: formData.notes,
        images,
      });

      navigate('/sightings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report sighting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Report a Sighting"
            subtitle="Log a wildlife observation with location data and photos."
          />

          <div className="flex items-center gap-4">
            {STEPS.map((s) => (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= s.id ? 'bg-white text-canopy-forest-800' : 'bg-white/20 text-white/60'
                }`}>
                  <s.icon className="w-4 h-4" />
                </div>
                {s.id < STEPS.length && (
                  <div className={`flex-grow h-0.5 ${step > s.id ? 'bg-white' : 'bg-white/20'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <form onSubmit={handleSubmit} className="card p-8 lg:p-10">
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
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input-field"
                rows="4"
                placeholder="Describe what you observed..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Photo (optional)</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-canopy-mist-200 rounded-2xl cursor-pointer hover:border-canopy-forest-400 hover:bg-canopy-sand-50 transition-all"
                >
                  <Camera className="w-8 h-8 text-canopy-forest-400 mb-2" />
                  <span className="text-sm text-canopy-ink-900/70">
                    {imageFile ? imageFile.name : 'Click to upload a photo'}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => navigate('/sightings')} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Submitting...' : 'Submit Sighting'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportSighting;
