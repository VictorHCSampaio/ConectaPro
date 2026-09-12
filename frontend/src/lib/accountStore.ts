import type { UserRole } from '@/types/auth'

const STORAGE_KEY = 'conectapro:accounts'

export type StoredAccount = {
  name: string
  role: UserRole
}

type AccountMap = Record<string, StoredAccount>

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function readAccounts(): AccountMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AccountMap) : {}
  } catch {
    return {}
  }
}

/**
 * O backend ainda nao devolve o tipo do usuario no login, entao o papel
 * escolhido no cadastro fica guardado localmente e e recuperado no login.
 */
export function rememberAccount(email: string, account: StoredAccount) {
  try {
    const accounts = readAccounts()
    accounts[normalizeEmail(email)] = account
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
  } catch {
    return
  }
}

export function findAccount(email: string): StoredAccount | null {
  return readAccounts()[normalizeEmail(email)] ?? null
}
