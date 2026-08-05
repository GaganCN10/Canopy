import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertTriangle } from 'lucide-react';
import { scanTradeText } from '../features/ml/mlApi';

function TradeScanner() {
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await scanTradeText({ text, source: source || 'manual' });
      setResult(response.data);
    } catch (err) {
      console.error('Trade scan failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-6">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-display font-semibold text-white mb-2">Wildlife Trade Scanner</h1>
          <p className="text-white/80">Scan public listings or text for potential illegal wildlife trade indicators.</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="card p-6">
          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Source (optional)</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g., public-market-listing, forum-post"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Text to scan</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                className="input-field"
                placeholder="Paste listing text here..."
              />
            </div>
            <button type="submit" disabled={loading || !text.trim()} className="btn-primary disabled:opacity-50">
              <Search className="w-4 h-4" />
              Scan Text
            </button>
          </form>

          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <div className={`p-5 rounded-xl border ${result.flagged ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-6 h-6 ${result.flagged ? 'text-red-600' : 'text-green-600'}`} />
                  <div>
                    <p className={`font-semibold ${result.flagged ? 'text-red-800' : 'text-green-800'}`}>
                      {result.flagged ? 'Potential illegal trade indicators detected' : 'No strong indicators detected'}
                    </p>
                    <p className={`text-sm ${result.flagged ? 'text-red-700' : 'text-green-700'}`}>
                      Confidence: {(result.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                {result.matchedKeywords?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.matchedKeywords.map((kw) => (
                      <span key={kw} className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-800 font-medium">{kw}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TradeScanner;
