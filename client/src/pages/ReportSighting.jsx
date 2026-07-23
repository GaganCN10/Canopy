import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, FileText, ArrowRight, Navigation, Search, Check, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createSighting, uploadSightingImage } from '../features/sightings/sightingApi';
import { getSpecies, createSpecies } from '../features/sightings/speciesApi';
import Button from '../components/Button';
import { PageHeader } from '../components/ui';
import { useToast } from '../components/Toast';
import { getErrorMessage } from '../utils/errors';

const STEPS = [
  { id: 1, label: 'Species', icon: FileText },
  { id: 2, label: 'Location', icon: MapPin },
  { id: 3, label: 'Photo', icon: Camera },
];

function SpeciesSearchInput({ speciesList, value, onChange, onSelect, disabled }) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [suggestedName, setSuggestedName] = useState('');
  const [suggestedScientific, setSuggestedScientific] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value && speciesList.find((s) => s._id === value)) {
      const found = speciesList.find((s) => s._id === value);
      setSelectedSpecies(found);
      setQuery(found.name);
    }
  }, [value, speciesList]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowSuggestForm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    setShowDropdown(true);
    setShowSuggestForm(false);
    setSelectedSpecies(null);
    setLoading(true);

    try {
      const result = await getSpecies({ limit: 10, search: inputValue });
      setSpeciesList((prev) => {
        const merged = [...result.data.species];
        return merged;
      });
    } catch (err) {
      console.error('Failed to search species', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSpecies = (species) => {
    setQuery(species.name);
    setSelectedSpecies(species);
    setShowDropdown(false);
    setShowSuggestForm(false);
    onChange(species._id);
    onSelect?.(species);
  };

  const handleSuggestClick = () => {
    setSuggestedName(query.trim());
    setShowSuggestForm(true);
    setShowDropdown(false);
  };

  const handleSuggestSubmit = async (e) => {
    e.preventDefault();
    if (!suggestedName) return;

    setSuggesting(true);
    try {
      const result = await createSpecies({
        name: suggestedName,
        scientificName: suggestedScientific.trim() || undefined,
        conservationStatus: 'DD',
      });
      const newSpecies = result.data.data || result.data;
      setQuery(newSpecies.name);
      setSelectedSpecies(newSpecies);
      setShowSuggestForm(false);
      setSuggestedName('');
      setSuggestedScientific('');
      onChange(newSpecies._id);
      onSelect?.(newSpecies);
    } catch (err) {
      console.error('Failed to suggest species', err);
    } finally {
      setSuggesting(false);
    }
  };

  const filteredSpecies = speciesList.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  const hasExactMatch = filteredSpecies.some(
    (s) => s.name.toLowerCase() === query.toLowerCase()
  );

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-canopy-ink-900 mb-2">
        Species <span className="text-canopy-ink-900/60">(enter common name)</span>
      </label>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          className="input-field pl-12"
          placeholder="Type a species common name..."
          required
          disabled={disabled}
          autoComplete="off"
        />
      </div>

      {selectedSpecies && (
        <div className="mt-2 p-2 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>
              Scientific name: <em>{selectedSpecies.scientificName || 'Not available'}</em>
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Status: {selectedSpecies.conservationStatus || 'Not assessed'}
          </p>
        </div>
      )}

      {showDropdown && !selectedSpecies && !showSuggestForm && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-canopy-mist-200 rounded-2xl shadow-ambient-lg max-h-60 overflow-y-auto">
          {loading ? (
            <p className="px-4 py-3 text-sm text-canopy-ink-900/60">Searching...</p>
          ) : filteredSpecies.length > 0 ? (
            filteredSpecies.map((s) => (
              <button
                key={s._id}
                type="button"
                onClick={() => handleSelectSpecies(s)}
                className="w-full text-left px-4 py-3 hover:bg-canopy-sand-100 transition-colors border-b border-canopy-mist-200 last:border-b-0"
              >
                <p className="text-sm font-medium text-canopy-forest-950">{s.name}</p>
                {s.scientificName && (
                  <p className="text-xs text-canopy-ink-900/60 mt-0.5"><em>{s.scientificName}</em></p>
                )}
                {s.conservationStatus && (
                  <p className="text-xs text-canopy-ink-900/50 mt-0.5">Status: {s.conservationStatus}</p>
                )}
              </button>
            ))
          ) : query && !hasExactMatch ? (
            <div className="px-4 py-3">
              <p className="text-sm text-canopy-ink-900/60 mb-2">No species found matching "{query}".</p>
              <button
                type="button"
                onClick={handleSuggestClick}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-canopy-forest-600 hover:text-canopy-forest-800"
              >
                <Plus className="w-4 h-4" />
                Suggest "{query}" as a new species
              </button>
            </div>
          ) : (
            <p className="px-4 py-3 text-sm text-canopy-ink-900/60">
              Start typing to search species...
            </p>
          )}
        </div>
      )}

      {showSuggestForm && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-canopy-mist-200 rounded-2xl shadow-ambient-lg p-4">
          <p className="text-sm font-medium text-canopy-forest-950 mb-3">
            Suggest new species: <em>{suggestedName}</em>
          </p>
          <form onSubmit={handleSuggestSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-canopy-ink-900 mb-1">Scientific Name (optional)</label>
              <input
                type="text"
                value={suggestedScientific}
                onChange={(e) => setSuggestedScientific(e.target.value)}
                className="input-field"
                placeholder="e.g., Panthera tigris tigris"
                autoComplete="off"
              />
              <p className="text-xs text-canopy-ink-900/50 mt-1">
                If left blank, it will be marked as "Not available".
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowSuggestForm(false)}
                className="btn-secondary flex-1"
                disabled={suggesting}
              >
                Cancel
              </button>
              <button type="submit" disabled={suggesting} className="btn-primary flex-1">
                {suggesting ? 'Adding...' : 'Add Species'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

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
  const [errorInfo, setErrorInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showError } = useToast();
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
      const errorInfo = getErrorMessage(err);
      showError(errorInfo.title, errorInfo.message, errorInfo.remedy);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSpeciesSelect = (species) => {
    setFormData({ ...formData, species: species._id || species });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showError('Not Supported', 'Geolocation is not supported by your browser.', 'Please enter coordinates manually.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setFormData({ ...formData, lat, lng });
        setLocating(false);
      },
      (error) => {
        let message = 'Unable to retrieve your location.';
        let remedy = 'Please enter coordinates manually or check location permissions.';
        if (error.code === 1) {
          message = 'Location permission denied.';
          remedy = 'Please enable location access in your browser settings and try again.';
        } else if (error.code === 2) {
          message = 'Location unavailable.';
          remedy = 'Your device could not determine your location. Please enter coordinates manually.';
        } else if (error.code === 3) {
          message = 'Location request timed out.';
          remedy = 'Please try again or enter coordinates manually.';
        }
        showError('Location Error', message, remedy);
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorInfo(null);
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
      const errorInfo = getErrorMessage(err);
      setErrorInfo(errorInfo);
      showError(errorInfo.title, errorInfo.message, errorInfo.remedy);
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

          <div className="space-y-6">
            <SpeciesSearchInput
              speciesList={speciesList}
              value={formData.species}
              onChange={(id) => handleChange({ target: { name: 'species', value: id } })}
              onSelect={handleSpeciesSelect}
              disabled={loading}
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-canopy-ink-900">Location</label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-canopy-forest-600 hover:text-canopy-forest-800 transition-colors"
                >
                  <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-pulse' : ''}`} />
                  {locating ? 'Getting location...' : 'Use current location'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-canopy-ink-900/60 mb-1">Latitude</label>
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
                      placeholder="e.g. 2.5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-canopy-ink-900/60 mb-1">Longitude</label>
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
                      placeholder="e.g. 101.8"
                    />
                  </div>
                </div>
              </div>
              {formData.lat && formData.lng && (
                <p className="text-xs text-green-700 mt-2">Location coordinates captured successfully.</p>
              )}
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
