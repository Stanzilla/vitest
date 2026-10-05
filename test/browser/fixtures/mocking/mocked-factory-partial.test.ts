import { expect, test, vi } from 'vitest'
import { callUsed, hasUnmockedExports } from './src/mocks_factory_partial_consumer'

vi.mock(import('./src/mocks_factory_partial'), () => {
  return {
    used: () => 'mocked',
  }
})

test('a factory can omit exports that another module imports', () => {
  expect(callUsed()).toBe('mocked')
  expect(hasUnmockedExports()).toBe(false)
})
