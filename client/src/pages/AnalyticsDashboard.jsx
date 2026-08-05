import React from 'react';
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, ComposedChart, Area,
} from 'recharts';
import { getPopulationForecast, detectAnomalies } from '../features/ml/mlApi';
import api from '../api/axiosInstance';

const COLORS = ['#22c55e', '#16a34a', '#15803d', '#f59e0b', '#ef4444', '#3b82f6'];

function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);
  const [sightingsOverTime, setSightingsOverTime] = useState([]);
  const [speciesDistribution, setSpeciesDistribution] = useState([]);
  const [verificationStats, setVerificationStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [forecastSpecies, setForecastSpecies] = useState('');
  const [forecastData, setForecastData] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [anomalies, setAnomalies] = useState([]);
  const [anomaliesLoading, setAnomaliesLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (forecastSpecies) {
      loadForecast(forecastSpecies);
    }
  }, [forecastSpecies]);

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
      if (speciesRes.data.data?.length > 0 && !forecastSpecies) {
        setForecastSpecies(speciesRes.data.data[0]._id);
      }
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const loadForecast = async (speciesId) => {
    setForecastLoading(true);
    setForecastData(null);
    try {
      const response = await getPopulationForecast({ speciesId, periods: 30 });
      setForecastData(response.data);
    } catch (err) {
      console.error('Failed to load forecast', err);
    } finally {
      setForecastLoading(false);
    }
  };

  const loadAnomalies = async () => {
    setAnomaliesLoading(true);
    try {
      const response = await detectAnomalies({});
      setAnomalies(response.data?.anomalies || []);
    } catch (err) {
      console.error('Failed to load anomalies', err);
    } finally {
      setAnomaliesLoading(false);
    }
  };

  const chartData = forecastData
    ? [
        ...forecastData.history.map((h) => ({ ...h, type: 'Historical' })),
        ...forecastData.forecast.map((f) => ({ ...f, type: 'Forecast' })),
      ]
    : [];

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
      <div className="mb-8">
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
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Population Trend Forecast</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Species</label>
          <select
            value={forecastSpecies}
            onChange={(e) => setForecastSpecies(e.target.value)}
            className="border rounded px-3 py-2 w-full sm:w-64"
          >
            {speciesDistribution.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
        {forecastLoading && <p>Loading forecast...</p>}
        {forecastData && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="yhat_upper" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} name="Upper Confidence" />
              <Area type="monotone" dataKey="yhat_lower" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} name="Lower Confidence" />
              <Line type="monotone" dataKey="yhat" stroke="#16a34a" strokeWidth={2} name="Forecast" />
              <Bar dataKey="y" fill="#86efac" name="Historical Count" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
        {forecastData && chartData.length === 0 && (
          <p className="text-slate-600">Not enough data to generate a forecast for this species.</p>
        )}
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-red-700">Anomaly Alerts</h2>
        {anomaliesLoading && <p>Scanning for anomalies...</p>}
        {!anomaliesLoading && anomalies.length === 0 && (
          <p className="text-slate-600">No anomalies detected in recent sighting data.</p>
        )}
        {anomalies.length > 0 && (
          <div className="space-y-3">
            {anomalies.map((anomaly, idx) => (
              <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 ${anomaly.direction === 'spike' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className={`mt-0.5 w-2.5 h-2.5 rounded-full ${anomaly.direction === 'spike' ? 'bg-red-500' : 'bg-amber-500'}`} />
                <div>
                  <p className={`font-medium ${anomaly.direction === 'spike' ? 'text-red-800' : 'text-amber-800'}`}>
                    {anomaly.direction === 'spike' ? 'Unusual spike' : 'Unusual drop'} detected on {anomaly.date}
                  </p>
                  <p className={`text-sm ${anomaly.direction === 'spike' ? 'text-red-700' : 'text-amber-700'}`}>
                    Count: {anomaly.value.toFixed(1)} (z-score: {anomaly.z_score.toFixed(2)})
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
