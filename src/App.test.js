import { render, screen, waitFor } from '@testing-library/react';

import App from './App';

jest.mock('./api/auth', () => ({
  refreshAccessToken: jest.fn().mockResolvedValue({ accessToken: '' }),
}));

test('renders login page when not authenticated', async () => {
  render(<App />);

  await waitFor(() => {
    expect(screen.getByText(/러닝을 더 쉽게, 꾸준하게/i)).toBeInTheDocument();
  });
});
