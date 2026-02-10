/**
 * Logger utilitário: em produção pode ser desabilitado ou redirecionado.
 * Evita poluir o console do usuário e facilita desligar logs sensíveis.
 */

const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args)
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args)
  },
  error: (...args: unknown[]) => {
    // error pode ser mantido em produção para monitoramento (ex.: Sentry)
    console.error(...args)
  },
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args)
  },
}
