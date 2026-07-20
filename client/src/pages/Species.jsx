import React from 'react';
import { useState, useEffect } from 'react';
import { getSpecies } from '../features/sightings/speciesApi';

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
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6">Species Catalog</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search species..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border rounded p-2 w-full max-w-md"
        />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {speciesList.map((s) => (
              <div key={s._id} className="border rounded p-4 bg-white shadow-sm">
                <h2 className="text-xl font-semibold">{s.name}</h2>
                {s.scientificName && <p className="text-sm text-slate-600 italic">{s.scientificName}</p>}
                <p className="text-sm mt-2 text-slate-700">{s.description || 'No description available.'}</p>
                <p className="text-xs mt-2 text-slate-500">Status: {s.conservationStatus}</p>
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

export default Species;
