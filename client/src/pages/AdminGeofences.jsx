import React from 'react';
import { useState, useEffect } from 'react';
import { getGeofenceZones, createGeofenceZone } from '../features/map/hwcApi';

function AdminGeofences() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '', coordinates: '' });
  const [message, setMessage] = useState('');

  const loadZones = async () => {
    setLoading(true);
    try {
      const result = await getGeofenceZones();
      setZones(result.data);
    } catch (err) {
      setError('Failed to load zones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const coordinates = formData.coordinates.split(';').map((pair) => pair.split(',').map(Number));
      if (coordinates.length < 3) {
        setError('At least 3 coordinate pairs required (lng,lat; lng,lat; ...)');
        return;
      }
      await createGeofenceZone({ ...formData, coordinates });
      setMessage('Geofence zone created');
      setFormData({ name: '', description: '', coordinates: '' });
      loadZones();
    } catch (err) {
      setError(err.response?.data?.message || 'Creation failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">Geofence Zone Management</h1>
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded bg-white">
        <h2 className="text-xl font-semibold mb-4">Create Zone</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Zone Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Coordinates (lng,lat; lng,lat; ...)</label>
            <input type="text" name="coordinates" value={formData.coordinates} onChange={handleChange} className="w-full border rounded p-2" placeholder="100.5,1.3; 100.6,1.3; 100.6,1.4; 100.5,1.4" required />
            <p className="text-xs text-slate-500 mt-1">Enter at least 3 pairs separated by semicolons. First and last coordinates must match to close the polygon.</p>
          </div>
          <button type="submit" className="bg-canopy-600 text-white px-4 py-2 rounded hover:bg-canopy-700">Create Zone</button>
        </div>
      </form>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {zones.map((z) => (
            <div key={z._id} className="border rounded p-4 bg-white">
              <h3 className="text-lg font-semibold">{z.name}</h3>
              <p className="text-sm text-slate-700">{z.description}</p>
              <p className="text-xs text-slate-500 mt-2">Active: {z.isActive ? 'Yes' : 'No'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminGeofences;
