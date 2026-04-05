import { renderHook, act } from '@testing-library/react-native';
import React, { ReactNode } from 'react';
import { AuthProvider, useAuth } from '../useAuth';

const mockGetSession = jest.fn().mockResolvedValue({ data: { session: null } });
const mockOnAuthStateChange = jest.fn().mockReturnValue({
  data: { subscription: { unsubscribe: jest.fn() } },
});
const mockSignInWithOtp = jest.fn().mockResolvedValue({ error: null });
const mockSignOut = jest.fn().mockResolvedValue({ error: null });
const mockFrom = jest.fn().mockReturnValue({
  select: jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
  upsert: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
  update: jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
  }),
  insert: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
});

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (...args: any[]) => mockOnAuthStateChange(...args),
      signInWithOtp: (...args: any[]) => mockSignInWithOtp(...args),
      signOut: () => mockSignOut(),
    },
    from: (...args: any[]) => mockFrom(...args),
  },
}));

jest.mock('expo-linking', () => ({
  createURL: (path: string) => `have-you-seen://${path}`,
  getInitialURL: jest.fn().mockResolvedValue(null),
  addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
}));

function wrapper({ children }: { children: ReactNode }) {
  return React.createElement(AuthProvider, null, children);
}

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null } });
  });

  it('starts with null user and loading state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();

    await act(async () => {});

    expect(result.current.isLoading).toBe(false);
  });

  it('user is null when no session', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.profile).toBeNull();
  });

  it('isProfileComplete is false when no profile', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    expect(result.current.isProfileComplete).toBe(false);
  });

  it('signInWithEmail calls signInWithOtp', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    await act(async () => {
      await result.current.signInWithEmail('test@example.com');
    });

    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
      options: {
        emailRedirectTo: 'have-you-seen://auth/callback',
      },
    });
  });

  it('signInWithEmail throws on error', async () => {
    mockSignInWithOtp.mockResolvedValueOnce({ error: new Error('Rate limited') });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    await expect(
      act(async () => {
        await result.current.signInWithEmail('test@example.com');
      }),
    ).rejects.toThrow('Rate limited');
  });

  it('signOut clears profile', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalled();
    expect(result.current.profile).toBeNull();
  });

  it('subscribes to auth state changes', async () => {
    renderHook(() => useAuth(), { wrapper });
    await act(async () => {});

    expect(mockOnAuthStateChange).toHaveBeenCalled();
  });
});
