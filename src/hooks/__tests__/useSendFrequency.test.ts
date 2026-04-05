import { renderHook, act } from '@testing-library/react-native';
import { useSendFrequency } from '../useSendFrequency';

let mockUser: any = { id: 'user-123', email: 'test@test.com' };

jest.mock('../useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    session: {},
    profile: null,
    isLoading: false,
    isProfileComplete: false,
    signInWithEmail: jest.fn(),
    signOut: jest.fn(),
    updateProfile: jest.fn(),
    refreshProfile: jest.fn(),
  }),
}));

const mockFrom = jest.fn();

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

describe('useSendFrequency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { id: 'user-123', email: 'test@test.com' };
  });

  it('returns empty array when no recommendations sent', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });

    const { result } = renderHook(() => useSendFrequency());
    await act(async () => {});

    expect(result.current.frequentFriendIds).toEqual([]);
  });

  it('returns top 3 friend IDs by send frequency', async () => {
    const data = [
      { to_user: 'friend-a' },
      { to_user: 'friend-a' },
      { to_user: 'friend-a' },
      { to_user: 'friend-b' },
      { to_user: 'friend-b' },
      { to_user: 'friend-c' },
      { to_user: 'friend-d' },
      { to_user: 'friend-d' },
      { to_user: 'friend-d' },
      { to_user: 'friend-d' },
    ];

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data, error: null }),
      }),
    });

    const { result } = renderHook(() => useSendFrequency());
    await act(async () => {});

    expect(result.current.frequentFriendIds).toEqual(['friend-d', 'friend-a', 'friend-b']);
  });

  it('returns empty when user is null', async () => {
    mockUser = null;

    const { result } = renderHook(() => useSendFrequency());
    await act(async () => {});

    expect(result.current.frequentFriendIds).toEqual([]);
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
