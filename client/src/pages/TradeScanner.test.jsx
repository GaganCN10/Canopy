import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import TradeScanner from '../pages/TradeScanner';
import { scanTradeText } from '../features/ml/mlApi';

vi.mock('../features/ml/mlApi', () => ({
  scanTradeText: vi.fn(),
}));

describe('TradeScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the Wildlife Trade Scanner heading', () => {
    renderWithProviders(<TradeScanner />);
    expect(screen.getByText('Wildlife Trade Scanner')).toBeInTheDocument();
  });

  it('renders source input, textarea, and Scan Text button', () => {
    renderWithProviders(<TradeScanner />);
    expect(screen.getByPlaceholderText(/public-market-listing/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Paste listing text here/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Scan Text/i })).toBeInTheDocument();
  });

  it('disables Scan Text button when textarea is empty', () => {
    renderWithProviders(<TradeScanner />);
    expect(screen.getByRole('button', { name: /Scan Text/i })).toBeDisabled();
  });

  it('enables Scan Text button when text is entered', async () => {
    renderWithProviders(<TradeScanner />);
    const textarea = screen.getByPlaceholderText(/Paste listing text here/i);
    await userEvent.type(textarea, 'Some listing text');
    expect(screen.getByRole('button', { name: /Scan Text/i })).not.toBeDisabled();
  });

  it('submits form and shows flagged result', async () => {
    scanTradeText.mockResolvedValue({
      data: {
        flagged: true,
        confidence: 0.95,
        matchedKeywords: ['ivory', 'rhino horn'],
      },
    });

    renderWithProviders(<TradeScanner />);
    const textarea = screen.getByPlaceholderText(/Paste listing text here/i);
    const sourceInput = screen.getByPlaceholderText(/public-market-listing/i);
    const button = screen.getByRole('button', { name: /Scan Text/i });

    await userEvent.type(textarea, 'Selling ivory and rhino horn');
    await userEvent.type(sourceInput, 'market-listing');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Potential illegal trade indicators detected')).toBeInTheDocument();
    });
    expect(screen.getByText(/95\.0%/)).toBeInTheDocument();
    expect(screen.getByText('ivory')).toBeInTheDocument();
    expect(screen.getByText('rhino horn')).toBeInTheDocument();
  });

  it('submits form and shows non-flagged result', async () => {
    scanTradeText.mockResolvedValue({
      data: {
        flagged: false,
        confidence: 0.15,
        matchedKeywords: [],
      },
    });

    renderWithProviders(<TradeScanner />);
    const textarea = screen.getByPlaceholderText(/Paste listing text here/i);
    await userEvent.type(textarea, 'Normal product listing');
    await userEvent.click(screen.getByRole('button', { name: /Scan Text/i }));

    await waitFor(() => {
      expect(screen.getByText('No strong indicators detected')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    scanTradeText.mockRejectedValue(new Error('Scan failed'));

    renderWithProviders(<TradeScanner />);
    const textarea = screen.getByPlaceholderText(/Paste listing text here/i);
    await userEvent.type(textarea, 'Test text');
    await userEvent.click(screen.getByRole('button', { name: /Scan Text/i }));

    await waitFor(() => {
      expect(screen.queryByText('Potential illegal trade indicators detected')).not.toBeInTheDocument();
    });
  });

  it('does not submit when text is whitespace only', async () => {
    renderWithProviders(<TradeScanner />);
    const textarea = screen.getByPlaceholderText(/Paste listing text here/i);
    const button = screen.getByRole('button', { name: /Scan Text/i });
    await userEvent.type(textarea, '   ');
    await userEvent.click(button);
    expect(scanTradeText).not.toHaveBeenCalled();
  });

  it('clears previous result on new scan', async () => {
    scanTradeText
      .mockResolvedValueOnce({
        data: { flagged: true, confidence: 0.95, matchedKeywords: ['ivory'] },
      })
      .mockResolvedValueOnce({
        data: { flagged: false, confidence: 0.15, matchedKeywords: [] },
      });

    renderWithProviders(<TradeScanner />);
    const textarea = screen.getByPlaceholderText(/Paste listing text here/i);
    const button = screen.getByRole('button', { name: /Scan Text/i });

    await userEvent.type(textarea, 'Selling ivory');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Potential illegal trade indicators detected')).toBeInTheDocument();
    });

    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Normal product');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('No strong indicators detected')).toBeInTheDocument();
    });
  });
});
