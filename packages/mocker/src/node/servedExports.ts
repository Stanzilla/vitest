import type { DevEnvironment } from 'vite'
import { init as initModuleLexer, parse as parseModuleSyntax } from 'es-module-lexer'

export async function collectServedModuleExports(
  environment: DevEnvironment,
  url: string,
): Promise<string[] | undefined> {
  await initModuleLexer
  const visited = new Set<string>()

  async function collect(url: string): Promise<string[]> {
    if (visited.has(url)) {
      return []
    }
    visited.add(url)
    // the query skips the interceptor, so a mocked module is transformed from its source
    const result = await environment.transformRequest(injectOriginalQuery(url))
    if (!result) {
      return []
    }
    const [imports, exports] = parseModuleSyntax(result.code)
    const names = exports.map((e) => e.n)
    const starSources = imports.flatMap(({ n: source, ss: start, se: end }) => {
      const statement = result.code.substring(start, end).replace(/\s+/g, ' ')
      return source && statement.startsWith('export *') && !statement.startsWith('export * as')
        ? [source]
        : []
    })
    for (const starNames of await Promise.all(starSources.map(collect))) {
      // `export *` never re-exports `default`
      names.push(...starNames.filter((name) => name !== 'default'))
    }
    return names
  }

  try {
    return Array.from(new Set(await collect(url)))
  } catch {
    return undefined
  }
}

function injectOriginalQuery(url: string): string {
  const index = url.indexOf('?')
  return index === -1
    ? `${url}?_vitest_original`
    : `${url.slice(0, index)}?_vitest_original&${url.slice(index + 1)}`
}
