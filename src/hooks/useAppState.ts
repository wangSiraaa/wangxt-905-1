import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  User,
  Cabinet,
  CabinetSlot,
  Archive,
  BorrowRequest,
  OperationLog,
  OverdueRecord,
  ClassificationLevel
} from '../types'
import { store, initializeSeedData, resetAllData } from '../data/storage'
import { seedUsers } from '../data/seed'
import { uid, todayStr, formatDateTime, daysBetween } from '../utils/date'
import {
  canViewArchiveDetail,
  canApproveBorrow,
  needsDepartmentApproval
} from '../utils/permissions'

interface AppState {
  users: User[]
  cabinets: Cabinet[]
  slots: CabinetSlot[]
  archives: Archive[]
  borrows: BorrowRequest[]
  logs: OperationLog[]
  overdue: OverdueRecord[]
  currentUser: User | null
}

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    initializeSeedData()
    return {
      users: store.getUsers(),
      cabinets: store.getCabinets(),
      slots: store.getSlots(),
      archives: store.getArchives(),
      borrows: store.getBorrows(),
      logs: store.getLogs(),
      overdue: store.getOverdue(),
      currentUser: store.getCurrentUser()
    }
  })

  useEffect(() => {
    const checkOverdue = () => {
      const today = todayStr()
      const borrows = store.getBorrows()
      let changed = false
      const updatedBorrows = borrows.map((b) => {
        if (
          (b.status === 'borrowed' || b.status === 'approved') &&
          b.expectedReturnDate < today &&
          !b.overdueChecked
        ) {
          changed = true
          return { ...b, status: 'overdue' as const, overdueChecked: true }
        }
        return b
      })

      if (changed) {
        store.setBorrows(updatedBorrows)
        const existingOv = store.getOverdue()
        const existingIds = new Set(existingOv.map((o) => o.borrowRequestId))
        const newOv: OverdueRecord[] = []
        for (const b of updatedBorrows) {
          if (
            b.status === 'overdue' &&
            !existingIds.has(b.id) &&
            b.actualReturnDate == null
          ) {
            const arc = store.getArchives().find((a) => a.id === b.archiveId)
            newOv.push({
              id: uid('ov'),
              borrowRequestId: b.id,
              archiveId: b.archiveId,
              archiveTitle: arc?.title || '未知档案',
              userId: b.applicantId,
              userName: b.applicantName,
              expectedReturnDate: b.expectedReturnDate,
              overdueDays: daysBetween(b.expectedReturnDate, today),
              resolved: false
            })
          }
        }
        if (newOv.length > 0) {
          store.setOverdue([...existingOv, ...newOv])
          addOperationLog('system', '系统', 'MARK_OVERDUE', 'OverdueRecord', null, `自动标记逾期 ${newOv.length} 笔`)
        }
        setState((s) => ({
          ...s,
          borrows: updatedBorrows,
          overdue: store.getOverdue()
        }))
      }
    }
    checkOverdue()
    const timer = setInterval(checkOverdue, 30000)
    return () => clearInterval(timer)
  }, [])

  const addOperationLog = useCallback(
    (userId: string, userName: string, action: string, targetType: string, targetId: string | null, detail: string) => {
      const log: OperationLog = {
        id: uid('log'),
        userId,
        userName,
        action,
        targetType,
        targetId,
        detail,
        timestamp: new Date().toISOString()
      }
      const logs = [log, ...store.getLogs()]
      store.setLogs(logs)
      setState((s) => ({ ...s, logs }))
    },
    []
  )

  const switchUser = useCallback((userId: string) => {
    const users = store.getUsers()
    const user = users.find((u) => u.id === userId) || seedUsers[1]
    store.setCurrentUser(user)
    setState((s) => ({ ...s, currentUser: user }))
    addOperationLog(user.id, user.name, 'SWITCH_USER', 'User', user.id, `切换登录身份为 ${user.name}`)
  }, [addOperationLog])

  const hasUnresolvedOverdue = useCallback(
    (userId: string): boolean => {
      return state.overdue.some((o) => o.userId === userId && !o.resolved)
    },
    [state.overdue]
  )

  const createBorrowRequest = useCallback(
    (archiveId: string, reason: string, expectedReturnDate: string): { ok: boolean; error?: string; request?: BorrowRequest } => {
      const user = state.currentUser
      if (!user) return { ok: false, error: '未登录' }

      const archives = store.getArchives()
      const archive = archives.find((a) => a.id === archiveId)
      if (!archive) return { ok: false, error: '档案不存在' }
      if (archive.isBorrowed) return { ok: false, error: '该档案已借出，暂不可申请' }

      const isClassified = archive.classification === 'secret' || archive.classification === 'confidential'
      if (isClassified && hasUnresolvedOverdue(user.id)) {
        return { ok: false, error: '您有逾期未归还的涉密/机密档案，暂不可申请新的涉密资料借阅' }
      }

      const req: BorrowRequest = {
        id: uid('br'),
        archiveId,
        applicantId: user.id,
        applicantName: user.name,
        reason,
        expectedReturnDate,
        status: 'pending',
        approverId: null,
        approverName: null,
        approvalComment: null,
        approvalDate: null,
        actualReturnDate: null,
        integrityCheck: null,
        createdAt: new Date().toISOString(),
        overdueChecked: false
      }

      const borrows = [req, ...store.getBorrows()]
      store.setBorrows(borrows)
      setState((s) => ({ ...s, borrows }))
      addOperationLog(
        user.id,
        user.name,
        'CREATE_BORROW',
        'BorrowRequest',
        req.id,
        `申请借阅 ${archive.code} ${archive.maskedTitle}`
      )
      return { ok: true, request: req }
    },
    [state.currentUser, hasUnresolvedOverdue, addOperationLog]
  )

  const approveBorrow = useCallback(
    (requestId: string, approve: boolean, comment?: string): { ok: boolean; error?: string } => {
      const user = state.currentUser
      if (!user) return { ok: false, error: '未登录' }

      const borrows = store.getBorrows()
      const idx = borrows.findIndex((b) => b.id === requestId)
      if (idx < 0) return { ok: false, error: '申请不存在' }
      const req = borrows[idx]
      if (req.status !== 'pending') return { ok: false, error: '该申请已处理' }

      const archive = store.getArchives().find((a) => a.id === req.archiveId)
      if (!archive) return { ok: false, error: '档案不存在' }

      if (!canApproveBorrow(user, archive)) {
        return { ok: false, error: needsDepartmentApproval(archive) ? '涉密/机密资料借阅需由部门管理员审批' : '您无审批权限' }
      }

      const updated: BorrowRequest = {
        ...req,
        status: approve ? 'approved' : 'rejected',
        approverId: user.id,
        approverName: user.name,
        approvalComment: comment || null,
        approvalDate: new Date().toISOString()
      }

      let updatedArchives = store.getArchives()
      let updatedSlots = store.getSlots()
      if (approve) {
        updated.status = 'borrowed'
        updatedArchives = updatedArchives.map((a) =>
          a.id === archive.id ? { ...a, isBorrowed: true, slotId: null } : a
        )
        updatedSlots = updatedSlots.map((s) =>
          s.archiveId === archive.id ? { ...s, archiveId: null } : s
        )
      }

      borrows[idx] = updated
      store.setBorrows(borrows)
      store.setArchives(updatedArchives)
      store.setSlots(updatedSlots)
      setState((s) => ({
        ...s,
        borrows,
        archives: updatedArchives,
        slots: updatedSlots
      }))
      addOperationLog(
        user.id,
        user.name,
        approve ? 'APPROVE_BORROW' : 'REJECT_BORROW',
        'BorrowRequest',
        req.id,
        `${approve ? '批准' : '拒绝'} ${req.applicantName} 借阅 ${archive.code}`
      )
      return { ok: true }
    },
    [state.currentUser, addOperationLog]
  )

  const returnArchive = useCallback(
    (requestId: string, integrityCheck: string, slotId?: string): { ok: boolean; error?: string } => {
      const user = state.currentUser
      if (!user) return { ok: false, error: '未登录' }
      if (!integrityCheck.trim()) return { ok: false, error: '请填写资料完整性说明' }

      const borrows = store.getBorrows()
      const idx = borrows.findIndex((b) => b.id === requestId)
      if (idx < 0) return { ok: false, error: '申请不存在' }
      const req = borrows[idx]
      if (!['borrowed', 'overdue', 'approved'].includes(req.status)) {
        return { ok: false, error: '该申请当前不可归还' }
      }

      const archives = store.getArchives()
      const arcIdx = archives.findIndex((a) => a.id === req.archiveId)
      if (arcIdx < 0) return { ok: false, error: '档案不存在' }

      const slots = store.getSlots()
      let targetSlotId = slotId || null
      if (!targetSlotId) {
        const occupied = new Set(slots.filter((s) => s.archiveId).map((s) => s.id))
        const free = slots.find(
          (s) => s.cabinetId === archives[arcIdx].slotId?.split('-').slice(0, 3).join('-') || !occupied.has(s.id)
        )
        if (free) targetSlotId = free.id
      }

      const today = todayStr()
      borrows[idx] = {
        ...req,
        status: 'returned',
        actualReturnDate: today,
        integrityCheck
      }
      archives[arcIdx] = {
        ...archives[arcIdx],
        isBorrowed: false,
        slotId: targetSlotId,
        integrityNote: integrityCheck
      }

      const updatedSlots = slots.map((s) =>
        s.id === targetSlotId ? { ...s, archiveId: archives[arcIdx].id } : s
      )

      const overdue = store.getOverdue().map((o) =>
        o.borrowRequestId === req.id ? { ...o, resolved: true } : o
      )

      store.setBorrows(borrows)
      store.setArchives(archives)
      store.setSlots(updatedSlots)
      store.setOverdue(overdue)
      setState((s) => ({ ...s, borrows, archives, slots: updatedSlots, overdue }))
      addOperationLog(
        user.id,
        user.name,
        'RETURN_ARCHIVE',
        'BorrowRequest',
        req.id,
        `归还 ${archives[arcIdx].code} 完整性：${integrityCheck}`
      )
      return { ok: true }
    },
    [state.currentUser, addOperationLog]
  )

  const getArchiveListForUser = useCallback((): Array<Archive & { viewable: boolean }> => {
    const user = state.currentUser
    return state.archives.map((a) => ({
      ...a,
      viewable: canViewArchiveDetail(user, a)
    }))
  }, [state.archives, state.currentUser])

  const getPendingApprovals = useCallback((): BorrowRequest[] => {
    const user = state.currentUser
    if (!user) return []
    return state.borrows
      .filter((b) => b.status === 'pending')
      .filter((b) => {
        const arc = state.archives.find((a) => a.id === b.archiveId)
        if (!arc) return false
        return canApproveBorrow(user, arc)
      })
  }, [state.borrows, state.archives, state.currentUser])

  const getSlotsByCabinet = useCallback(
    (cabinetId: string): CabinetSlot[] => {
      return state.slots
        .filter((s) => s.cabinetId === cabinetId)
        .sort((a, b) => a.row * 100 + a.col - (b.row * 100 + b.col))
    },
    [state.slots]
  )

  const getArchiveAtSlot = useCallback(
    (slotId: string): Archive | undefined => {
      return state.archives.find((a) => a.slotId === slotId)
    },
    [state.archives]
  )

  const reset = useCallback(() => {
    resetAllData()
    setState({
      users: store.getUsers(),
      cabinets: store.getCabinets(),
      slots: store.getSlots(),
      archives: store.getArchives(),
      borrows: store.getBorrows(),
      logs: store.getLogs(),
      overdue: store.getOverdue(),
      currentUser: store.getCurrentUser()
    })
  }, [])

  return useMemo(
    () => ({
      ...state,
      switchUser,
      createBorrowRequest,
      approveBorrow,
      returnArchive,
      hasUnresolvedOverdue,
      getArchiveListForUser,
      getPendingApprovals,
      getSlotsByCabinet,
      getArchiveAtSlot,
      addOperationLog,
      reset
    }),
    [
      state,
      switchUser,
      createBorrowRequest,
      approveBorrow,
      returnArchive,
      hasUnresolvedOverdue,
      getArchiveListForUser,
      getPendingApprovals,
      getSlotsByCabinet,
      getArchiveAtSlot,
      addOperationLog,
      reset
    ]
  )
}

export type AppStateApi = ReturnType<typeof useAppState>
