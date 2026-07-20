import React from 'react';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, LayersControl, LayerGroup } from 'react-leaflet';
import { getSightings } from '../features/sightings/sightingApi';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function roundTo2DP(value) {
  return Math.round(value * 100) / 100;
}

function MapPage() {
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('public');
  const [showSightings, setShowSightings] = useState(true);

  useEffect(() => {
    loadSightings();
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) setRole(storedRole);
  }, []);

  const loadSightings = async () => {
    setLoading(true);
    try {
      const result = await getSightings({ limit: 1000 });
      setSightings(result.data.sightings);
    } catch (err) {
      console.error('Failed to load sightings for map', err);
    } finally {
      setLoading(false);
    }
  };

  const isSensitive = (status) => ['EN', 'CR', 'EW', 'VU'].includes(status);

  const getPosition = (sighting) => {
    if (!sighting.location?.coordinates || sighting.location.coordinates.length !== 2) return null;
    const [lng, lat] = sighting.location.coordinates;
    if (isSensitive(sighting.species?.conservationStatus) && role === 'public') {
      return [roundTo2DP(lat), roundTo2DP(lng)];
    }
    return [lat, lng];
  };

  const statusColor = (status) => {
    switch (status) {
      case 'verified': return '#22c55e';
      case 'rejected': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  return (
    <div className="h-[calc(100vh-200px)]">
      <h1 className="text-3xl font-bold mb-4">Interactive Map</h1>
      <div className="mb-4 flex gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showSightings} onChange={(e) => setShowSightings(e.target.checked)} />
          <span>Sightings Layer</span>
        </label>
        <span className="text-sm text-slate-600">Other layers coming in future phases</span>
      </div>
      {loading ? (
        <p>Loading map data...</p>
      ) : (
        <MapContainer center={[20, 0]} zoom={2} style={{ height: '600px', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LayersControl position="topright">
            <LayersControl.Overlay name="Sightings" checked={showSightings}>
              <LayerGroup>
                {showSightings && sightings.map((s) => {
                  const pos = getPosition(s);
                  if (!pos) return null;
                  return (
                    <CircleMarker key={s._id} center={pos} radius={6} pathOptions={{ color: statusColor(s.status) }}>
                      <Popup>
                        <strong>{s.species?.name || 'Unknown'}</strong><br />
                        Status: {s.status}<br />
                        Votes: {s.verificationCount}<br />
                        {s.notes}
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </LayerGroup>
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>
      )}
    </div>
  );
}

export default MapPage;
