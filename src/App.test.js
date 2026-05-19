import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page', () => {
  render(<App />);
  expect(screen.getByText(/러닝을 더 쉽게, 꾸준하게/i)).toBeInTheDocument();
});
