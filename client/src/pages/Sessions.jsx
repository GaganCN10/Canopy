import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { logout } from '../features/auth/authSlice';
import { useToast } from '../components/Toast';

function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString();
}

function getBrowser(userAgent) {
  if (!userAgent) return 'Unknown';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function getOS(userAgent) {
  if (!userAgent) return 'Unknown';
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  return 'Unknown';
}

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { user, token } = useSelector((state) => state.auth);

  const fetchSessions = async () => {
    try {
      const { data } = await api.get('/sessions');
      setSessions(data.data || []);
    } catch (error) {
      showError('Failed to load sessions', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (sessionId) => {
    setRevokingId(sessionId);
    try {
      await api.delete(`/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      showSuccess('Session revoked');
    } catch (error) {
      showError('Failed to revoke session', error.response?.data?.message || 'Something went wrong');
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    if (!window.confirm('Revoke all other sessions? You will remain logged in on this device.')) return;
    try {
      await api.delete('/sessions');
      setSessions((prev) => prev.filter((s) => s._id === sessions[0]?._id));
      showSuccess('All other sessions revoked');
    } catch (error) {
      showError('Failed to revoke sessions', error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // ignore logout errors
    }
    dispatch(logout());
    navigate('/login');
  };

  const currentSessionId = sessions[0]?._id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sessions</h1>
        <div className="flex gap-2">
          <button
            onClick={handleRevokeAll}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            disabled={sessions.length <= 1}
          >
            Revoke all others
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Log out everywhere
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p>No active sessions.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const isCurrent = session._id === currentSessionId;
            return (
              <div
                key={session._id}
                className={`border rounded p-4 ${isCurrent ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {getOS(session.userAgent)} — {getBrowser(session.userAgent)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {session.ipAddress || 'Unknown IP'} • Last active: {formatDate(session.lastActivityAt)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Created: {formatDate(session.createdAt)} • Expires: {formatDate(session.expiresAt)}
                    </p>
                    {isCurrent && (
                      <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        Current session
                      </span>
                    )}
                  </div>
                  {!isCurrent && (
                    <button
                      onClick={() => handleRevoke(session._id)}
                      disabled={revokingId === session._id}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      {revokingId === session._id ? 'Revoking...' : 'Revoke'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
