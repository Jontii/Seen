import React from 'react';
import { render } from '@testing-library/react-native';
import InviteQRCode from '../InviteQRCode';

let lastQRCodeProps: any = null;

jest.mock('react-native-qrcode-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => {
      lastQRCodeProps = props;
      return <View testID="qr-code" />;
    },
  };
});

describe('InviteQRCode', () => {
  beforeEach(() => {
    lastQRCodeProps = null;
  });

  it('renders QR code component', () => {
    const { getByTestId } = render(<InviteQRCode inviteCode="ABC123" />);
    expect(getByTestId('qr-code')).toBeTruthy();
  });

  it('encodes deep link URL in QR code', () => {
    render(<InviteQRCode inviteCode="ABC123" />);
    expect(lastQRCodeProps.value).toBe('have-you-seen://invite/ABC123');
  });

  it('shows invite code text as fallback', () => {
    const { getByText } = render(<InviteQRCode inviteCode="ABC123" />);
    expect(getByText('ABC123')).toBeTruthy();
  });

  it('uses custom size when provided', () => {
    render(<InviteQRCode inviteCode="XYZ" size={200} />);
    expect(lastQRCodeProps.size).toBe(200);
  });

  it('uses default size of 180', () => {
    render(<InviteQRCode inviteCode="XYZ" />);
    expect(lastQRCodeProps.size).toBe(180);
  });
});
