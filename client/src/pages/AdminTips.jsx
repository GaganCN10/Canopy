import React from 'react';
import { useState, useEffect } from 'react';
import { getTips, updateTipStatus } from '../features/sightings/tipApi';

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
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">Anti-Poaching Tips Review Queue</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="mb-4">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="border rounded p-2">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="space-y-4">
            {tips.map((t) => (
              <div key={t._id} className="border rounded p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{t.title}</h2>
                    <p className="text-sm text-slate-700 mt-2">{t.description}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Status: <span className="font-semibold">{t.status.replace('_', ' ')}</span>
                      {' '}· Submitted: {new Date(t.createdAt).toLocaleString()}
                    </p>
                    {t.location?.coordinates?.length === 2 && (
                      <p className="text-xs text-slate-500">Location: {t.location.coordinates[1].toFixed(4)}, {t.location.coordinates[0].toFixed(4)}</p>
                    )}
                    {t.reviewNotes && <p className="text-xs text-slate-500 mt-1">Review: {t.reviewNotes}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    {STATUS_OPTIONS.filter((s) => s !== t.status).map((s) => (
                      <button key={s} onClick={() => handleStatusUpdate(t._id, s)} className="text-xs px-2 py-1 bg-slate-200 rounded hover:bg-slate-300">
                        Mark {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex justify-between">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded disabled:opacity-50">Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border rounded disabled:opacity-50">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminTips;
