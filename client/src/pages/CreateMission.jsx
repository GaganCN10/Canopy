import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin } from 'lucide-react';
import { createMission } from '../features/missions/missionApi';
import { useToast } from '../components/Toast';

const TOPICS = [
  { value: 'cleanup', label: 'Cleanup' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'awareness_education', label: 'Awareness/Education' },
  { value: 'data_tagging', label: 'Data Tagging' },
  { value: 'rescue_support', label: 'Rescue Support' },
  { value: 'advocacy', label: 'Advocacy' },
  { value: 'other', label: 'Other' },
];

function CreateMission() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: 'cleanup',
    locationType: 'remote',
    address: '',
    joinType: 'open',
    memberCap: '',
    targetDate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        memberCap: formData.memberCap ? parseInt(formData.memberCap, 10) : null,
        targetDate: formData.targetDate || null,
      };

      if (payload.locationType === 'onsite' || payload.locationType === 'hybrid') {
        payload.location = {
          type: 'Point',
          coordinates: [0, 0],
        };
        payload.address = formData.address;
      }

      const result = await createMission(payload);
      showSuccess('Mission created', 'Your mission has been created successfully.');
      navigate(`/missions/${result.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create mission');
    } finally {
      setLoading(false);
    }
  };

  const isOnsite = formData.locationType === 'onsite' || formData.locationType === 'hybrid';

  return (
    <div className="min-h-screen py-16 lg:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8 lg:p-10">
          <button
            onClick={() => navigate('/missions')}
            className="flex items-center gap-2 text-canopy-forest-600 hover:text-canopy-forest-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Missions
          </button>

          <h1 className="text-3xl font-display font-semibold text-canopy-forest-950 mb-2">Create Mission</h1>
          <p className="text-canopy-ink-900/70 mb-8">Create a new conservation mission and invite others to join.</p>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Weekly beach cleanup — Kochi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input-field resize-none"
                placeholder="Describe the mission goals and what volunteers will do..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Topic</label>
              <select
                name="topic"
                value={formData.topic}
                onChange={handleChange}
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
                value={formData.locationType}
                onChange={handleChange}
                className="input-field"
              >
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {isOnsite && (
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-canopy-forest-600/40" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field pl-12"
                    placeholder="Enter the mission address"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Join Type</label>
              <select
                name="joinType"
                value={formData.joinType}
                onChange={handleChange}
                className="input-field"
              >
                <option value="open">Open - anyone can join</option>
                <option value="request">Request - lead approval required</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Member Cap (optional)</label>
              <input
                type="number"
                name="memberCap"
                value={formData.memberCap}
                onChange={handleChange}
                className="input-field"
                placeholder="No limit"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Target Date (optional)</label>
              <input
                type="date"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? 'Creating...' : 'Create Mission'}
              </button>
              <button type="button" onClick={() => navigate('/missions')} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateMission;
