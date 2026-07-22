import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users as UsersIcon, Search, Shield, Ban, CheckCircle } from 'lucide-react';
import { listUsers, changeUserRole, banUser } from '../features/admin/userApi';
import { StatusBadge } from '../components/ui';
import { PageHeader, EmptyState } from '../components/ui';

const ROLES = ['public', 'citizen', 'ranger', 'researcher', 'rescue', 'admin'];

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listUsers({ page, limit, search });
      setUsers(result.data.users);
      setTotal(result.data.total);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const totalPages = Math.ceil(total / limit);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await changeUserRole(userId, newRole);
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleBanToggle = async (userId) => {
    try {
      await banUser(userId);
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ban status');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader
            title="User Management"
            subtitle="Manage user roles, permissions, and account status across the platform."
            actions={
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/50" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="input-field pl-12 w-full sm:w-80"
                />
              </div>
            }
          />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-canopy-mist-200/30 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <EmptyState title="No users found" description="Try adjusting your search criteria." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-canopy-mist-200">
                      <th className="text-left px-6 py-4 text-sm font-semibold text-canopy-ink-900/70">User</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-canopy-ink-900/70">Role</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-canopy-ink-900/70">Status</th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-canopy-ink-900/70">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-canopy-mist-200">
                    {users.map((u) => (
                      <motion.tr
                        key={u._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-canopy-sand-100/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-canopy-forest-950">{u.firstName} {u.lastName}</p>
                            <p className="text-sm text-canopy-ink-900/60">{u.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="input-field text-sm py-2 w-auto"
                          >
                            {ROLES.map((role) => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={u.isBanned ? 'closed' : 'verified'} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleBanToggle(u._id)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                              u.isBanned
                                ? 'bg-canopy-moss-300/20 text-canopy-forest-600 hover:bg-canopy-moss-300/30'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                          >
                            {u.isBanned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            {u.isBanned ? 'Unban' : 'Ban'}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
