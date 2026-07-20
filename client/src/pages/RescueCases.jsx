import React from 'react';
import { useState, useEffect } from 'react';
import { getRescueCases, updateRescueCaseStatus, addTreatmentLog } from '../features/sightings/rescueApi';

const STATUS_OPTIONS = ['intake', 'in_care', 'released', 'deceased'];

function RescueCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedCase, setSelectedCase] = useState(null);
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [treatment, setTreatment] = useState('');
  const limit = 20;

  const loadCases = async () => {
    setLoading(true);
    try {
      const result = await getRescueCases({ page, limit, status: statusFilter });
      setCases(result.data.cases);
      setTotal(result.data.total);
    } catch (err) {
      console.error('Failed to load rescue cases', err);
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
      alert('Update failed');
    }
  };

  const handleAddTreatment = async (e) => {
    e.preventDefault();
    if (!selectedCase || !treatmentNotes) return;
    try {
      await addTreatmentLog(selectedCase._id, { notes: treatmentNotes, treatment });
      setTreatmentNotes('');
      setTreatment('');
      setSelectedCase(null);
      loadCases();
    } catch (err) {
      alert('Failed to add treatment log');
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6">Rescue & Rehabilitation Cases</h1>
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
            {cases.map((c) => (
              <div key={c._id} className="border rounded p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{c.caseNumber}</h2>
                    <p className="text-sm text-slate-700">Species: {c.species?.name || 'Unknown'}</p>
                    <p className="text-sm text-slate-700">Center: {c.center}</p>
                    <p className="text-xs text-slate-500">Status: {c.status.replace('_', ' ')}</p>
                    {c.treatmentLogs?.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold">Treatment Logs:</p>
                        {c.treatmentLogs.map((log, idx) => (
                          <p key={idx} className="text-xs text-slate-600">- {log.notes} ({new Date(log.date).toLocaleDateString()})</p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {STATUS_OPTIONS.filter((s) => s !== c.status).map((s) => (
                      <button key={s} onClick={() => handleStatusUpdate(c._id, s)} className="text-xs px-2 py-1 bg-slate-200 rounded hover:bg-slate-300">
                        Set {s.replace('_', ' ')}
                      </button>
                    ))}
                    <button onClick={() => setSelectedCase(c)} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                      Add Treatment
                    </button>
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
          {selectedCase && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">Add Treatment Log</h3>
                <form onSubmit={handleAddTreatment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea value={treatmentNotes} onChange={(e) => setTreatmentNotes(e.target.value)} className="w-full border rounded p-2" rows="3" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Treatment</label>
                    <input type="text" value={treatment} onChange={(e) => setTreatment(e.target.value)} className="w-full border rounded p-2" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-canopy-600 text-white px-4 py-2 rounded">Save</button>
                    <button type="button" onClick={() => setSelectedCase(null)} className="border px-4 py-2 rounded">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RescueCases;
