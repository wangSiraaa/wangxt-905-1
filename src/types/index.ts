export type UserRole = 'archivist' | 'borrower' | 'dept_manager' | 'auditor'

export type ClassificationLevel = 'public' | 'internal' | 'confidential' | 'secret'

export type BorrowStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'borrowed'
  | 'returned'
  | 'overdue'

export type CabinetStatus = 'normal' | 'locked' | 'maintenance'

export interface User {
  id: string
  name: string
  role: UserRole
  department: string
  permissions: string[]
}

export interface Cabinet {
  id: string
  code: string
  name: string
  floor: number
  status: CabinetStatus
  rows: number
  cols: number
}

export interface CabinetSlot {
  id: string
  cabinetId: string
  row: number
  col: number
  slotCode: string
  archiveId: string | null
}

export interface Archive {
  id: string
  code: string
  title: string
  maskedTitle: string
  classification: ClassificationLevel
  department: string
  description: string
  keywords: string[]
  archivedDate: string
  retentionYears: number
  isBorrowed: boolean
  slotId: string | null
  integrityNote?: string
}

export interface BorrowRequest {
  id: string
  archiveId: string
  applicantId: string
  applicantName: string
  reason: string
  expectedReturnDate: string
  status: BorrowStatus
  approverId: string | null
  approverName: string | null
  approvalComment: string | null
  approvalDate: string | null
  actualReturnDate: string | null
  integrityCheck: string | null
  createdAt: string
  overdueChecked: boolean
}

export interface OperationLog {
  id: string
  userId: string
  userName: string
  action: string
  targetType: string
  targetId: string | null
  detail: string
  timestamp: string
}

export interface OverdueRecord {
  id: string
  borrowRequestId: string
  archiveId: string
  archiveTitle: string
  userId: string
  userName: string
  expectedReturnDate: string
  overdueDays: number
  resolved: boolean
}

export interface FavoriteItem {
  archiveId: string
  userId: string
  addedAt: string
}

export interface CompareItem {
  archiveId: string
  userId: string
  addedAt: string
}
