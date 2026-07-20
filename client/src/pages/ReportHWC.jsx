import React from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createHWCIncident } from '../features/map/hwcApi';

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
      setMessage('HWC incident reported successfully');
      setFormData({ type: 'crop_raiding', description: '', lat: '', lng: '', lossDescription: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Report Human-Wildlife Conflict</h1>
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Incident Type</label>
          <select name="type" value={formData.type} onChange={handleChange} className="w-full border rounded p-2">
            <option value="crop_raiding">Crop Raiding</option>
            <option value="livestock_predation">Livestock Predation</option>
            <option value="property_damage">Property Damage</option>
            <option value="injury">Injury</option>
            <option value="fatal">Fatal</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border rounded p-2" rows="3" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Latitude</label>
            <input type="number" step="any" name="lat" value={formData.lat} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitude</label>
            <input type="number" step="any" name="lng" value={formData.lng} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Loss Description</label>
          <textarea name="lossDescription" value={formData.lossDescription} onChange={handleChange} className="w-full border rounded p-2" rows="2" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Report Incident'}
        </button>
      </form>
    </div>
  );
}

export default ReportHWC;
