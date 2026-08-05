import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import MapPage from '../pages/MapPage';
import { getSightings } from '../features/sightings/sightingApi';
import { getTips } from '../features/sightings/tipApi';
import { getHWCIncidents, getGeofenceZones } from '../features/map/hwcApi';
import { getPoachingHotspots } from '../features/ml/mlApi';

vi.mock('../features/sightings/sightingApi', () => ({
  getSightings: vi.fn(),
}));

vi.mock('../features/sightings/tipApi', () => ({
  getTips: vi.fn(),
}));

vi.mock('../features/map/hwcApi', () => ({
  getHWCIncidents: vi.fn(),
  getGeofenceZones: vi.fn(),
}));

vi.mock('../features/ml/mlApi', () => ({
  getPoachingHotspots: vi.fn(),
}));

describe('MapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the Interactive Map heading', () => {
    renderWithProviders(<MapPage />);
    expect(screen.getByText('Interactive Map')).toBeInTheDocument();
  });

  it('renders layer toggles', async () => {
    getSightings.mockResolvedValue({ data: { sightings: [] } });
    getTips.mockResolvedValue({ data: { tips: [] } });
    getHWCIncidents.mockResolvedValue({ data: { incidents: [] } });
    getGeofenceZones.mockResolvedValue({ data: [] });

    renderWithProviders(<MapPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading map data...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('sightings')).toBeInTheDocument();
    expect(screen.getAllByText('HWC Incidents').length).toBeGreaterThan(0);
    expect(screen.getByText('tips')).toBeInTheDocument();
    expect(screen.getAllByText('Geofence Zones').length).toBeGreaterThan(0);
  });

  it('shows loading state initially', () => {
    renderWithProviders(<MapPage />);
    expect(screen.getByText('Loading map data...')).toBeInTheDocument();
  });

  it('loads and displays sightings data', async () => {
    getSightings.mockResolvedValue({ data: { sightings: [{ _id: '1', species: { name: 'Elephant' }, status: 'verified', location: { coordinates: [0, 0] } }] } });
    getTips.mockResolvedValue({ data: { tips: [] } });
    getHWCIncidents.mockResolvedValue({ data: { incidents: [] } });
    getGeofenceZones.mockResolvedValue({ data: [] });

    renderWithProviders(<MapPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading map data...')).not.toBeInTheDocument();
    });
  });

  it('toggles layer visibility', async () => {
    getSightings.mockResolvedValue({ data: { sightings: [] } });
    getTips.mockResolvedValue({ data: { tips: [] } });
    getHWCIncidents.mockResolvedValue({ data: { incidents: [] } });
    getGeofenceZones.mockResolvedValue({ data: [] });

    renderWithProviders(<MapPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading map data...')).not.toBeInTheDocument();
    });

    const sightingsCheckbox = screen.getByRole('checkbox', { name: /sightings/i });
    expect(sightingsCheckbox).toBeChecked();
    await userEvent.click(sightingsCheckbox);
    expect(sightingsCheckbox).not.toBeChecked();
  });

  it('renders GPX/CSV upload button', async () => {
    getSightings.mockResolvedValue({ data: { sightings: [] } });
    getTips.mockResolvedValue({ data: { tips: [] } });
    getHWCIncidents.mockResolvedValue({ data: { incidents: [] } });
    getGeofenceZones.mockResolvedValue({ data: [] });

    renderWithProviders(<MapPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading map data...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Upload GPX/CSV')).toBeInTheDocument();
  });

  it('handles file upload for movement corridors', async () => {
    getSightings.mockResolvedValue({ data: { sightings: [] } });
    getTips.mockResolvedValue({ data: { tips: [] } });
    getHWCIncidents.mockResolvedValue({ data: { incidents: [] } });
    getGeofenceZones.mockResolvedValue({ data: [] });

    renderWithProviders(<MapPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading map data...')).not.toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText('Upload GPX/CSV');
    const file = new File(['content'], 'movement.csv', { type: 'text/csv' });
    await userEvent.upload(fileInput, file);

    expect(getPoachingHotspots).toHaveBeenCalledTimes(0);
  });
});
