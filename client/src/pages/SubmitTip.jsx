import React from 'react';
import { useState } from 'react';
import { submitTip } from '../features/sightings/tipApi';

function SubmitTip() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lat: '',
    lng: '',
    submitterEmail: '',
    submitterPhone: '',
    isAnonymous: true,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await submitTip(formData);
      setMessage('Tip submitted successfully. Thank you for helping protect wildlife.');
      setFormData({ title: '', description: '', lat: '', lng: '', submitterEmail: '', submitterPhone: '', isAnonymous: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-2">Report a Poaching Tip</h1>
      <p className="text-sm text-slate-600 mb-6">Your report is anonymous by default. Provide contact info only if you wish to be reached.</p>
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border rounded p-2" rows="4" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Latitude (optional)</label>
            <input type="number" step="any" name="lat" value={formData.lat} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitude (optional)</label>
            <input type="number" step="any" name="lng" value={formData.lng} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isAnonymous" checked={formData.isAnonymous} onChange={handleChange} />
            <span>Submit anonymously</span>
          </label>
        </div>
        {!formData.isAnonymous && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Your Email</label>
              <input type="email" name="submitterEmail" value={formData.submitterEmail} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Your Phone (optional)</label>
              <input type="tel" name="submitterPhone" value={formData.submitterPhone} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
          </>
        )}
        <button type="submit" disabled={loading} className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Tip'}
        </button>
      </form>
    </div>
  );
}

export default SubmitTip;
