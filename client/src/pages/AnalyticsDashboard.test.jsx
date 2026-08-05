import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import AnalyticsDashboard from '../pages/AnalyticsDashboard';
import api from '../api/axiosInstance';
import { getPopulationForecast, detectAnomalies } from '../features/ml/mlApi';

vi.mock('../api/axiosInstance', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('../features/ml/mlApi', () => ({
  getPopulationForecast: vi.fn(),
  detectAnomalies: vi.fn(),
}));

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders loading state initially', () => {
    api.get.mockImplementation(() => new Promise(() => {}));
    renderWithProviders(<AnalyticsDashboard />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders dashboard with analytics data', async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: { totalSightings: 100, verifiedSightings: 80, totalTips: 50, totalHWC: 10 } } })
      .mockResolvedValueOnce({ data: { data: [{ date: '2024-01-01', count: 5 }] } })
      .mockResolvedValueOnce({ data: { data: [{ _id: '1', name: 'Elephant', count: 30 }] } })
      .mockResolvedValueOnce({ data: { data: [{ _id: 'verified', count: 70 }, { _id: 'pending', count: 30 }] } });

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Sightings')).toBeInTheDocument();
    });
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders error state when API fails', async () => {
    api.get.mockRejectedValueOnce(new Error('API error'));

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load analytics')).toBeInTheDocument();
    });
  });

  it('loads population forecast when species is selected', async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: { totalSightings: 100, verifiedSightings: 80, totalTips: 50, totalHWC: 10 } } })
      .mockResolvedValueOnce({ data: { data: [{ date: '2024-01-01', count: 5 }] } })
      .mockResolvedValueOnce({ data: { data: [{ _id: '1', name: 'Elephant', count: 30 }] } })
      .mockResolvedValueOnce({ data: { data: [{ _id: 'verified', count: 70 }, { _id: 'pending', count: 30 }] } });

    getPopulationForecast.mockResolvedValue({
      data: {
        history: [{ date: '2024-01-01', y: 100 }],
        forecast: [{ date: '2024-02-01', yhat: 110, yhat_upper: 120, yhat_lower: 100 }],
      },
    });

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Sightings')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, '1');

    await waitFor(() => {
      expect(getPopulationForecast).toHaveBeenCalledWith({ speciesId: '1', periods: 30 });
    });
  });

  it('loads anomalies when detect anomalies is triggered', async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: { totalSightings: 100, verifiedSightings: 80, totalTips: 50, totalHWC: 10 } } })
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({ data: { data: [] } });

    detectAnomalies.mockResolvedValue({
      data: {
        anomalies: [{ date: '2024-01-15', value: 50, z_score: 3.5, direction: 'spike' }],
      },
    });

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Sightings')).toBeInTheDocument();
    });

    const anomalyButton = screen.getByText('Anomaly Alerts');
    expect(anomalyButton).toBeInTheDocument();
  });

  it('renders species distribution pie chart', async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: { totalSightings: 100, verifiedSightings: 80, totalTips: 50, totalHWC: 10 } } })
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({ data: { data: [{ _id: '1', name: 'Elephant', count: 30 }] } })
      .mockResolvedValueOnce({ data: { data: [] } });

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Species Distribution')).toBeInTheDocument();
    });
  });

  it('renders verification stats bar chart', async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: { totalSightings: 100, verifiedSightings: 80, totalTips: 50, totalHWC: 10 } } })
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({ data: { data: [{ _id: 'verified', count: 70 }] } });

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Verification Stats')).toBeInTheDocument();
    });
  });

  it('renders sightings over time bar chart', async () => {
    api.get
      .mockResolvedValueOnce({ data: { data: { totalSightings: 100, verifiedSightings: 80, totalTips: 50, totalHWC: 10 } } })
      .mockResolvedValueOnce({ data: { data: [{ date: '2024-01-01', count: 5 }] } })
      .mockResolvedValueOnce({ data: { data: [] } })
      .mockResolvedValueOnce({ data: { data: [] } });

    renderWithProviders(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Sightings Over Time (Last 30 Days)')).toBeInTheDocument();
    });
  });
});
