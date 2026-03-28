import { renderHook, act } from '@testing-library/react-native';
import { useDebounce } from '../useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update the value before the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 300 } },
    );

    rerender({ value: 'world', delay: 300 });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe('hello');
  });

  it('updates the value after the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 300 } },
    );

    rerender({ value: 'world', delay: 300 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('world');
  });

  it('resets the timer on rapid value changes and only emits the final value', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } },
    );

    rerender({ value: 'ab', delay: 300 });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'abc', delay: 300 });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'abcd', delay: 300 });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('abcd');
  });

  it('handles a delay of 0', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } },
    );

    rerender({ value: 'updated', delay: 0 });

    act(() => {
      jest.advanceTimersByTime(0);
    });

    expect(result.current).toBe('updated');
  });
});
