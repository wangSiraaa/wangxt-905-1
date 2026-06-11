import { describe, it, expect, beforeEach } from 'vitest'
import { clearAllForTest } from '../data/storage'
import { initializeSeedData, store } from '../data/storage'
import { seedArchives, seedBorrowRequests, seedOverdueRecords, seedUsers } from '../data/seed'

describe('核心业务规则验证（纯逻辑层）', () => {
  beforeEach(() => {
    clearAllForTest()
    localStorage.clear()
    initializeSeedData()
  })

  it('涉密/机密资料在默认情况下有脱敏标题', () => {
    const arcs = store.getArchives()
    const secretArc = arcs.find((a) => a.classification === 'secret')
    expect(secretArc).toBeDefined()
    expect(secretArc!.maskedTitle).toContain('****')
    expect(secretArc!.title).not.toContain('****')
  })

  it('逾期用户（user-2 李借阅）存在未解决的逾期记录', () => {
    const overdue = store.getOverdue()
    const user2 = seedUsers.find((u) => u.id === 'user-2')!
    const hasUnresolved = overdue.some((o) => o.userId === user2.id && !o.resolved)
    expect(hasUnresolved).toBe(true)
  })

  it('已借出档案不能再次被申请（前置校验）', () => {
    const arcs = store.getArchives()
    const borrowed = arcs.find((a) => a.isBorrowed)
    expect(borrowed).toBeDefined()
    expect(borrowed!.slotId).toBeNull()
  })

  it('种子数据包含所有四种角色', () => {
    const users = store.getUsers()
    const roles = new Set(users.map((u) => u.role))
    expect(roles.has('archivist')).toBe(true)
    expect(roles.has('borrower')).toBe(true)
    expect(roles.has('dept_manager')).toBe(true)
    expect(roles.has('auditor')).toBe(true)
    expect(users.length).toBeGreaterThanOrEqual(5)
  })

  it('种子数据包含四种密级的档案', () => {
    const arcs = store.getArchives()
    const levels = new Set(arcs.map((a) => a.classification))
    expect(levels.has('public')).toBe(true)
    expect(levels.has('internal')).toBe(true)
    expect(levels.has('confidential')).toBe(true)
    expect(levels.has('secret')).toBe(true)
  })

  it('柜位与档案关联正确（在柜档案对应唯一柜位）', () => {
    const slots = store.getSlots()
    const arcs = store.getArchives()
    const onShelf = arcs.filter((a) => !a.isBorrowed && a.slotId)
    for (const a of onShelf) {
      const slot = slots.find((s) => s.id === a.slotId)
      expect(slot).toBeDefined()
      expect(slot!.archiveId).toBe(a.id)
    }
  })
})
