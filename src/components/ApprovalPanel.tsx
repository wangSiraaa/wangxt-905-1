import { useApp } from '../hooks/useApp'
import { StatusBadge, ClassificationBadge, Button } from './UI'
import type { BorrowRequest, Archive } from '../types'
import { formatDateTime } from '../utils/date'
import { canApproveBorrow, needsDepartmentApproval } from '../utils/permissions'

interface Props {
  onViewArchive?: (archive: Archive) => void
}

export function ApprovalPanel({ onViewArchive }: Props) {
  const app = useApp()
  const user = app.currentUser
  const pending = app.getPendingApprovals()

  const getArchive = (id: string) => app.archives.find((a) => a.id === id)

  const handleApprove = (req: BorrowRequest, approve: boolean) => {
    const comment = approve ? '' : '不符合借阅条件'
    const result = app.approveBorrow(req.id, approve, comment)
    if (!result.ok) {
      alert(result.error)
    }
  }

  if (!user) return null

  const canApproveSome = pending.length > 0

  return (
    <div className="bg-white rounded-lg border" data-testid="approval-panel">
      <div className="px-5 py-3 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">审批面板</h3>
        {pending.length > 0 && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
            {pending.length} 待审批
          </span>
        )}
      </div>

      <div className="divide-y max-h-[400px] overflow-y-auto scrollbar-thin">
        {pending.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            {canApproveSome ? '暂无待审批申请' : '您当前无审批权限或无待审批事项'}
          </div>
        ) : (
          pending.map((req) => {
            const arc = getArchive(req.archiveId)
            const isClassified = arc ? needsDepartmentApproval(arc) : false
            const canDo = arc ? canApproveBorrow(user, arc) : false
            return (
              <div key={req.id} className="p-4" data-testid={`approval-row-${req.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm text-gray-600">{arc?.code}</span>
                      {arc && <ClassificationBadge level={arc.classification} />}
                      <StatusBadge status={req.status} />
                    </div>
                    <div className="text-sm font-medium">
                      {arc ? arc.maskedTitle : '未知档案'}
                    </div>
                    <div className="text-xs text-gray-500">
                      申请人：{req.applicantName} · 提交于 {formatDateTime(req.createdAt)}
                    </div>
                    <div className="text-xs text-gray-600">事由：{req.reason}</div>
                    <div className="text-xs text-gray-500">预计归还：{req.expectedReturnDate}</div>
                    {isClassified && (
                      <div className="text-xs text-amber-700">
                        🔒 {arc?.classification === 'secret' ? '绝密' : '机密'}资料，需部门管理员审批
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {onViewArchive && arc && (
                      <Button variant="ghost" size="sm" onClick={() => onViewArchive(arc)}>
                        查看档案
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!canDo}
                      onClick={() => handleApprove(req, true)}
                      data-testid={`btn-approve-${req.id}`}
                    >
                      批准
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={!canDo}
                      onClick={() => handleApprove(req, false)}
                      data-testid={`btn-reject-${req.id}`}
                    >
                      拒绝
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
