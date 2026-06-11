/// <reference types="vitest" />
import '@testing-library/jest-dom/vitest'

class LocalStorageMock {
  private store: Record<string, string> = {}
  get length() {
    return Object.keys(this.store).length
  }
  clear() {
    this.store = {}
  }
  getItem(key: string) {
    return this.store[key] || null
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value)
  }
  removeItem(key: string) {
    delete this.store[key]
  }
  key(index: number) {
    return Object.keys(this.store)[index] || null
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new LocalStorageMock(),
    writable: true,
    configurable: true
  })
}

Object.defineProperty(globalThis, 'alert', {
  value: vi.fn(),
  writable: true,
  configurable: true
})

beforeEach(() => {
  vi.clearAllMocks()
})
