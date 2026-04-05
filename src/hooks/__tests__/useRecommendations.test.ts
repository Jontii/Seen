import { renderHook, act } from '@testing-library/react-native';
import { useRecommendations } from '../useRecommendations';

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

const mockFrom = jest.fn();
const mockRpc = jest.fn();

jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
    rpc: (...args: any[]) => mockRpc(...args),
  },
}));

describe('useRecommendations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
      insert: jest.fn().mockResolvedValue({ error: null }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });
  });

  it('starts with empty recommendations', async () => {
    const { result } = renderHook(() => useRecommendations());
    await act(async () => {});

    expect(result.current.recommendations).toEqual([]);
    expect(result.current.unseenCount).toBe(0);
  });

  it('fetches recommendations for current user', async () => {
    renderHook(() => useRecommendations());
    await act(async () => {});

    expect(mockFrom).toHaveBeenCalledWith('recommendations');
  });

  it('unseenCount reflects unseen recommendations', async () => {
    const recs = [
      {
        id: 'rec-1',
        from_profile: { id: 'u2', display_name: 'Alice', avatar_url: null, invite_code: 'A', created_at: '' },
        tmdb_id: 155,
        imdb_id: 'tt0468569',
        media_type: 'movie',
        title: 'The Dark Knight',
        poster_path: null,
        year: '2008',
        message: null,
        created_at: '2024-01-01T00:00:00Z',
        seen_at: null,
      },
      {
        id: 'rec-2',
        from_profile: { id: 'u3', display_name: 'Bob', avatar_url: null, invite_code: 'B', created_at: '' },
        tmdb_id: 550,
        imdb_id: null,
        media_type: 'movie',
        title: 'Fight Club',
        poster_path: null,
        year: '1999',
        message: null,
        created_at: '2024-01-02T00:00:00Z',
        seen_at: '2024-01-03T00:00:00Z',
      },
    ];

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: recs, error: null }),
        }),
      }),
    });

    const { result } = renderHook(() => useRecommendations());
    await act(async () => {});

    expect(result.current.recommendations).toHaveLength(2);
    expect(result.current.unseenCount).toBe(1);
  });

  it('markAsSeen updates recommendation optimistically', async () => {
    const recs = [
      {
        id: 'rec-1',
        from_profile: { id: 'u2', display_name: 'Alice', avatar_url: null, invite_code: 'A', created_at: '' },
        tmdb_id: 155,
        imdb_id: null,
        media_type: 'movie',
        title: 'The Dark Knight',
        poster_path: null,
        year: '2008',
        message: null,
        created_at: '2024-01-01T00:00:00Z',
        seen_at: null,
      },
    ];

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: recs, error: null }),
        }),
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });

    const { result } = renderHook(() => useRecommendations());
    await act(async () => {});

    expect(result.current.unseenCount).toBe(1);

    await act(async () => {
      await result.current.markAsSeen('rec-1');
    });

    expect(result.current.unseenCount).toBe(0);
    expect(result.current.recommendations[0].seenAt).toBeTruthy();
  });

  it('dismissRecommendation removes it optimistically', async () => {
    const recs = [
      {
        id: 'rec-1',
        from_profile: { id: 'u2', display_name: 'Alice', avatar_url: null, invite_code: 'A', created_at: '' },
        tmdb_id: 155,
        imdb_id: null,
        media_type: 'movie',
        title: 'The Dark Knight',
        poster_path: null,
        year: '2008',
        message: 'Great movie',
        created_at: '2024-01-01T00:00:00Z',
        seen_at: null,
      },
    ];

    const mockDelete = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: recs, error: null }),
        }),
      }),
      delete: mockDelete,
    });

    const { result } = renderHook(() => useRecommendations());
    await act(async () => {});

    expect(result.current.recommendations).toHaveLength(1);

    await act(async () => {
      await result.current.dismissRecommendation('rec-1');
    });

    expect(result.current.recommendations).toHaveLength(0);
  });

  it('getFriendsWhoWatched returns empty when no friends', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => useRecommendations());
    await act(async () => {});

    let friends: any;
    await act(async () => {
      friends = await result.current.getFriendsWhoWatched(155);
    });

    expect(friends).toEqual([]);
  });
});
