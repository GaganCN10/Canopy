import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Heart, Activity } from 'lucide-react';
import { getRescueCaseById, updateRescueCaseStatus, addTreatmentLog } from '../features/sightings/rescueApi';
import Button from '../components/Button';
import { StatusBadge } from '../components/ui';
import { PageHeader } from '../components/ui';

function RescueCaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({ status: '', notes: '', weight: '', condition: '' });

  useEffect(() => {
    loadCase();
  }, [id]);

  const loadCase = async () => {
    setLoading(true);
    try {
      const result = await getRescueCaseById(id);
      setCaseData(result.data.case);
      setFormData({
        status: result.data.case.status,
        notes: '',
        weight: '',
        condition: '',
      });
    } catch (err) {
      console.error('Failed to load case', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await updateRescueCaseStatus(id, { status: formData.status });
      loadCase();
    } catch (err) {
      alert('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddTreatment = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await addTreatmentLog(id, { notes: formData.notes, weight: formData.weight, condition: formData.condition });
      setFormData({ ...formData, notes: '', weight: '', condition: '' });
      loadCase();
    } catch (err) {
      alert('Failed to add treatment log');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-canopy-forest-600" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-canopy-ink-900/70">Case not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-canopy-forest-950 to-canopy-forest-800 pt-16 lg:pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button onClick={() => navigate('/rescue')} className="text-white/80 hover:text-white flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Back to Cases
            </button>
          </div>
          <PageHeader
            title={caseData.caseNumber}
            subtitle={`Species: ${caseData.species?.name || 'Unknown'}`}
            actions={<StatusBadge status={caseData.status} />}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="card p-8 lg:p-10 mb-8">
          <h3 className="font-display text-xl font-semibold text-canopy-forest-950 mb-6">Case Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-canopy-ink-900/70">Rescue Center</p>
              <p className="font-medium text-canopy-forest-950">{caseData.center}</p>
            </div>
            <div>
              <p className="text-sm text-canopy-ink-900/70">Rescuer</p>
              <p className="font-medium text-canopy-forest-950">{caseData.rescuer?.firstName || 'Unknown'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-canopy-ink-900/70">Rescue Reason</p>
              <p className="font-medium text-canopy-forest-950">{caseData.rescueReason}</p>
            </div>
            {caseData.animalDetails && (
              <div className="sm:col-span-2">
                <p className="text-sm text-canopy-ink-900/70">Animal Details</p>
                <p className="font-medium text-canopy-forest-950">
                  {caseData.animalDetails.age && `Age: ${caseData.animalDetails.age}`}
                  {caseData.animalDetails.sex && ` | Sex: ${caseData.animalDetails.sex}`}
                  {caseData.animalDetails.weight && ` | Weight: ${caseData.animalDetails.weight}`}
                  {caseData.animalDetails.condition && ` | Condition: ${caseData.animalDetails.condition}`}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="card p-8 lg:p-10 mb-8">
          <h3 className="font-display text-xl font-semibold text-canopy-forest-950 mb-6">Update Status</h3>
          <div className="flex gap-3">
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input-field flex-1"
            >
              {['intake', 'in_care', 'released', 'deceased'].map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>
              ))}
            </select>
            <button onClick={handleUpdateStatus} disabled={updating} className="btn-primary">
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>

        <div className="card p-8 lg:p-10 mb-8">
          <h3 className="font-display text-xl font-semibold text-canopy-forest-950 mb-6">Add Treatment Log</h3>
          <form onSubmit={handleAddTreatment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Weight</label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 45 kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Condition</label>
                <input
                  type="text"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Stable"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-canopy-ink-900 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field"
                rows="3"
                required
              />
            </div>
            <button type="submit" disabled={updating} className="btn-primary">
              {updating ? 'Adding...' : 'Add Treatment Log'}
            </button>
          </form>
        </div>

        {caseData.treatmentLogs?.length > 0 && (
          <div className="card p-8 lg:p-10">
            <h3 className="font-display text-xl font-semibold text-canopy-forest-950 mb-6">Treatment History</h3>
            <div className="space-y-4">
              {caseData.treatmentLogs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="border-l-2 border-canopy-forest-400 pl-4 py-2"
                >
                  <p className="text-sm text-canopy-ink-900/70">{new Date(log.date).toLocaleString()}</p>
                  <p className="font-medium text-canopy-forest-950 mt-1">{log.notes}</p>
                  {log.weight && <p className="text-sm text-canopy-ink-900/70">Weight: {log.weight}</p>}
                  {log.condition && <p className="text-sm text-canopy-ink-900/70">Condition: {log.condition}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RescueCaseDetail;
