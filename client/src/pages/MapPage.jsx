import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, Shield } from 'lucide-react';
import { MapContainer, TileLayer, Popup, LayersControl, LayerGroup, CircleMarker, Polygon, useMap } from 'react-leaflet';
import { getSightings } from '../features/sightings/sightingApi';
import { getTips } from '../features/sightings/tipApi';
import { getHWCIncidents, getGeofenceZones } from '../features/map/hwcApi';
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

function FitBounds({ sightings, hwcIncidents, tips }) {
  const map = useMap();
  useEffect(() => {
    const points = [
      ...(sightings || []).map((s) => s.location?.coordinates?.slice().reverse()).filter(Boolean),
      ...(hwcIncidents || []).map((h) => h.location?.coordinates?.slice().reverse()).filter(Boolean),
      ...(tips || []).map((t) => [t.lat, t.lng]).filter((v) => Array.isArray(v)),
    ];
    const valid = points.filter((p) => Array.isArray(p) && p.length === 2);
    if (valid.length > 0) {
      map.fitBounds(valid, { padding: [40, 40], maxZoom: 12 });
    }
  }, [sightings, hwcIncidents, tips, map]);
  return null;
}

function MapPage() {
  const [sightings, setSightings] = useState([]);
  const [hwcIncidents, setHwcIncidents] = useState([]);
  const [tips, setTips] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('public');
  const [layers, setLayers] = useState({
    sightings: true,
    hwc: true,
    tips: true,
    zones: true,
  });

  useEffect(() => {
    loadData();
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) setRole(storedRole);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sightingRes, tipRes, hwcRes, zoneRes] = await Promise.all([
        getSightings({ limit: 1000 }),
        getTips({ limit: 1000 }),
        getHWCIncidents({ limit: 1000 }),
        getGeofenceZones(),
      ]);
      setSightings(sightingRes.data?.sightings || []);
      setTips(tipRes.data?.tips || []);
      setHwcIncidents(hwcRes.data?.incidents || []);
      setZones(zoneRes.data || []);
    } catch (err) {
      console.error('Failed to load map data', err);
    } finally {
      setLoading(false);
    }
  };

  const isSensitive = (status) => ['EN', 'CR', 'EW', 'VU'].includes(status);

  const getSightingPosition = (sighting) => {
    if (!sighting.location?.coordinates || sighting.location.coordinates.length !== 2) return null;
    const [lng, lat] = sighting.location.coordinates;
    if (isSensitive(sighting.species?.conservationStatus) && role === 'public') {
      return [roundTo2DP(lat), roundTo2DP(lng)];
    }
    return [lat, lng];
  };

  const sightingColor = (status) => {
    switch (status) {
      case 'verified': return '#4F8A5D';
      case 'rejected': return '#C97B4A';
      default: return '#6B4E3A';
    }
  };

  const hwcColor = (type) => {
    switch (type) {
      case 'crop_raiding': return '#D4A017';
      case 'livestock_predation': return '#B93B3B';
      case 'property_damage': return '#D97706';
      case 'injury': return '#DC2626';
      case 'fatal': return '#7F1D1D';
      default: return '#6B4E3A';
    }
  };

  const tipColor = (status) => {
    switch (status) {
      case 'new': return '#2563EB';
      case 'under_review': return '#D97706';
      case 'actioned': return '#4F8A5D';
      case 'closed': return '#6B4E3A';
      default: return '#2563EB';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-6">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-display font-semibold text-white mb-2">Interactive Map</h1>
              <p className="text-white/80">Explore sightings, incidents, tips, geofence zones, and wildlife activity across the region.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {Object.entries(layers).map(([key, checked]) => (
                <label key={key} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm capitalize">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setLayers((prev) => ({ ...prev, [key]: e.target.checked }))}
                    className="rounded border-white/30"
                  />
                  <span>{key === 'hwc' ? 'HWC Incidents' : key === 'zones' ? 'Geofence Zones' : key}</span>
                </label>
              ))}
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
              <FitBounds sightings={sightings} hwcIncidents={hwcIncidents} tips={tips} />
              <LayersControl position="topright">
                <LayersControl.Overlay name="Sightings" checked={layers.sightings}>
                  <LayerGroup>
                    {layers.sightings &&
                      sightings.map((s) => {
                        const pos = getSightingPosition(s);
                        if (!pos) return null;
                        const color = sightingColor(s.status);
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

                <LayersControl.Overlay name="HWC Incidents" checked={layers.hwc}>
                  <LayerGroup>
                    {layers.hwc &&
                      hwcIncidents.map((h) => {
                        if (!h.location?.coordinates || h.location.coordinates.length !== 2) return null;
                        const [lng, lat] = h.location.coordinates;
                        const color = hwcColor(h.type);
                        return (
                          <CircleMarker key={h._id} center={[lat, lng]} radius={7} pathOptions={{ color, fillColor: color, fillOpacity: 0.7 }}>
                            <Popup>
                              <div className="font-sans">
                                <strong>HWC Incident</strong><br />
                                Type: {h.type?.replace('_', ' ')}<br />
                                {h.description}<br />
                                Reported: {new Date(h.createdAt).toLocaleDateString()}
                              </div>
                            </Popup>
                          </CircleMarker>
                        );
                      })}
                  </LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay name="Tips" checked={layers.tips}>
                  <LayerGroup>
                    {layers.tips &&
                      tips.map((t) => {
                        if (!Array.isArray([t.lat, t.lng])) return null;
                        const color = tipColor(t.status);
                        return (
                          <CircleMarker key={t._id} center={[t.lat, t.lng]} radius={6} pathOptions={{ color, fillColor: color, fillOpacity: 0.7 }}>
                            <Popup>
                              <div className="font-sans">
                                <strong>{t.title}</strong><br />
                                Status: {t.status}<br />
                                {t.description}
                              </div>
                            </Popup>
                          </CircleMarker>
                        );
                      })}
                  </LayerGroup>
                </LayersControl.Overlay>

                <LayersControl.Overlay name="Geofence Zones" checked={layers.zones}>
                  <LayerGroup>
                    {layers.zones &&
                      zones.map((z) => {
                        const coords = z.geometry?.coordinates?.[0]?.map((c) => [c[1], c[0]]);
                        if (!coords || coords.length < 3) return null;
                        return (
                          <Polygon key={z._id} positions={coords} pathOptions={{ color: '#DC2626', fillColor: '#DC2626', fillOpacity: 0.15 }}>
                            <Popup>
                              <div className="font-sans">
                                <strong>{z.name}</strong><br />
                                {z.description}<br />
                                <span className="text-xs text-gray-600">Created by: {z.createdBy?.firstName || 'Admin'}</span>
                              </div>
                            </Popup>
                          </Polygon>
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
