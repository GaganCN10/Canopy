import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { getSpecies } from '../features/sightings/speciesApi';
import { ConservationBadge } from '../components/ui';
import { PageHeader, EmptyState } from '../components/ui';

function Species() {
  const [speciesList, setSpeciesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const loadSpecies = async () => {
    setLoading(true);
    try {
      const result = await getSpecies({ page, limit, search });
      setSpeciesList(result.data.species);
      setTotal(result.data.total);
    } catch (err) {
      console.error('Failed to load species', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecies();
  }, [page, search]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="Species Catalog"
            subtitle="Explore and learn about the species tracked by the Canopy conservation community."
            actions={
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/50" />
                  <input
                    type="text"
                    placeholder="Search species..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="input-field pl-12 w-full sm:w-80"
                  />
                </div>
                <button className="btn-secondary hidden sm:flex">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
              </div>
            }
          />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-[4/5] bg-canopy-mist-200/50 rounded-t-3xl" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-canopy-mist-200/50 rounded w-3/4" />
                  <div className="h-4 bg-canopy-mist-200/50 rounded w-1/2" />
                  <div className="h-4 bg-canopy-mist-200/50 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : speciesList.length === 0 ? (
          <EmptyState
            title="No species found"
            description="Try adjusting your search or check back later for new entries."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {speciesList.map((s, index) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card overflow-hidden group cursor-pointer hover:shadow-ambient-lg transition-all duration-300"
                >
                  <div className="aspect-[4/5] bg-canopy-sand-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-canopy-forest-950/70 via-transparent to-transparent z-10" />
                    <div className="absolute top-4 right-4 z-20">
                      <ConservationBadge status={s.conservationStatus} />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <h3 className="font-display text-xl font-semibold text-white mb-1">{s.name}</h3>
                      {s.scientificName && (
                        <p className="text-sm text-white/80 italic">{s.scientificName}</p>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-canopy-ink-900/70 line-clamp-2 leading-relaxed">
                      {s.description || 'No description available.'}
                    </p>
                    {s.region?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {s.region.slice(0, 3).map((r) => (
                          <span key={r} className="text-xs px-3 py-1 rounded-full bg-canopy-sand-100 text-canopy-forest-600 font-medium">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-12 flex justify-between items-center">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-canopy-ink-900/70 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Species;
