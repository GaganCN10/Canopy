import React from 'react';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import api from '../api/axiosInstance';

const COLORS = ['#22c55e', '#16a34a', '#15803d', '#f59e0b', '#ef4444', '#3b82f6'];

function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);
  const [sightingsOverTime, setSightingsOverTime] = useState([]);
  const [speciesDistribution, setSpeciesDistribution] = useState([]);
  const [verificationStats, setVerificationStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, sightingsRes, speciesRes, verificationRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/sightings-over-time?days=30'),
        api.get('/analytics/species-distribution'),
        api.get('/analytics/verification-stats'),
      ]);
      setSummary(summaryRes.data.data);
      setSightingsOverTime(sightingsRes.data.data);
      setSpeciesDistribution(speciesRes.data.data);
      setVerificationStats(verificationRes.data.data);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="border rounded p-4 bg-white shadow-sm">
            <p className="text-sm text-slate-600">Total Sightings</p>
            <p className="text-2xl font-bold">{summary.totalSightings}</p>
          </div>
          <div className="border rounded p-4 bg-white shadow-sm">
            <p className="text-sm text-slate-600">Verified</p>
            <p className="text-2xl font-bold">{summary.verifiedSightings}</p>
          </div>
          <div className="border rounded p-4 bg-white shadow-sm">
            <p className="text-sm text-slate-600">Total Tips</p>
            <p className="text-2xl font-bold">{summary.totalTips}</p>
          </div>
          <div className="border rounded p-4 bg-white shadow-sm">
            <p className="text-sm text-slate-600">HWC Incidents</p>
            <p className="text-2xl font-bold">{summary.totalHWC}</p>
          </div>
        </div>
      )}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Sightings Over Time (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sightingsOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#22c55e" name="Sightings" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Species Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={speciesDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {speciesDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Verification Stats</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={verificationStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
