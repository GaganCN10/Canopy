import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Mic, Sparkles, AlertCircle, Play } from 'lucide-react';
import { predictBioacoustic } from '../features/ml/mlApi';
import { useToast } from '../components/Toast';

function BioacousticPredict() {
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
      setError('Please select an audio file first');
      return;
    }

    setLoading(true);
    setError('');
    setPredictions([]);

    try {
      const formData = new FormData();
      formData.append('file', fileRef.current.files[0]);
      const result = await predictBioacoustic(formData);
      setPredictions(result.data?.segments || []);
      showSuccess('Prediction complete', 'Bioacoustic identification finished');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Prediction failed';
      setError(message);
      showError('Prediction failed', message);
    } finally {
      setLoading(false);
    }
  };

  const top = predictions[0];

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-6">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-display font-semibold text-white mb-2">
            Bioacoustic Species ID
          </h1>
          <p className="text-white/80">
            Upload an audio clip to identify bird or animal calls using ML.
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
              accept="audio/*"
              className="hidden"
              onChange={handleChange}
            />
            {preview ? (
              <div className="py-4">
                <audio controls src={preview} className="max-h-40 mx-auto" />
              </div>
            ) : (
              <div className="py-12">
                <Mic className="w-12 h-12 text-canopy-forest-600 mx-auto mb-4" />
                <p className="text-canopy-ink-900/70">
                  Drop an audio file here or click to browse
                </p>
                <p className="text-sm text-canopy-ink-900/50 mt-2">
                  Supports WAV, MP3, OGG, WebM
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
                'Identifying...'
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Identify Species
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Prediction failed</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {top && (
            <div className="mt-8">
              <h3 className="text-xl font-display font-semibold text-canopy-forest-950 mb-4">
                Top Prediction
              </h3>
              <div className="flex items-center gap-4 p-4 bg-canopy-sand-50 rounded-xl border border-canopy-mist-200">
                <div className="flex-1">
                  <p className="font-medium text-canopy-forest-950 text-lg">{top.species}</p>
                  <p className="text-sm text-canopy-ink-900/70">
                    {top.start.toFixed(2)}s - {top.end.toFixed(2)}s
                  </p>
                </div>
                <span className="text-sm font-medium text-canopy-forest-600">
                  {(top.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {predictions.length > 1 && (
            <div className="mt-8">
              <h4 className="text-xl font-display font-semibold text-canopy-forest-950 mb-4">
                All Detections
              </h4>
              <div className="space-y-2">
                {predictions.map((pred, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-canopy-mist-200"
                  >
                    <div>
                      <p className="font-medium text-canopy-forest-950">{pred.species}</p>
                      <p className="text-xs text-canopy-ink-900/60">
                        {pred.start.toFixed(2)}s - {pred.end.toFixed(2)}s
                      </p>
                    </div>
                    <span className="text-sm text-canopy-ink-900/70">
                      {(pred.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BioacousticPredict;
