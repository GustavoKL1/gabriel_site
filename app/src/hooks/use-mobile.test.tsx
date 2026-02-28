import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useIsMobile } from './use-mobile'

const MOBILE_BREAKPOINT = 768

describe('useIsMobile', () => {
  let addEventListenerMock: ReturnType<typeof vi.fn>
  let removeEventListenerMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    addEventListenerMock = vi.fn()
    removeEventListenerMock = vi.fn()

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: addEventListenerMock,
        removeEventListener: removeEventListenerMock,
        dispatchEvent: vi.fn(),
      })),
    })

    // Reset innerWidth before each test
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return false initially if window.innerWidth >= MOBILE_BREAKPOINT', () => {
    window.innerWidth = 1024
    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
    expect(window.matchMedia).toHaveBeenCalledWith(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  })

  it('should return true initially if window.innerWidth < MOBILE_BREAKPOINT', () => {
    window.innerWidth = 500
    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('should update value when window resizes and triggers media query change', () => {
    window.innerWidth = 1024
    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)

    // Simulate window resize to mobile
    act(() => {
      window.innerWidth = 500
      // Extract the registered onChange callback
      const changeCallback = addEventListenerMock.mock.calls[0][1]
      changeCallback()
    })

    expect(result.current).toBe(true)

    // Simulate window resize back to desktop
    act(() => {
      window.innerWidth = 1024
      const changeCallback = addEventListenerMock.mock.calls[0][1]
      changeCallback()
    })

    expect(result.current).toBe(false)
  })

  it('should clean up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile())

    expect(addEventListenerMock).toHaveBeenCalledTimes(1)

    unmount()

    expect(removeEventListenerMock).toHaveBeenCalledTimes(1)
    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
