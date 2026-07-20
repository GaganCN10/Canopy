import React from 'react';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createSighting, uploadSightingImage } from '../features/sightings/sightingApi';
import { getSpecies } from '../features/sightings/speciesApi';

function ReportSighting() {
  const [speciesId, setSpeciesId] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [notes, setNotes] = useState('');
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
        species: speciesId,
        lat,
        lng,
        notes,
        images,
      });

      navigate('/sightings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report sighting');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Report a Sighting</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Species</label>
          <select value={speciesId} onChange={(e) => setSpeciesId(e.target.value)} className="w-full border rounded p-2" required>
            <option value="">Select a species</option>
            {speciesList.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Latitude</label>
            <input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitude</label>
            <input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} className="w-full border rounded p-2" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border rounded p-2" rows="3" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Photo (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full border rounded p-2" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-canopy-600 text-white py-2 rounded hover:bg-canopy-700 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Report Sighting'}
        </button>
      </form>
    </div>
  );
}

export default ReportSighting;
