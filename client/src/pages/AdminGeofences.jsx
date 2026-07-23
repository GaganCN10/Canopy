import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import { getGeofenceZones, createGeofenceZone } from '../features/map/hwcApi';

function AdminGeofences() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '', coordinates: '' });

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

  const zonePolygons = zones.map((z) => ({
    ...z,
    positions: z.geometry?.coordinates?.[0]?.map(([lng, lat]) => [lat, lng]) || [],
  }));

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-2">Geofence Zone Management</h1>
      <p className="text-sm text-canopy-ink-900/70 mb-6">Create geofence zones using coordinate pairs.</p>
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="card p-6 mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Zone Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Coordinates (lng,lat; lng,lat; ...)</label>
          <textarea
            name="coordinates"
            value={formData.coordinates}
            onChange={handleChange}
            className="input-field"
            rows="3"
            placeholder="100.5,1.3; 100.6,1.3; 100.6,1.4; 100.5,1.4"
            required
          />
          <p className="text-xs text-canopy-ink-900/50 mt-1">Enter at least 3 pairs separated by semicolons. First and last coordinates must match to close the polygon.</p>
        </div>
        <button type="submit" className="btn-primary">Create Zone</button>
      </form>

      <div className="card overflow-hidden" style={{ height: '400px' }}>
        <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {zonePolygons.map((z) => (
            <Polygon key={z._id} positions={z.positions} pathOptions={{ color: '#0F1B14', fillOpacity: 0.2 }} />
          ))}
        </MapContainer>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((z) => (
          <div key={z._id} className="card p-4">
            <h3 className="font-display text-lg font-semibold text-canopy-forest-950">{z.name}</h3>
            <p className="text-sm text-canopy-ink-900/70 mt-1">{z.description}</p>
            <p className="text-xs text-canopy-ink-900/50 mt-2">Active: {z.isActive ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminGeofences;