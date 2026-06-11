import type {
  User,
  Cabinet,
  CabinetSlot,
  Archive,
  BorrowRequest,
  OperationLog,
  OverdueRecord
} from '../types'
import {
  seedUsers,
  seedCabinets,
  seedCabinetSlots,
  seedArchives,
  seedBorrowRequests,
  seedOperationLogs,
  seedOverdueRecords,
  SEED_KEY,
  STORAGE_KEYS
} from './seed'

function getStorage(): Storage {
  if (typeof localStorage !== 'undefined') return localStorage
  const mem: Record<string, string> = {}
  return {
    length: 0,
    clear: () => Object.keys(mem).forEach((k) => delete mem[k]),
    getItem: (k: string) => mem[k] ?? null,
    setItem: (k: string, v: string) => { mem[k] = String(v) },
    removeItem: (k: string) => { delete mem[k] },
    key: (i: number) => Object.keys(mem)[i] ?? null
  } as Storage
}

const _storage = getStorage()

export function isSeeded(): boolean {
  return _storage.getItem(SEED_KEY) === 'true'
}

export function initializeSeedData(): void {
  if (isSeeded()) return

  const slotsWithArchive: CabinetSlot[] = seedCabinetSlots.map((s) => ({ ...s }))
  for (const arc of seedArchives) {
    if (arc.slotId) {
      const slot = slotsWithArchive.find((s) => s.id === arc.slotId)
      if (slot) slot.archiveId = arc.id
    }
  }

  _storage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seedUsers))
  _storage.setItem(STORAGE_KEYS.CABINETS, JSON.stringify(seedCabinets))
  _storage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slotsWithArchive))
  _storage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(seedArchives))
  _storage.setItem(STORAGE_KEYS.BORROWS, JSON.stringify(seedBorrowRequests))
  _storage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(seedOperationLogs))
  _storage.setItem(STORAGE_KEYS.OVERDUE, JSON.stringify(seedOverdueRecords))
  _storage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(seedUsers[1]))
  _storage.setItem(SEED_KEY, 'true')
}

export function resetAllData(): void {
  _storage.removeItem(SEED_KEY)
  Object.values(STORAGE_KEYS).forEach((k) => _storage.removeItem(k))
  initializeSeedData()
}

function readOr<T>(key: string, fallback: T): T {
  const raw = _storage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  _storage.setItem(key, JSON.stringify(value))
}

export const store = {
  getUsers: (): User[] => readOr(STORAGE_KEYS.USERS, []),
  setUsers: (v: User[]) => write(STORAGE_KEYS.USERS, v),

  getCabinets: (): Cabinet[] => readOr(STORAGE_KEYS.CABINETS, []),
  setCabinets: (v: Cabinet[]) => write(STORAGE_KEYS.CABINETS, v),

  getSlots: (): CabinetSlot[] => readOr(STORAGE_KEYS.SLOTS, []),
  setSlots: (v: CabinetSlot[]) => write(STORAGE_KEYS.SLOTS, v),

  getArchives: (): Archive[] => readOr(STORAGE_KEYS.ARCHIVES, []),
  setArchives: (v: Archive[]) => write(STORAGE_KEYS.ARCHIVES, v),

  getBorrows: (): BorrowRequest[] => readOr(STORAGE_KEYS.BORROWS, []),
  setBorrows: (v: BorrowRequest[]) => write(STORAGE_KEYS.BORROWS, v),

  getLogs: (): OperationLog[] => readOr(STORAGE_KEYS.LOGS, []),
  setLogs: (v: OperationLog[]) => write(STORAGE_KEYS.LOGS, v),

  getOverdue: (): OverdueRecord[] => readOr(STORAGE_KEYS.OVERDUE, []),
  setOverdue: (v: OverdueRecord[]) => write(STORAGE_KEYS.OVERDUE, v),

  getCurrentUser: (): User | null => readOr<User | null>(STORAGE_KEYS.CURRENT_USER, null),
  setCurrentUser: (v: User | null) => write(STORAGE_KEYS.CURRENT_USER, v)
}

export function clearAllForTest(): void {
  _storage.removeItem(SEED_KEY)
  Object.values(STORAGE_KEYS).forEach((k) => _storage.removeItem(k))
  _storage.clear()
  if (typeof localStorage !== 'undefined') {
    try { localStorage.clear() } catch (_e) { /* ignore */ }
  }
}
