export * from './mocks_factory_partial_reexport'

export type PartialOption = 'a' | 'b'

export function used(): string {
  return 'used'
}

export function unused(): string {
  return 'unused'
}
