import React from 'react';
import { useState, useEffect } from 'react';
import { getSightings, voteSighting } from '../features/sightings/sightingApi';

function Sightings() {
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const loadSightings = async () => {
    setLoading(true);
    try {
      const result = await getSightings({ page, limit, species: speciesFilter, status: statusFilter });
      setSightings(result.data.sightings);
      setTotal(result.data.total);
    } catch (err) {
      console.error('Failed to load sightings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSightings();
  }, [page, speciesFilter, statusFilter]);

  const totalPages = Math.ceil(total / limit);

  const handleVote = async (id, vote) => {
    try {
      await voteSighting(id, vote);
      loadSightings();
    } catch (err) {
      alert('Vote failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sightings</h1>
      </div>
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Filter by species ID..."
          value={speciesFilter}
          onChange={(e) => { setSpeciesFilter(e.target.value); setPage(1); }}
          className="border rounded p-2"
        />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="border rounded p-2">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="space-y-4">
            {sightings.map((s) => (
              <div key={s._id} className="border rounded p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{s.species?.name || 'Unknown Species'}</h2>
                    <p className="text-sm text-slate-600 italic">{s.species?.scientificName}</p>
                    <p className="text-sm text-slate-700 mt-2">{s.notes || 'No notes provided.'}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Status: <span className={`font-semibold ${s.status === 'verified' ? 'text-green-600' : s.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{s.status}</span>
                      {' '}· Votes: {s.verificationCount}
                    </p>
                    {s.images?.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {s.images.map((img, idx) => (
                          <img key={idx} src={img.url} alt="" className="w-20 h-20 object-cover rounded" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleVote(s._id, 'upvote')} className="text-green-600 hover:bg-green-50 px-3 py-1 rounded border">Upvote</button>
                    <button onClick={() => handleVote(s._id, 'downvote')} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded border">Downvote</button>
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

export default Sightings;
