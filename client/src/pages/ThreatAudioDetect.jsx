import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Upload, Shield, AlertTriangle, Sparkles } from 'lucide-react';
import { predictThreatAudio } from '../features/ml/mlApi';
import { useToast } from '../components/Toast';

const LABEL_META = {
  threat: { label: 'Threat', color: 'bg-red-100 text-red-700', bar: 'bg-red-600' },
  non_threat: { label: 'Non-Threat', color: 'bg-green-100 text-green-700', bar: 'bg-green-600' },
};

function ThreatAudioDetect() {
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
      const result = await predictThreatAudio(formData);
      setPredictions(result.data?.predictions || []);
      showSuccess('Detection complete', 'Threat audio analysis finished');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Detection failed';
      setError(message);
      showError('Detection failed', message);
    } finally {
      setLoading(false);
    }
  };

  const top = predictions[0];
  const isThreat = top?.label === 'threat';
  const topMeta = top ? LABEL_META[top.label] : null;

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-6">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-display font-semibold text-white mb-2">
            Threat Sound Detection
          </h1>
          <p className="text-white/80">
            Upload an audio clip to detect gunshots, chainsaws, or other threat sounds.
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
                'Analyzing...'
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Detect Threat
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Detection failed</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {topMeta && (
            <div className="mt-8">
              <h3 className="text-xl font-display font-semibold text-canopy-forest-950 mb-4">
                Result
              </h3>
              <div className={`p-4 rounded-xl border ${isThreat ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {isThreat ? (
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    ) : (
                      <Shield className="w-6 h-6 text-green-600" />
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${topMeta.color}`}>
                      {topMeta.label}
                    </span>
                  </div>
                  <div className="flex-1 bg-white/50 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${topMeta.bar}`}
                      style={{ width: `${Math.min(top.confidence * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-canopy-ink-900/70 w-20 text-right">
                    {(top.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                {isThreat && (
                  <p className="mt-3 text-sm text-red-700">
                    High-confidence threat detected. An anti-poaching tip has been automatically created and rangers have been notified.
                  </p>
                )}
              </div>
            </div>
          )}

          {predictions.length > 1 && (
            <div className="mt-8">
              <h4 className="text-xl font-display font-semibold text-canopy-forest-950 mb-4">
                All Predictions
              </h4>
              <div className="space-y-2">
                {predictions.map((pred, idx) => {
                  const meta = LABEL_META[pred.label] || LABEL_META.non_threat;
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

export default ThreatAudioDetect;
