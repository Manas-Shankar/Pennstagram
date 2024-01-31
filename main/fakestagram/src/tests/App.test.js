import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders the App component', () => {
  const { getByTestId } = render(
      <App />
  );

  // Find elements by text content
  const searchBarElement = getByTestId('searchbar');
  const navBarElement = getByTestId('navbar');

  // Verify that Navbar and SearchBar elements are rendered
  expect(searchBarElement).toBeInTheDocument();
  expect(navBarElement).toBeInTheDocument();
});
