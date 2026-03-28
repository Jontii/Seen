import React from 'react';
import { render } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders title text', () => {
    const { getByText } = render(
      <EmptyState title="No results" message="Try searching again" />,
    );
    expect(getByText('No results')).toBeTruthy();
  });

  it('renders message text', () => {
    const { getByText } = render(
      <EmptyState title="No results" message="Try searching again" />,
    );
    expect(getByText('Try searching again')).toBeTruthy();
  });
});
