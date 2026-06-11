import type {
  User,
  Cabinet,
  CabinetSlot,
  Archive,
  BorrowRequest,
  OperationLog,
  OverdueRecord
} from '../types'

export const seedUsers: User[] = [
  {
    id: 'user-1',
    name: '张档案',
    role: 'archivist',
    department: '档案管理部',
    permissions: []
  },
  {
    id: 'user-2',
    name: '李借阅',
    role: 'borrower',
    department: '研发一部',
    permissions: []
  },
  {
    id: 'user-3',
    name: '王借阅',
    role: 'borrower',
    department: '研发一部',
    permissions: []
  },
  {
    id: 'user-4',
    name: '赵部门',
    role: 'dept_manager',
    department: '研发一部',
    permissions: []
  },
  {
    id: 'user-5',
    name: '陈审计',
    role: 'auditor',
    department: '审计合规部',
    permissions: []
  }
]

export const seedCabinets: Cabinet[] = [
  { id: 'cab-1', code: 'A', name: 'A区资料柜', floor: 1, status: 'normal', rows: 4, cols: 5 },
  { id: 'cab-2', code: 'B', name: 'B区资料柜', floor: 1, status: 'normal', rows: 4, cols: 5 },
  { id: 'cab-3', code: 'C', name: 'C区保密柜', floor: 2, status: 'locked', rows: 3, cols: 4 }
]

function generateSlots(cabinets: Cabinet[]): CabinetSlot[] {
  const slots: CabinetSlot[] = []
  for (const cab of cabinets) {
    for (let r = 0; r < cab.rows; r++) {
      for (let c = 0; c < cab.cols; c++) {
        slots.push({
          id: `slot-${cab.id}-${r}-${c}`,
          cabinetId: cab.id,
          row: r,
          col: c,
          slotCode: `${cab.code}-${r + 1}-${c + 1}`,
          archiveId: null
        })
      }
    }
  }
  return slots
}

export const seedCabinetSlots: CabinetSlot[] = generateSlots(seedCabinets)

export const seedArchives: Archive[] = [
  {
    id: 'arc-1',
    code: 'DOC-2024-001',
    title: '2024年度财务审计报告',
    maskedTitle: '****审计报告（公开资料）',
    classification: 'public',
    department: '财务部',
    description: '公司2024年度财务报表及审计意见，包含资产负债表、利润表、现金流量表等。',
    keywords: ['财务', '审计', '年报'],
    archivedDate: '2025-01-15',
    retentionYears: 10,
    isBorrowed: false,
    slotId: 'slot-cab-1-0-0'
  },
  {
    id: 'arc-2',
    code: 'DOC-2024-002',
    title: '研发部内部工作流程规范V2.0',
    maskedTitle: '****工作流程规范（内部资料）',
    classification: 'internal',
    department: '研发一部',
    description: '研发部项目立项、开发、测试、上线全流程规范说明文档。',
    keywords: ['研发', '流程', '规范'],
    archivedDate: '2025-02-20',
    retentionYears: 5,
    isBorrowed: false,
    slotId: 'slot-cab-1-0-1'
  },
  {
    id: 'arc-3',
    code: 'DOC-2024-003',
    title: '客户合同台账-机密版',
    maskedTitle: '****合同台账（机密资料）',
    classification: 'confidential',
    department: '市场部',
    description: '包含所有重要客户合同详情、金额、条款等敏感信息。仅限授权人员查阅。',
    keywords: ['合同', '客户', '商务'],
    archivedDate: '2025-03-10',
    retentionYears: 15,
    isBorrowed: false,
    slotId: 'slot-cab-3-0-0'
  },
  {
    id: 'arc-4',
    code: 'DOC-2024-004',
    title: '核心算法技术方案-绝密',
    maskedTitle: '****技术方案（绝密资料）',
    classification: 'secret',
    department: '研发一部',
    description: '公司核心AI算法技术实现方案、模型参数、训练数据等绝密信息。\n仅部门管理员及以上权限可查看详情。',
    keywords: ['算法', 'AI', '核心技术'],
    archivedDate: '2025-03-25',
    retentionYears: 20,
    isBorrowed: false,
    slotId: 'slot-cab-3-0-1'
  },
  {
    id: 'arc-5',
    code: 'DOC-2024-005',
    title: '员工花名册2024Q4',
    maskedTitle: '****花名册（内部资料）',
    classification: 'internal',
    department: '人力资源部',
    description: '2024年第四季度全公司员工信息登记表。',
    keywords: ['人事', '员工'],
    archivedDate: '2025-01-05',
    retentionYears: 8,
    isBorrowed: true,
    slotId: null
  },
  {
    id: 'arc-6',
    code: 'DOC-2024-006',
    title: '公司战略规划2025-2027-机密',
    maskedTitle: '****战略规划（机密资料）',
    classification: 'confidential',
    department: '战略规划部',
    description: '公司未来三年战略目标、业务布局、投资计划等核心机密文件。',
    keywords: ['战略', '规划'],
    archivedDate: '2025-02-01',
    retentionYears: 10,
    isBorrowed: false,
    slotId: 'slot-cab-3-1-0'
  },
  {
    id: 'arc-7',
    code: 'DOC-2024-007',
    title: '产品使用手册v3.5',
    maskedTitle: '****使用手册（公开资料）',
    classification: 'public',
    department: '产品部',
    description: '面向用户的产品功能介绍与操作说明手册。',
    keywords: ['产品', '手册'],
    archivedDate: '2025-04-01',
    retentionYears: 3,
    isBorrowed: false,
    slotId: 'slot-cab-1-1-0'
  },
  {
    id: 'arc-8',
    code: 'DOC-2024-008',
    title: '数据安全管理办法-绝密',
    maskedTitle: '****安全管理（绝密资料）',
    classification: 'secret',
    department: '信息安全部',
    description: '公司数据分级、访问控制、加密传输、应急响应等全流程安全管理制度。\n包含敏感技术参数，仅限最高权限人员查阅。',
    keywords: ['安全', '数据', '制度'],
    archivedDate: '2025-03-15',
    retentionYears: 20,
    isBorrowed: false,
    slotId: 'slot-cab-3-1-1'
  }
]

export const seedBorrowRequests: BorrowRequest[] = [
  {
    id: 'br-1',
    archiveId: 'arc-5',
    applicantId: 'user-2',
    applicantName: '李借阅',
    reason: '部门年度绩效考核需要查阅员工信息',
    expectedReturnDate: '2026-06-01',
    status: 'overdue',
    approverId: 'user-1',
    approverName: '张档案',
    approvalComment: '同意，请注意保密',
    approvalDate: '2026-05-20',
    actualReturnDate: null,
    integrityCheck: null,
    createdAt: '2026-05-18T10:00:00Z',
    overdueChecked: true
  },
  {
    id: 'br-2',
    archiveId: 'arc-7',
    applicantId: 'user-3',
    applicantName: '王借阅',
    reason: '培训新员工使用',
    expectedReturnDate: '2026-06-20',
    status: 'borrowed',
    approverId: 'user-1',
    approverName: '张档案',
    approvalComment: '同意',
    approvalDate: '2026-06-05',
    actualReturnDate: null,
    integrityCheck: null,
    createdAt: '2026-06-03T14:20:00Z',
    overdueChecked: false
  },
  {
    id: 'br-3',
    archiveId: 'arc-3',
    applicantId: 'user-2',
    applicantName: '李借阅',
    reason: '商务谈判准备材料',
    expectedReturnDate: '2026-06-25',
    status: 'pending',
    approverId: null,
    approverName: null,
    approvalComment: null,
    approvalDate: null,
    actualReturnDate: null,
    integrityCheck: null,
    createdAt: '2026-06-10T09:30:00Z',
    overdueChecked: false
  }
]

export const seedOperationLogs: OperationLog[] = [
  {
    id: 'log-1',
    userId: 'user-2',
    userName: '李借阅',
    action: 'CREATE_BORROW',
    targetType: 'BorrowRequest',
    targetId: 'br-1',
    detail: '提交借阅申请：DOC-2024-005 员工花名册2024Q4',
    timestamp: '2026-05-18T10:00:00Z'
  },
  {
    id: 'log-2',
    userId: 'user-1',
    userName: '张档案',
    action: 'APPROVE_BORROW',
    targetType: 'BorrowRequest',
    targetId: 'br-1',
    detail: '批准借阅申请：DOC-2024-005',
    timestamp: '2026-05-20T09:00:00Z'
  },
  {
    id: 'log-3',
    userId: 'system',
    userName: '系统',
    action: 'MARK_OVERDUE',
    targetType: 'BorrowRequest',
    targetId: 'br-1',
    detail: '自动标记逾期：DOC-2024-005 应还日期 2026-06-01',
    timestamp: '2026-06-02T00:05:00Z'
  }
]

export const seedOverdueRecords: OverdueRecord[] = [
  {
    id: 'ov-1',
    borrowRequestId: 'br-1',
    archiveId: 'arc-5',
    archiveTitle: '员工花名册2024Q4',
    userId: 'user-2',
    userName: '李借阅',
    expectedReturnDate: '2026-06-01',
    overdueDays: 9,
    resolved: false
  }
]

export const SEED_KEY = 'archive_cabinet_seed_v1'
export const STORAGE_KEYS = {
  USERS: 'ac_users',
  CABINETS: 'ac_cabinets',
  SLOTS: 'ac_slots',
  ARCHIVES: 'ac_archives',
  BORROWS: 'ac_borrows',
  LOGS: 'ac_logs',
  OVERDUE: 'ac_overdue',
  CURRENT_USER: 'ac_current_user'
}
