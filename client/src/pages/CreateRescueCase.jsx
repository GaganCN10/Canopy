import React from 'react';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getSpecies } from '../features/sightings/speciesApi';
import { createRescueCase } from '../features/sightings/rescueApi';

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
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">New Rescue Case</h1>
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Species</label>
          <select name="species" value={formData.species} onChange={handleChange} className="w-full border rounded p-2" required>
            <option value="">Select a species</option>
            {speciesList.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Rescue Center</label>
          <input type="text" name="center" value={formData.center} onChange={handleChange} className="w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Rescue Reason</label>
          <textarea name="rescueReason" value={formData.rescueReason} onChange={handleChange} className="w-full border rounded p-2" rows="3" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input type="text" name="animalDetails.age" value={formData.animalDetails.age} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sex</label>
            <input type="text" name="animalDetails.sex" value={formData.animalDetails.sex} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Weight</label>
            <input type="text" name="animalDetails.weight" value={formData.animalDetails.weight} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Condition</label>
            <input type="text" name="animalDetails.condition" value={formData.animalDetails.condition} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Latitude</label>
            <input type="number" step="any" name="lat" value={formData.lat} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitude</label>
            <input type="number" step="any" name="lng" value={formData.lng} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-canopy-600 text-white py-2 rounded hover:bg-canopy-700 disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Case'}
        </button>
      </form>
    </div>
  );
}

export default CreateRescueCase;
