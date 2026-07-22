import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { getTips, updateTipStatus } from '../features/sightings/tipApi';
import { StatusBadge } from '../components/ui';
import { PageHeader, EmptyState } from '../components/ui';

const STATUS_OPTIONS = ['new', 'under_review', 'actioned', 'closed'];

function AdminTips() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const loadTips = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getTips({ page, limit, status: statusFilter });
      setTips(result.data.tips);
      setTotal(result.data.total);
    } catch (err) {
      setError('Failed to load tips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTips();
  }, [page, statusFilter]);

  const totalPages = Math.ceil(total / limit);

  const handleStatusUpdate = async (tipId, newStatus) => {
    try {
      await updateTipStatus(tipId, { status: newStatus });
      loadTips();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Anti-Poaching Tips Review Queue"
            subtitle="Review and update the status of submitted anti-poaching intelligence."
            actions={
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="input-field w-auto"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            }
          />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-canopy-mist-200/30 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : tips.length === 0 ? (
            <EmptyState title="No tips found" description="The review queue is currently empty." />
          ) : (
            <div className="divide-y divide-canopy-mist-200">
              {tips.map((t) => (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 lg:p-8 hover:bg-canopy-sand-100/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-start gap-3 mb-3">
                        <AlertTriangle className="w-5 h-5 text-canopy-clay-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-display text-xl font-semibold text-canopy-forest-950">{t.title}</h3>
                          <p className="text-sm text-canopy-ink-900/60 mt-1">{t.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-canopy-ink-900/50 font-mono ml-8">
                        <span>Submitted: {new Date(t.createdAt).toLocaleString()}</span>
                        {t.location?.coordinates?.length === 2 && (
                          <>
                            <span>·</span>
                            <span>{t.location.coordinates[1].toFixed(4)}, {t.location.coordinates[0].toFixed(4)}</span>
                          </>
                        )}
                      </div>
                      {t.reviewNotes && (
                        <div className="mt-3 ml-8 p-3 rounded-xl bg-canopy-sand-100 text-sm text-canopy-ink-900/80">
                          <span className="font-semibold">Review note:</span> {t.reviewNotes}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 lg:ml-4">
                      {STATUS_OPTIONS.filter((s) => s !== t.status).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusUpdate(t._id, s)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-canopy-sand-100 text-canopy-forest-600 hover:bg-canopy-forest-600 hover:text-white transition-colors"
                        >
                          {s === 'actioned' && <CheckCircle className="w-4 h-4" />}
                          {s === 'under_review' && <Clock className="w-4 h-4" />}
                          {s === 'closed' && <XCircle className="w-4 h-4" />}
                          Mark {s.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="p-6 border-t border-canopy-mist-200 flex justify-between items-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-canopy-ink-900/70 font-medium">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminTips;
