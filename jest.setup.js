import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'

// Mock console.log and console.error to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}

// Mock fetch globally
global.fetch = jest.fn()

// Mock NextRequest and NextResponse
global.Request = jest.fn()
global.Response = jest.fn()
global.Headers = jest.fn()

// Mock WebCrypto for Node.js environment
Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    },
    randomUUID: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },
    subtle: {
      digest: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
    }
  }
})