import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Heart, Activity, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getRescueCases, updateRescueCaseStatus } from '../features/sightings/rescueApi';
import { StatusBadge } from '../components/ui';
import { PageHeader, EmptyState } from '../components/ui';
import Button from '../components/Button';
import { useToast } from '../components/Toast';
import { getErrorMessage } from '../utils/errors';

const STATUS_OPTIONS = ['intake', 'in_care', 'released', 'deceased'];
const COLUMNS = [
  { id: 'all', label: 'All Cases', icon: Activity },
  ...STATUS_OPTIONS.map((status) => ({
    id: status,
    label: status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    icon: status === 'intake' ? Plus : status === 'in_care' ? Activity : status === 'released' ? CheckCircle : XCircle,
  })),
];

function RescueCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const navigate = useNavigate();
  const { showError } = useToast();

  const loadCases = async () => {
    setLoading(true);
    try {
      const result = await getRescueCases({ page, limit, status: statusFilter });
      setCases(result.data.cases);
      setTotal(result.data.total);
    } catch (err) {
      const errorInfo = getErrorMessage(err);
      showError(errorInfo.title, errorInfo.message, errorInfo.remedy);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, [page, statusFilter]);

  const totalPages = Math.ceil(total / limit);

  const handleStatusUpdate = async (caseId, newStatus) => {
    try {
      await updateRescueCaseStatus(caseId, { status: newStatus });
      loadCases();
    } catch (err) {
      const errorInfo = getErrorMessage(err);
      showError(errorInfo.title, errorInfo.message, errorInfo.remedy);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Rescue & Rehabilitation"
            subtitle="Track and manage wildlife rescue cases from intake to release."
            actions={
              <Button onClick={() => navigate('/rescue/new')} variant="clay">
                <Plus className="w-5 h-5 mr-2" />
                New Case
              </Button>
            }
          />

          <div className="flex flex-wrap gap-3">
            {COLUMNS.map((col) => (
              <button
                key={col.id}
                onClick={() => { setStatusFilter(col.id === 'all' ? '' : col.id); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  (col.id === 'all' && !statusFilter) || statusFilter === col.id
                    ? 'bg-white text-canopy-forest-800'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {col.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-6 bg-canopy-mist-200/50 rounded w-1/2 mb-4" />
                <div className="h-4 bg-canopy-mist-200/50 rounded w-3/4 mb-2" />
                <div className="h-4 bg-canopy-mist-200/50 rounded w-full" />
              </div>
            ))}
          </div>
        ) : cases.length === 0 ? (
          <EmptyState
            title="No rescue cases found"
            description="Create a new case to start tracking wildlife rescue operations."
            action={
              <Button onClick={() => navigate('/rescue/new')} variant="primary">
                <Plus className="w-5 h-5 mr-2" />
                Create Case
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c, index) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card p-6 hover:shadow-ambient-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-canopy-forest-950">{c.caseNumber}</h3>
                    <p className="text-sm text-canopy-ink-900/70 mt-1">Species: {c.species?.name || 'Unknown'}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-canopy-ink-900/70">
                    <Activity className="w-4 h-4 text-canopy-forest-400" />
                    <span>Center: {c.center}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-canopy-ink-900/70">
                    <Heart className="w-4 h-4 text-canopy-forest-400" />
                    <span>Rescuer: {c.rescuer?.firstName || 'Unknown'}</span>
                  </div>
                </div>

                {c.treatmentLogs?.length > 0 && (
                  <div className="mb-4 p-3 rounded-xl bg-canopy-sand-100">
                    <p className="text-xs font-semibold text-canopy-ink-900/70 mb-1">Latest Treatment</p>
                    <p className="text-sm text-canopy-ink-900/80">{c.treatmentLogs[c.treatmentLogs.length - 1].notes}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.filter((s) => s !== c.status).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusUpdate(c._id, s)}
                      className="text-xs px-3 py-1.5 rounded-full bg-canopy-sand-100 text-canopy-forest-600 hover:bg-canopy-forest-600 hover:text-white transition-colors"
                    >
                      Set {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-between items-center">
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
  );
}

export default RescueCases;
