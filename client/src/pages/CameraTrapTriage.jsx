import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Sparkles, AlertCircle, Monitor } from 'lucide-react';
import { triageCameraTrap } from '../features/ml/mlApi';
import { useToast } from '../components/Toast';

const LABEL_META = {
  animal: { label: 'Animal', color: 'bg-green-100 text-green-700', bar: 'bg-green-600' },
  person: { label: 'Person', color: 'bg-blue-100 text-blue-700', bar: 'bg-blue-600' },
  vehicle: { label: 'Vehicle', color: 'bg-amber-100 text-amber-700', bar: 'bg-amber-600' },
  blank: { label: 'Blank', color: 'bg-gray-100 text-gray-700', bar: 'bg-gray-400' },
};

function CameraTrapTriage() {
  const [preview, setPreview] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const { showSuccess, showError } = useToast();

  const handleFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setPredictions([]);
    setError('');
  };

  const handleChange = (e) => {
    handleFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handlePredict = async () => {
    if (!fileRef.current?.files?.[0]) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');
    setPredictions([]);

    try {
      const formData = new FormData();
      formData.append('file', fileRef.current.files[0]);
      const result = await triageCameraTrap(formData);
      setPredictions(result.data?.predictions || []);
      showSuccess('Triage complete', 'Camera trap classification finished');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Triage failed';
      setError(message);
      showError('Triage failed', message);
    } finally {
      setLoading(false);
    }
  };

  const top = predictions[0];
  const topMeta = top ? LABEL_META[top.label] : null;

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-6">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-display font-semibold text-white mb-2">
            Camera Trap Triage
          </h1>
          <p className="text-white/80">
            Upload a camera trap image to classify it as animal, person, vehicle, or blank.
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="card p-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-canopy-mist-200 rounded-2xl p-8 text-center hover:border-canopy-forest-600 transition-colors cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
            />
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="max-h-80 mx-auto rounded-xl shadow-ambient"
              />
            ) : (
              <div className="py-12">
                <Monitor className="w-12 h-12 text-canopy-forest-600 mx-auto mb-4" />
                <p className="text-canopy-ink-900/70">
                  Drop a camera trap image here or click to browse
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handlePredict}
              disabled={loading || !preview}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? (
                'Classifying...'
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Classify Image
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Triage failed</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {topMeta && (
            <div className="mt-8">
              <h3 className="text-xl font-display font-semibold text-canopy-forest-950 mb-4">
                Result
              </h3>
              <div className="flex items-center gap-4 p-4 bg-canopy-sand-50 rounded-xl border border-canopy-mist-200">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${topMeta.color}`}>
                  {topMeta.label}
                </span>
                <div className="flex-1 bg-canopy-mist-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${topMeta.bar}`}
                    style={{ width: `${Math.min(top.confidence * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm text-canopy-ink-900/70 w-20 text-right">
                  {(top.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {predictions.length > 1 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-canopy-ink-900/70 mb-2">All predictions</h4>
              <div className="space-y-2">
                {predictions.map((pred, idx) => {
                  const meta = LABEL_META[pred.label] || LABEL_META.blank;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-canopy-mist-200"
                    >
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
                        {pred.label}
                      </span>
                      <span className="text-sm text-canopy-ink-900/70">
                        {(pred.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CameraTrapTriage;
