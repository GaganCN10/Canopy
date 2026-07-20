import React from 'react';
import { useState, useEffect } from 'react';
import { getSpecies, createSpecies, updateSpecies, deleteSpecies, uploadSpeciesImage } from '../features/sightings/speciesApi';

const STATUS_OPTIONS = ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'DD', 'NE'];

function AdminSpecies() {
  const [speciesList, setSpeciesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    scientificName: '',
    conservationStatus: 'DD',
    description: '',
    region: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadSpecies = async () => {
    setLoading(true);
    try {
      const result = await getSpecies({ limit: 100 });
      setSpeciesList(result.data.species);
    } catch (err) {
      setError('Failed to load species');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecies();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', scientificName: '', conservationStatus: 'DD', description: '', region: '' });
    setEditing(null);
    setImageFile(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      let imageUrl = editing?.images?.[0]?.url;
      if (imageFile) {
        const uploadForm = new FormData();
        uploadForm.append('image', imageFile);
        const uploadResult = await uploadSpeciesImage(uploadForm);
        imageUrl = uploadResult.data.url;
      }

      const payload = {
        ...formData,
        region: formData.region ? formData.region.split(',').map((r) => r.trim()) : [],
        images: imageUrl ? [{ url: imageUrl, filename: imageFile?.name || editing?.images?.[0]?.filename }] : [],
      };

      if (editing) {
        await updateSpecies(editing._id, payload);
        setMessage('Species updated successfully');
      } else {
        await createSpecies(payload);
        setMessage('Species created successfully');
      }
      resetForm();
      loadSpecies();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleEdit = (s) => {
    setEditing(s);
    setFormData({
      name: s.name,
      scientificName: s.scientificName || '',
      conservationStatus: s.conservationStatus,
      description: s.description || '',
      region: s.region?.join(', ') || '',
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteSpecies(id);
      loadSpecies();
    } catch (err) {
      setError('Delete failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Species</h1>
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded bg-white">
        <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Species' : 'Add Species'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Scientific Name</label>
            <input type="text" name="scientificName" value={formData.scientificName} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Conservation Status</label>
            <select name="conservationStatus" value={formData.conservationStatus} onChange={handleChange} className="w-full border rounded p-2">
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Region (comma-separated)</label>
            <input type="text" name="region" value={formData.region} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border rounded p-2" rows="3" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full border rounded p-2" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button type="submit" className="bg-canopy-600 text-white px-4 py-2 rounded hover:bg-canopy-700">{editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" onClick={resetForm} className="border px-4 py-2 rounded">Cancel</button>}
        </div>
      </form>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {speciesList.map((s) => (
                <tr key={s._id}>
                  <td className="border p-2">{s.name}</td>
                  <td className="border p-2">{s.conservationStatus}</td>
                  <td className="border p-2">
                    <button onClick={() => handleEdit(s)} className="text-blue-600 hover:underline mr-2">Edit</button>
                    <button onClick={() => handleDelete(s._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminSpecies;
