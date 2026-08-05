import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import AdminTradeFlags from '../pages/AdminTradeFlags';
import { getTradeFlags, updateTradeFlag } from '../features/ml/mlApi';

vi.mock('../features/ml/mlApi', () => ({
  getTradeFlags: vi.fn(),
  updateTradeFlag: vi.fn(),
}));

describe('AdminTradeFlags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the Trade Flag Review Queue heading', () => {
    renderWithProviders(<AdminTradeFlags />);
    expect(screen.getByText('Trade Flag Review Queue')).toBeInTheDocument();
  });

  it('renders status filter buttons', () => {
    renderWithProviders(<AdminTradeFlags />);
    expect(screen.getByRole('button', { name: 'pending' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'approved' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'dismissed' })).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    getTradeFlags.mockImplementation(() => new Promise(() => {}));
    renderWithProviders(<AdminTradeFlags />);
    expect(screen.getByText('Loading flags...')).toBeInTheDocument();
  });

  it('renders pending flags with approve and dismiss buttons', async () => {
    getTradeFlags.mockResolvedValue({
      data: {
        flags: [
          {
            _id: '1',
            source: 'market',
            text: 'Selling ivory',
            confidence: 0.9,
            matchedKeywords: ['ivory'],
            status: 'pending',
          },
        ],
      },
    });

    renderWithProviders(<AdminTradeFlags />);

    await waitFor(() => {
      expect(screen.getByText('Selling ivory')).toBeInTheDocument();
    });
    const card = screen.getByText('Selling ivory').closest('.space-y-4');
    const actionButtons = card.querySelectorAll('button');
    const approveBtn = Array.from(actionButtons).find(btn => btn.textContent.includes('Approve'));
    const dismissBtn = Array.from(actionButtons).find(btn => btn.textContent.includes('Dismiss'));
    expect(approveBtn).toBeInTheDocument();
    expect(dismissBtn).toBeInTheDocument();
  });

  it('shows no flags message when empty', async () => {
    getTradeFlags.mockResolvedValue({ data: { flags: [] } });

    renderWithProviders(<AdminTradeFlags />);

    await waitFor(() => {
      expect(screen.getByText(/No flags found for this status/i)).toBeInTheDocument();
    });
  });

  it('switches status filter', async () => {
    getTradeFlags.mockResolvedValue({ data: { flags: [] } });

    renderWithProviders(<AdminTradeFlags />);

    await waitFor(() => {
      expect(screen.getByText(/No flags found for this status/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'approved' }));
    expect(getTradeFlags).toHaveBeenCalledWith({ status: 'approved', limit: 100 });
  });

  it('approves a flag', async () => {
    getTradeFlags
      .mockResolvedValueOnce({
        data: {
          flags: [
            {
              _id: '1',
              source: 'market',
              text: 'Selling ivory',
              confidence: 0.9,
              matchedKeywords: ['ivory'],
              status: 'pending',
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          flags: [
            {
              _id: '1',
              source: 'market',
              text: 'Selling ivory',
              confidence: 0.9,
              matchedKeywords: ['ivory'],
              status: 'approved',
            },
          ],
        },
      });

    updateTradeFlag.mockResolvedValue({});

    renderWithProviders(<AdminTradeFlags />);

    await waitFor(() => {
      expect(screen.getByText('Selling ivory')).toBeInTheDocument();
    });

    const card = screen.getByText('Selling ivory').closest('.space-y-4');
    const actionButtons = card.querySelectorAll('button');
    const approveBtn = Array.from(actionButtons).find(btn => btn.textContent.includes('Approve'));
    await userEvent.click(approveBtn);

    await waitFor(() => {
      expect(updateTradeFlag).toHaveBeenCalledWith('1', { status: 'approved' });
    });
  });

  it('dismisses a flag', async () => {
    getTradeFlags
      .mockResolvedValueOnce({
        data: {
          flags: [
            {
              _id: '1',
              source: 'market',
              text: 'Selling ivory',
              confidence: 0.9,
              matchedKeywords: ['ivory'],
              status: 'pending',
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          flags: [],
        },
      });

    updateTradeFlag.mockResolvedValue({});

    renderWithProviders(<AdminTradeFlags />);

    await waitFor(() => {
      expect(screen.getByText('Selling ivory')).toBeInTheDocument();
    });

    const card = screen.getByText('Selling ivory').closest('.space-y-4');
    const actionButtons = card.querySelectorAll('button');
    const dismissBtn = Array.from(actionButtons).find(btn => btn.textContent.includes('Dismiss'));
    await userEvent.click(dismissBtn);

    await waitFor(() => {
      expect(updateTradeFlag).toHaveBeenCalledWith('1', { status: 'dismissed' });
    });
  });

  it('does not show approve/dismiss buttons for approved flags', async () => {
    getTradeFlags
      .mockResolvedValueOnce({
        data: {
          flags: [],
        },
      })
      .mockResolvedValueOnce({
        data: {
          flags: [
            {
              _id: '1',
              source: 'market',
              text: 'Selling ivory',
              confidence: 0.9,
              matchedKeywords: ['ivory'],
              status: 'approved',
            },
          ],
        },
      });

    renderWithProviders(<AdminTradeFlags />);

    await waitFor(() => {
      expect(screen.getByText(/No flags found for this status/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'approved' }));

    await waitFor(() => {
      expect(screen.getByText('Selling ivory')).toBeInTheDocument();
    });
    const card = screen.getByText('Selling ivory').closest('.space-y-4');
    const actionButtons = card.querySelectorAll('button');
    const approveBtn = Array.from(actionButtons).find(btn => btn.textContent.includes('Approve'));
    const dismissBtn = Array.from(actionButtons).find(btn => btn.textContent.includes('Dismiss'));
    expect(approveBtn).toBeUndefined();
    expect(dismissBtn).toBeUndefined();
  });

  it('displays flag details correctly', async () => {
    getTradeFlags.mockResolvedValue({
      data: {
        flags: [
          {
            _id: '1',
            source: 'forum-post',
            text: 'Text content about illegal trade',
            confidence: 0.75,
            matchedKeywords: ['tiger bone'],
            status: 'pending',
          },
        ],
      },
    });

    renderWithProviders(<AdminTradeFlags />);

    await waitFor(() => {
      expect(screen.getByText(/forum-post/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Confidence: 75\.0%/)).toBeInTheDocument();
    expect(screen.getByText('tiger bone')).toBeInTheDocument();
  });

  it('handles API error when loading flags', async () => {
    getTradeFlags.mockRejectedValue(new Error('Failed to load'));

    renderWithProviders(<AdminTradeFlags />);

    await waitFor(() => {
      expect(screen.queryByText('Loading flags...')).not.toBeInTheDocument();
    });
  });
});
