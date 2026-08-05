import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import HabitatMonitor from '../pages/HabitatMonitor';

describe('HabitatMonitor', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the heading and description', () => {
    renderWithProviders(<HabitatMonitor />);
    expect(screen.getByText('Habitat Monitoring')).toBeInTheDocument();
    expect(screen.getByText(/Draw a region on the map/i)).toBeInTheDocument();
  });

  it('renders date inputs and Compute NDVI button', () => {
    renderWithProviders(<HabitatMonitor />);
    expect(screen.getByText(/Start Date/i)).toBeInTheDocument();
    expect(screen.getByText(/End Date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Compute NDVI/i })).toBeInTheDocument();
  });

  it('shows error when Compute NDVI is clicked without bbox and dates', async () => {
    renderWithProviders(<HabitatMonitor />);
    await userEvent.click(screen.getByRole('button', { name: /Compute NDVI/i }));
    expect(screen.getByText(/Please draw a region on the map/i)).toBeInTheDocument();
  });

  it('renders map container', () => {
    renderWithProviders(<HabitatMonitor />);
    expect(screen.getByText(/Draw a region on the map/i)).toBeInTheDocument();
  });

  it('shows Compute NDVI button enabled initially', () => {
    renderWithProviders(<HabitatMonitor />);
    const button = screen.getByRole('button', { name: /Compute NDVI/i });
    expect(button).not.toBeDisabled();
  });
});
