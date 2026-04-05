import { renderHook, act } from '@testing-library/react-native';
import { useFriends } from '../useFriends';

const mockUser = { id: 'user-123', email: 'test@test.com' };

jest.mock('../useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    session: {},
    profile: { id: 'user-123', displayName: 'Test', avatarUrl: null, inviteCode: 'TEST12', createdAt: '' },
    isLoading: false,
    isProfileComplete: true,
    signInWithEmail: jest.fn(),
    signOut: jest.fn(),
    updateProfile: jest.fn(),
    refreshProfile: jest.fn(),
  }),
}));

const mockRpc = jest.fn();
const mockFrom = jest.fn();

jest.mock('../../lib/supabase', () => ({
  supabase: {
    rpc: (...args: any[]) => mockRpc(...args),
    from: (...args: any[]) => mockFrom(...args),
  },
}));

describe('useFriends', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRpc.mockResolvedValue({ data: [], error: null });
  });

  it('starts with empty friends list', async () => {
    const { result } = renderHook(() => useFriends());
    await act(async () => {});

    expect(result.current.friends).toEqual([]);
  });

  it('fetches friend IDs via rpc', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    renderHook(() => useFriends());
    await act(async () => {});

    expect(mockRpc).toHaveBeenCalledWith('get_friend_ids', { uid: 'user-123' });
  });

  it('addFriendByCode returns error for invalid code', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
        }),
      }),
    });

    const { result } = renderHook(() => useFriends());
    await act(async () => {});

    let res: any;
    await act(async () => {
      res = await result.current.addFriendByCode('INVALID');
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe('Invalid invite code');
  });

  it('addFriendByCode rejects own code', async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'user-123', display_name: 'Test', invite_code: 'TEST12' },
            error: null,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useFriends());
    await act(async () => {});

    let res: any;
    await act(async () => {
      res = await result.current.addFriendByCode('TEST12');
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe("That's your own code!");
  });
});
