import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, LayersControl, LayerGroup, Rectangle, useMap } from 'react-leaflet';
import { Calendar, Leaf, AlertCircle, Info } from 'lucide-react';
import { getHabitatNDVI } from '../features/ml/mlApi';
import { useToast } from '../components/Toast';

function NDVIChart({ data }) {
  if (!data) return null;
  const { mean, min, max, median, std, valid_pixels, total_pixels } = data;
  const coverage = total_pixels > 0 ? ((valid_pixels / total_pixels) * 100).toFixed(1) : 0;

  const bars = [
    { label: 'Min', value: (min + 1) / 2 * 100, color: 'bg-amber-500' },
    { label: 'Median', value: (median + 1) / 2 * 100, color: 'bg-green-600' },
    { label: 'Mean', value: (mean + 1) / 2 * 100, color: 'bg-canopy-forest-600' },
    { label: 'Max', value: (max + 1) / 2 * 100, color: 'bg-emerald-500' },
  ];

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-xl font-display font-semibold text-canopy-forest-950">NDVI Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-canopy-mist-200">
          <p className="text-xs text-canopy-ink-900/60 uppercase tracking-wide">Mean</p>
          <p className="text-2xl font-semibold text-canopy-forest-950">{mean.toFixed(3)}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-canopy-mist-200">
          <p className="text-xs text-canopy-ink-900/60 uppercase tracking-wide">Median</p>
          <p className="text-2xl font-semibold text-canopy-forest-950">{median.toFixed(3)}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-canopy-mist-200">
          <p className="text-xs text-canopy-ink-900/60 uppercase tracking-wide">Std Dev</p>
          <p className="text-2xl font-semibold text-canopy-forest-950">{std.toFixed(3)}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-canopy-mist-200">
          <p className="text-xs text-canopy-ink-900/60 uppercase tracking-wide">Coverage</p>
          <p className="text-2xl font-semibold text-canopy-forest-950">{coverage}%</p>
        </div>
      </div>
      <div className="space-y-2">
        {bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-3">
            <span className="text-sm text-canopy-ink-900/70 w-16">{bar.label}</span>
            <div className="flex-1 bg-canopy-mist-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${bar.color}`}
                style={{ width: `${Math.min(bar.value, 100)}%` }}
              />
            </div>
            <span className="text-sm text-canopy-ink-900/70 w-16 text-right">{bar.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <p className="text-blue-800 font-medium">NDVI Interpretation</p>
          <p className="text-blue-700 text-sm">
            {mean < 0.1 ? 'Bare soil/rock/urban area' :
             mean < 0.3 ? 'Sparse vegetation, shrubs, grassland' :
             mean < 0.5 ? 'Moderate vegetation, open forest' :
             mean < 0.7 ? 'Dense forest, healthy vegetation' :
             'Very dense, lush vegetation'}
          </p>
        </div>
      </div>
    </div>
  );
}

function MapController({ bounds, onBoundsChange }) {
  const map = useMap();
  return null;
}

function HabitatMonitor() {
  const [bbox, setBbox] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const { showSuccess, showError } = useToast();

  const handleMapClick = () => {
    setError('');
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!bbox || bbox.length !== 4) {
      setError('Please draw a region on the map');
      return;
    }
    if (!startDate || !endDate) {
      setError('Please select a date range');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const payload = {
        bbox: [bbox[0], bbox[1], bbox[2], bbox[3]],
        start_date: startDate,
        end_date: endDate,
        max_cloud_cover: 20,
      };
      const response = await getHabitatNDVI(payload);
      setResult(response.data);
      showSuccess('NDVI computed', 'Habitat analysis complete');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'NDVI computation failed';
      setError(message);
      showError('NDVI failed', message);
    } finally {
      setLoading(false);
    }
  };

  const defaultCenter = [20, 0];
  const defaultBounds = [[-85, -180], [85, 180]];

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-6">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-display font-semibold text-white mb-2">
            Habitat Monitoring
          </h1>
          <p className="text-white/80">
            Draw a region on the map and compute real NDVI from Sentinel-2 satellite imagery.
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Computing...' : (
                  <>
                    <Leaf className="w-4 h-4" />
                    Compute NDVI
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-canopy-mist-200" style={{ height: '500px' }}>
            <MapContainer
              center={defaultCenter}
              bounds={defaultBounds}
              style={{ height: '100%', width: '100%' }}
              onClick={handleMapClick}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LayersControl position="topright">
                <LayersControl.Overlay name="Selected Region">
                  <LayerGroup>
                    {bbox && (
                      <Rectangle
                        bounds={[[bbox[1], bbox[0]], [bbox[3], bbox[2]]]}
                        pathOptions={{ color: '#2563EB', fillColor: '#2563EB', fillOpacity: 0.2 }}
                      />
                    )}
                  </LayerGroup>
                </LayersControl.Overlay>
              </LayersControl>
            </MapContainer>
          </div>

          <p className="text-sm text-canopy-ink-900/60 mt-3">
            Click and drag on the map to draw a rectangle, or use the map controls to navigate to your region of interest.
          </p>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">NDVI computation failed</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {result && <NDVIChart data={result.summary} />}
        </div>
      </div>
    </div>
  );
}

export default HabitatMonitor;
