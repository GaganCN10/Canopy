import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getSightings, voteSighting } from '../features/sightings/sightingApi';
import { StatusBadge } from '../components/ui';
import { PageHeader } from '../components/ui';

function Sightings() {
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

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
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Sightings"
            subtitle="Browse and verify wildlife observations from the Canopy community."
            actions={
              <>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/50" />
                  <input
                    type="text"
                    placeholder="Filter by species..."
                    value={speciesFilter}
                    onChange={(e) => { setSpeciesFilter(e.target.value); setPage(1); }}
                    className="input-field pl-12 w-full sm:w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="input-field w-auto"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
                {isAuthenticated && (
                  <button onClick={() => navigate('/sightings/report')} className="btn-clay">
                    <Plus className="w-5 h-5 mr-2" />
                    Report
                  </button>
                )}
              </>
            }
          />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 bg-canopy-mist-200/30 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : sightings.length === 0 ? (
            <EmptyState
              title="No sightings found"
              description="Be the first to report a wildlife observation in your area."
              action={isAuthenticated && (
                <button onClick={() => navigate('/sightings/report')} className="btn-primary">
                  <Plus className="w-5 h-5 mr-2" />
                  Report a Sighting
                </button>
              )}
            />
          ) : (
            <div className="divide-y divide-canopy-mist-200">
              {sightings.map((s) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 hover:bg-canopy-sand-100/50 transition-colors"
                >
                  <div className="flex items-start gap-6">
                    {s.images?.length > 0 && (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-canopy-sand-100">
                        <img src={s.images[0].url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-display text-lg font-semibold text-canopy-forest-950">
                            {s.species?.name || 'Unknown Species'}
                          </h3>
                          {s.species?.scientificName && (
                            <p className="text-sm text-canopy-ink-900/60 italic">{s.species.scientificName}</p>
                          )}
                        </div>
                        <StatusBadge status={s.status} />
                      </div>
                      {s.notes && (
                        <p className="text-sm text-canopy-ink-900/70 line-clamp-2 mb-3">{s.notes}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-canopy-ink-900/50 font-mono">
                        <span>{s.location?.coordinates?.length === 2
                          ? `${s.location.coordinates[1].toFixed(4)}, ${s.location.coordinates[0].toFixed(4)}`
                          : 'No location'}
                        </span>
                        <span>·</span>
                        <span>{new Date(s.timestamp).toLocaleDateString()}</span>
                        <span>·</span>
                        <span>Votes: {s.verificationCount}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleVote(s._id, 'upvote')}
                        className="p-2 rounded-full hover:bg-canopy-moss-300/20 text-canopy-forest-600 transition-colors"
                        title="Upvote"
                      >
                        <ThumbsUp className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleVote(s._id, 'downvote')}
                        className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors"
                        title="Downvote"
                      >
                        <ThumbsDown className="w-5 h-5" />
                      </button>
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

export default Sightings;
