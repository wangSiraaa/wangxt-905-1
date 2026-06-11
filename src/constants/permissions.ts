import type { UserRole, ClassificationLevel } from '../types'

export const ROLE_LABELS: Record<UserRole, string> = {
  archivist: '档案员',
  borrower: '借阅人',
  dept_manager: '部门管理员',
  auditor: '审计查看人'
}

export const CLASSIFICATION_LABELS: Record<ClassificationLevel, string> = {
  public: '公开',
  internal: '内部',
  confidential: '机密',
  secret: '绝密'
}

export const CLASSIFICATION_LEVEL: Record<ClassificationLevel, number> = {
  public: 0,
  internal: 1,
  confidential: 2,
  secret: 3
}

export const BORROW_STATUS_LABELS: Record<string, string> = {
  pending: '待审批',
  approved: '已批准',
  rejected: '已拒绝',
  borrowed: '借阅中',
  returned: '已归还',
  overdue: '已逾期'
}

export const ACTIONS = {
  VIEW_ARCHIVE_LIST: 'view:archive:list',
  VIEW_ARCHIVE_DETAIL: 'view:archive:detail',
  VIEW_CLASSIFIED_DETAIL: 'view:classified:detail',
  VIEW_SECRET_DETAIL: 'view:secret:detail',
  CREATE_BORROW_REQUEST: 'create:borrow:request',
  APPROVE_BORROW: 'approve:borrow',
  APPROVE_SECRET_BORROW: 'approve:secret:borrow',
  RETURN_ARCHIVE: 'return:archive',
  EDIT_CABINET: 'edit:cabinet',
  EDIT_CLASSIFICATION: 'edit:classification',
  VIEW_OVERDUE: 'view:overdue',
  VIEW_ALL_HISTORY: 'view:all:history',
  VIEW_AUDIT_LOGS: 'view:audit:logs',
  MANAGE_USERS: 'manage:users'
} as const

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  archivist: [
    ACTIONS.VIEW_ARCHIVE_LIST,
    ACTIONS.VIEW_ARCHIVE_DETAIL,
    ACTIONS.VIEW_CLASSIFIED_DETAIL,
    ACTIONS.VIEW_SECRET_DETAIL,
    ACTIONS.CREATE_BORROW_REQUEST,
    ACTIONS.APPROVE_BORROW,
    ACTIONS.RETURN_ARCHIVE,
    ACTIONS.EDIT_CABINET,
    ACTIONS.EDIT_CLASSIFICATION,
    ACTIONS.VIEW_OVERDUE,
    ACTIONS.VIEW_ALL_HISTORY,
    ACTIONS.VIEW_AUDIT_LOGS
  ],
  borrower: [
    ACTIONS.VIEW_ARCHIVE_LIST,
    ACTIONS.VIEW_ARCHIVE_DETAIL,
    ACTIONS.CREATE_BORROW_REQUEST,
    ACTIONS.RETURN_ARCHIVE
  ],
  dept_manager: [
    ACTIONS.VIEW_ARCHIVE_LIST,
    ACTIONS.VIEW_ARCHIVE_DETAIL,
    ACTIONS.VIEW_CLASSIFIED_DETAIL,
    ACTIONS.VIEW_SECRET_DETAIL,
    ACTIONS.CREATE_BORROW_REQUEST,
    ACTIONS.APPROVE_BORROW,
    ACTIONS.APPROVE_SECRET_BORROW,
    ACTIONS.RETURN_ARCHIVE,
    ACTIONS.VIEW_OVERDUE,
    ACTIONS.VIEW_ALL_HISTORY
  ],
  auditor: [
    ACTIONS.VIEW_ARCHIVE_LIST,
    ACTIONS.VIEW_ARCHIVE_DETAIL,
    ACTIONS.VIEW_CLASSIFIED_DETAIL,
    ACTIONS.VIEW_SECRET_DETAIL,
    ACTIONS.VIEW_OVERDUE,
    ACTIONS.VIEW_ALL_HISTORY,
    ACTIONS.VIEW_AUDIT_LOGS
  ]
}
