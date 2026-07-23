import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Filter, Layers } from 'lucide-react';
import { MapContainer, TileLayer, Popup, LayersControl, LayerGroup, CircleMarker } from 'react-leaflet';
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
      case 'verified': return '#4F8A5D';
      case 'rejected': return '#C97B4A';
      default: return '#6B4E3A';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-6">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-display font-semibold text-white mb-2">Interactive Map</h1>
              <p className="text-white/80">Explore sightings, incidents, and wildlife activity across the region.</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm">
                <input
                  type="checkbox"
                  checked={showSightings}
                  onChange={(e) => setShowSightings(e.target.checked)}
                  className="rounded border-white/30"
                />
                <span>Sightings</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="card overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-canopy-forest-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-canopy-ink-900/70">Loading map data...</p>
              </div>
            </div>
          ) : (
            <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
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
                      const color = statusColor(s.status);
                      return (
                        <CircleMarker key={s._id} center={pos} radius={8} pathOptions={{ color, fillColor: color, fillOpacity: 0.6 }}>
                          <Popup>
                            <div className="font-sans">
                              <strong>{s.species?.name || 'Unknown'}</strong><br />
                              Status: {s.status}<br />
                              Votes: {s.verificationCount}<br />
                              {s.notes}
                            </div>
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
      </div>
    </div>
  );
}

export default MapPage;
