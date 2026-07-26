import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Trash2 } from 'lucide-react';
import { getInviteCodes, createInviteCode as createInviteCodeApi } from '../features/role-requests/roleRequestApi';
import { useToast } from '../components/Toast';

function AdminInviteCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getInviteCodes();
      setCodes(result.data || []);
    } catch (err) {
      setError('Failed to load invite codes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setCreating(true);
      await createInviteCodeApi(30);
      showSuccess('Invite code created', 'A new Ranger invite code has been generated.');
      loadCodes();
    } catch (err) {
      showError('Failed to create invite code', err.response?.data?.message || 'Please try again');
    } finally {
      setCreating(false);
    }
  };

  const getStatus = (code) => {
    if (code.usedBy) return { label: 'Used', color: 'bg-green-50 text-green-700' };
    if (code.expiresAt < new Date()) return { label: 'Expired', color: 'bg-red-50 text-red-700' };
    return { label: 'Active', color: 'bg-amber-50 text-amber-700' };
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-display font-semibold text-white mb-3">Invite Codes</h1>
              <p className="text-lg text-canopy-sand-200 max-w-2xl">Generate and manage Ranger invite codes.</p>
            </div>
            <button onClick={handleCreate} disabled={creating} className="btn-primary">
              <Plus className="w-5 h-5 mr-2" />
              {creating ? 'Creating...' : 'Generate Code'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="card p-6 lg:p-8">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 text-canopy-ink-900/60">Loading invite codes...</div>
          ) : codes.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-canopy-ink-900/60">No invite codes generated yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {codes.map((code) => {
                const status = getStatus(code);
                return (
                  <div key={code._id} className="flex items-center justify-between p-4 bg-canopy-sand-50 rounded-xl">
                    <div>
                      <p className="font-mono font-semibold text-canopy-forest-950">{code.code}</p>
                      <p className="text-sm text-canopy-ink-900/70">
                        Issued by: {code.issuedBy?.firstName} {code.issuedBy?.lastName}
                      </p>
                      <p className="text-xs text-canopy-ink-900/50">
                        Expires: {new Date(code.expiresAt).toLocaleDateString()}
                      </p>
                      {code.usedBy && (
                        <p className="text-xs text-canopy-ink-900/50">
                          Used by: {code.usedBy?.firstName} {code.usedBy?.lastName}
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminInviteCodes;
