import type { User, Archive, ClassificationLevel } from '../types'
import { ROLE_PERMISSIONS, ACTIONS, CLASSIFICATION_LEVEL } from '../constants/permissions'

export function hasPermission(user: User | null, action: string): boolean {
  if (!user) return false
  const perms = ROLE_PERMISSIONS[user.role] || []
  return perms.includes(action)
}

export function canViewArchiveDetail(user: User | null, archive: Archive): boolean {
  if (!user) return false
  const level: ClassificationLevel = archive.classification

  if (level === 'public') return true
  if (level === 'internal') return hasPermission(user, ACTIONS.VIEW_ARCHIVE_DETAIL)
  if (level === 'confidential') return hasPermission(user, ACTIONS.VIEW_CLASSIFIED_DETAIL)
  if (level === 'secret') return hasPermission(user, ACTIONS.VIEW_SECRET_DETAIL)
  return false
}

export function canApproveBorrow(user: User | null, archive: Archive): boolean {
  if (!user) return false
  if (archive.classification === 'secret' || archive.classification === 'confidential') {
    return hasPermission(user, ACTIONS.APPROVE_SECRET_BORROW)
  }
  return hasPermission(user, ACTIONS.APPROVE_BORROW)
}

export function needsDepartmentApproval(archive: Archive): boolean {
  return archive.classification === 'secret' || archive.classification === 'confidential'
}

export function canEditCabinet(user: User | null): boolean {
  return hasPermission(user, ACTIONS.EDIT_CABINET)
}

export function canEditClassification(user: User | null): boolean {
  return hasPermission(user, ACTIONS.EDIT_CLASSIFICATION)
}

export function getMaxClassificationLevel(user: User | null): ClassificationLevel {
  if (!user) return 'public'
  if (hasPermission(user, ACTIONS.VIEW_SECRET_DETAIL)) return 'secret'
  if (hasPermission(user, ACTIONS.VIEW_CLASSIFIED_DETAIL)) return 'confidential'
  return 'internal'
}

export function isClassificationAccessible(
  user: User | null,
  level: ClassificationLevel
): boolean {
  const maxLevel = getMaxClassificationLevel(user)
  return CLASSIFICATION_LEVEL[level] <= CLASSIFICATION_LEVEL[maxLevel]
}
