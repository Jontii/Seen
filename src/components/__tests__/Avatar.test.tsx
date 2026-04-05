import React from 'react';
import { render } from '@testing-library/react-native';
import Avatar from '../Avatar';

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: (props: any) => <View testID="avatar-image" {...props} />,
  };
});

describe('Avatar', () => {
  it('renders initials for a single name', () => {
    const { getByText } = render(<Avatar name="Alice" />);
    expect(getByText('A')).toBeTruthy();
  });

  it('renders two initials for a full name', () => {
    const { getByText } = render(<Avatar name="Alice Smith" />);
    expect(getByText('AS')).toBeTruthy();
  });

  it('renders last name initial for multi-word names', () => {
    const { getByText } = render(<Avatar name="Alice Marie Smith" />);
    expect(getByText('AS')).toBeTruthy();
  });

  it('renders image when imageUrl is provided', () => {
    const { getByTestId, queryByText } = render(
      <Avatar name="Alice" imageUrl="https://example.com/avatar.jpg" />,
    );
    expect(getByTestId('avatar-image')).toBeTruthy();
    expect(queryByText('A')).toBeNull();
  });

  it('falls back to initials when imageUrl is null', () => {
    const { getByText } = render(<Avatar name="Bob" imageUrl={null} />);
    expect(getByText('B')).toBeTruthy();
  });

  it('renders different sizes', () => {
    const { toJSON: sm } = render(<Avatar name="A" size="sm" />);
    const { toJSON: xl } = render(<Avatar name="A" size="xl" />);
    // Just verify they render without error
    expect(sm()).toBeTruthy();
    expect(xl()).toBeTruthy();
  });

  it('generates consistent color for the same name', () => {
    const { toJSON: first } = render(<Avatar name="TestUser" />);
    const { toJSON: second } = render(<Avatar name="TestUser" />);
    expect(JSON.stringify(first())).toBe(JSON.stringify(second()));
  });
});
