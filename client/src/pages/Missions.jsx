import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Users, Calendar, Filter } from 'lucide-react';
import { getMissions } from '../features/missions/missionApi';

const TOPICS = [
  { value: '', label: 'All Topics' },
  { value: 'cleanup', label: 'Cleanup' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'awareness_education', label: 'Awareness/Education' },
  { value: 'data_tagging', label: 'Data Tagging' },
  { value: 'rescue_support', label: 'Rescue Support' },
  { value: 'advocacy', label: 'Advocacy' },
  { value: 'other', label: 'Other' },
];

const LOCATION_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
];

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

function Missions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    topic: '',
    locationType: '',
    status: '',
    remoteOnly: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadMissions();
  }, [filters]);

  const loadMissions = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { ...filters };
      if (filters.remoteOnly) {
        params.remoteOnly = 'true';
      }
      const result = await getMissions(params);
      setMissions(result.data || []);
    } catch (err) {
      setError('Failed to load missions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning':
        return 'bg-amber-50 text-amber-700';
      case 'active':
        return 'bg-canopy-moss-300/20 text-canopy-forest-600';
      case 'completed':
        return 'bg-blue-50 text-blue-700';
      case 'archived':
        return 'bg-canopy-mist-200 text-canopy-ink-900/70';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-canopy-sand-100 text-canopy-ink-900/70';
    }
  };

  const getLocationTypeLabel = (type) => {
    switch (type) {
      case 'remote':
        return 'Remote';
      case 'onsite':
        return 'On-site';
      case 'hybrid':
        return 'Hybrid';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen py-16 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl lg:text-4xl font-display font-semibold text-canopy-forest-950 mb-3">
              Conservation Missions
            </h1>
            <p className="text-lg text-canopy-ink-900/70 max-w-2xl">
              Discover and join conservation missions around the world. From local cleanups to remote data-tagging sprints, there's a place for everyone.
            </p>
          </div>
          <button
            onClick={() => navigate('/missions/create')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Mission
          </button>
        </div>

        <div className="mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-canopy-forest-600 hover:text-canopy-forest-800 transition-colors"
          >
            <Filter className="w-5 h-5" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-6 bg-white border border-canopy-mist-200 rounded-2xl"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Topic</label>
                  <select
                    name="topic"
                    value={filters.topic}
                    onChange={handleFilterChange}
                    className="input-field"
                  >
                    {TOPICS.map((topic) => (
                      <option key={topic.value} value={topic.value}>
                        {topic.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Location Type</label>
                  <select
                    name="locationType"
                    value={filters.locationType}
                    onChange={handleFilterChange}
                    className="input-field"
                  >
                    {LOCATION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Status</label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="input-field"
                  >
                    {STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.remoteOnly}
                      onChange={(e) => setFilters({ ...filters, remoteOnly: e.target.checked })}
                      className="w-4 h-4 text-canopy-forest-600 rounded border-canopy-mist-200 focus:ring-canopy-forest-600"
                    />
                    <span className="text-sm text-canopy-ink-900">Remote only</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-canopy-ink-900/60">Loading missions...</div>
        ) : missions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-canopy-ink-900/60 mb-4">No missions found matching your criteria.</p>
            <button
              onClick={() => setFilters({ topic: '', locationType: '', status: '', remoteOnly: false })}
              className="text-canopy-forest-600 hover:text-canopy-forest-800 underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map((mission) => (
              <motion.div
                key={mission._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/missions/${mission._id}`)}
                className="card p-6 cursor-pointer hover:shadow-ambient-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(mission.status)}`}>
                    {mission.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-canopy-ink-900/50 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {getLocationTypeLabel(mission.locationType)}
                  </span>
                </div>

                <h3 className="font-display text-xl font-semibold text-canopy-forest-950 mb-2 line-clamp-2">
                  {mission.title}
                </h3>
                <p className="text-sm text-canopy-ink-900/70 mb-4 line-clamp-3">
                  {mission.description}
                </p>

                <div className="flex items-center justify-between text-xs text-canopy-ink-900/50">
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {mission.memberCount || 0} members
                  </span>
                  {mission.targetDate && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(mission.targetDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Missions;
