import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSightings } from '../features/sightings/sightingApi';
import { StatusBadge } from '../components/ui';
import { PageHeader, EmptyState } from '../components/ui';
import Button from '../components/Button';

function SightingsList() {
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const navigate = useNavigate();

  const loadSightings = async () => {
    setLoading(true);
    try {
      const result = await getSightings({ page, limit });
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
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Sightings"
            subtitle="Browse and explore wildlife sightings across the region."
            actions={
              <Button onClick={() => navigate('/report-sighting')} variant="primary">
                Report Sighting
              </Button>
            }
          />
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
        ) : sightings.length === 0 ? (
          <EmptyState
            title="No sightings yet"
            description="Be the first to report a wildlife sighting in your area."
            action={
              <Button onClick={() => navigate('/report-sighting')} variant="primary">
                Report Sighting
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sightings.map((s, index) => (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card p-6 hover:shadow-ambient-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-canopy-forest-950">
                      {s.species?.name || 'Unknown Species'}
                    </h3>
                    <p className="text-sm text-canopy-ink-900/70 mt-1">
                      Reported by {s.reporter?.firstName || 'Anonymous'} {s.reporter?.lastName || ''}
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-canopy-ink-900/70">
                    <Calendar className="w-4 h-4 text-canopy-forest-400" />
                    <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-canopy-ink-900/70">
                    <MapPin className="w-4 h-4 text-canopy-forest-400" />
                    <span>{s.lat?.toFixed(4)}, {s.lng?.toFixed(4)}</span>
                  </div>
                </div>

                {s.notes && (
                  <p className="text-sm text-canopy-ink-900/80 line-clamp-2 mb-4">{s.notes}</p>
                )}

                {s.images?.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {s.images.slice(0, 3).map((img, i) => (
                      <img
                        key={i}
                        src={img.url}
                        alt=""
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                    ))}
                  </div>
                )}
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

export default SightingsList;
