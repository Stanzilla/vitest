import { reexported, unused, used } from './mocks_factory_partial'

export function callUsed(): string {
  return used()
}

export function hasUnmockedExports(): boolean {
  return typeof unused === 'function' || typeof reexported === 'string'
}
