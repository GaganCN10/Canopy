import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Layers, Shield, Upload } from 'lucide-react';
import { MapContainer, TileLayer, Popup, LayersControl, LayerGroup, CircleMarker, Polygon, Polyline, useMap } from 'react-leaflet';
import { getSightings } from '../features/sightings/sightingApi';
import { getTips } from '../features/sightings/tipApi';
import { getHWCIncidents, getGeofenceZones } from '../features/map/hwcApi';
import { getPoachingHotspots, getMovementCorridors } from '../features/ml/mlApi';
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

function FitBounds({ sightings, hwcIncidents, tips, hotspots, movements }) {
  const map = useMap();
  useEffect(() => {
    const points = [
      ...(sightings || []).map((s) => s.location?.coordinates?.slice().reverse()).filter(Boolean),
      ...(hwcIncidents || []).map((h) => h.location?.coordinates?.slice().reverse()).filter(Boolean),
      ...(tips || []).map((t) => [t.lat, t.lng]).filter((v) => Array.isArray(v)),
      ...(hotspots || []).map((h) => {
        const [lng, lat] = h.geometry?.coordinates || [];
        return [lat, lng];
      }).filter((v) => Array.isArray(v)),
      ...(movements || []).flatMap((m) => {
        const coords = m.geometry?.coordinates || [];
        return coords.map((c) => [c[1], c[0]]);
      }).filter((v) => Array.isArray(v)),
    ];
    const valid = points.filter((p) => Array.isArray(p) && p.length === 2);
    if (valid.length > 0) {
      map.fitBounds(valid, { padding: [40, 40], maxZoom: 12 });
    }
  }, [sightings, hwcIncidents, tips, hotspots, movements, map]);
  return null;
}

function MapPage() {
  const [sightings, setSightings] = useState([]);
  const [hwcIncidents, setHwcIncidents] = useState([]);
  const [tips, setTips] = useState([]);
  const [zones, setZones] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('public');
  const [layers, setLayers] = useState({
    sightings: true,
    hwc: true,
    tips: true,
    zones: true,
    hotspots: true,
    movements: true,
  });
  const fileInputRef = useRef(null);

  const canViewHotspots = ['ranger', 'admin', 'researcher'].includes(role);

  useEffect(() => {
    loadData();
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) setRole(storedRole);
  }, []);

  useEffect(() => {
    if (canViewHotspots) {
      loadHotspots();
    }
  }, [canViewHotspots]);

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

  const loadHotspots = async () => {
    try {
      const response = await getPoachingHotspots({});
      const features = response.data?.geojson?.features || [];
      setHotspots(features);
    } catch (err) {
      console.error('Failed to load hotspots', err);
    }
  };

  const handleMovementUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await getMovementCorridors(formData);
      const features = response.data?.geojson?.features || [];
      setMovements(features);
      setLayers((prev) => ({ ...prev, movements: true }));
    } catch (err) {
      console.error('Failed to load movement data', err);
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

  const hotspotColor = (intensity) => {
    const r = Math.floor(220 * intensity + 50);
    const g = Math.floor(50 * (1 - intensity));
    const b = Math.floor(50 * (1 - intensity));
    return `rgb(${r}, ${g}, ${b})`;
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
              {Object.entries(layers).map(([key, checked]) => {
                if (key === 'hotspots' && !canViewHotspots) return null;
                return (
                  <label key={key} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm capitalize">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setLayers((prev) => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded border-white/30"
                    />
                    <span>{key === 'hwc' ? 'HWC Incidents' : key === 'zones' ? 'Geofence Zones' : key === 'hotspots' ? 'Poaching Hotspots' : key === 'movements' ? 'Movement Corridors' : key}</span>
                  </label>
                );
              })}
              <label className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Upload GPX/CSV</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".gpx,.csv"
                  className="hidden"
                  onChange={handleMovementUpload}
                />
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
              <FitBounds sightings={sightings} hwcIncidents={hwcIncidents} tips={tips} hotspots={hotspots} movements={movements} />
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

                {canViewHotspots && (
                  <LayersControl.Overlay name="Poaching Hotspots" checked={layers.hotspots}>
                    <LayerGroup>
                      {layers.hotspots &&
                        hotspots.map((h, idx) => {
                          const [lng, lat] = h.geometry?.coordinates || [];
                          if (!Array.isArray([lat, lng])) return null;
                          const intensity = h.properties?.intensity || 0;
                          const radius = 4 + intensity * 18;
                          const color = hotspotColor(intensity);
                          return (
                            <CircleMarker
                              key={`hotspot-${idx}`}
                              center={[lat, lng]}
                              radius={radius}
                              pathOptions={{ color, fillColor: color, fillOpacity: 0.55 }}
                            >
                              <Popup>
                                <div className="font-sans">
                                  <strong>Hotspot</strong><br />
                                  Intensity: {(intensity * 100).toFixed(1)}%<br />
                                  Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
                                </div>
                              </Popup>
                            </CircleMarker>
                          );
                        })}
                    </LayerGroup>
                  </LayersControl.Overlay>
                )}

                <LayersControl.Overlay name="Movement Corridors" checked={layers.movements}>
                  <LayerGroup>
                    {layers.movements &&
                      movements.map((m, idx) => {
                        const coords = m.geometry?.coordinates || [];
                        const latlngs = coords.map((c) => [c[1], c[0]]);
                        if (latlngs.length < 2) return null;
                        return (
                          <Polyline
                            key={`movement-${idx}`}
                            positions={latlngs}
                            pathOptions={{ color: '#8B5CF6', weight: 3, opacity: 0.8 }}
                          >
                            <Popup>
                              <div className="font-sans">
                                <strong>Movement Trajectory</strong><br />
                                Points: {m.properties?.point_count || latlngs.length}<br />
                                {m.properties?.start_time && <span>Start: {new Date(m.properties.start_time).toLocaleString()}</span>}
                              </div>
                            </Popup>
                          </Polyline>
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
