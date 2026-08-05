import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Eye } from 'lucide-react';
import { getTradeFlags, updateTradeFlag } from '../features/ml/mlApi';

function AdminTradeFlags() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  const loadFlags = async () => {
    setLoading(true);
    try {
      const response = await getTradeFlags({ status: statusFilter, limit: 100 });
      setFlags(response.data?.flags || []);
    } catch (err) {
      console.error('Failed to load trade flags', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, [statusFilter]);

  const handleStatusUpdate = async (flagId, status) => {
    try {
      await updateTradeFlag(flagId, { status });
      loadFlags();
    } catch (err) {
      console.error('Failed to update flag', err);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-6">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-display font-semibold text-white mb-2">Trade Flag Review Queue</h1>
          <p className="text-white/80">Review flagged listings and approve or dismiss them. No autonomous action is taken.</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            {['pending', 'approved', 'dismissed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                  statusFilter === status
                    ? 'bg-canopy-forest-600 text-white'
                    : 'bg-canopy-mist-200 text-canopy-ink-900 hover:bg-canopy-mist-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {loading ? (
            <p>Loading flags...</p>
          ) : flags.length === 0 ? (
            <p className="text-canopy-ink-900/60">No flags found for this status.</p>
          ) : (
            <div className="space-y-4">
              {flags.map((flag) => (
                <div key={flag._id} className="p-5 border border-canopy-mist-200 rounded-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-canopy-ink-900/60 mb-1">Source: {flag.source}</p>
                      <p className="text-sm text-canopy-ink-900/80 line-clamp-3">{flag.text}</p>
                      {flag.matchedKeywords?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {flag.matchedKeywords.map((kw) => (
                            <span key={kw} className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">{kw}</span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-canopy-ink-900/60 mt-2">Confidence: {(flag.confidence * 100).toFixed(1)}%</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {statusFilter === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(flag._id, 'approved')}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(flag._id, 'dismissed')}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                          >
                            <X className="w-4 h-4" /> Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminTradeFlags;
