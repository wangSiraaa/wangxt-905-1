import { useApp } from '../hooks/useApp'
import type { Archive } from '../types'
import { ClassificationBadge, Button } from './UI'
import { canViewArchiveDetail, needsDepartmentApproval } from '../utils/permissions'
import { formatDate } from '../utils/date'

interface Props {
  archive: Archive | null
  onBorrow: (archive: Archive) => void
  onReturn: (archive: Archive) => void
}

export function ArchiveDetailPanel({ archive, onBorrow, onReturn }: Props) {
  const app = useApp()
  const user = app.currentUser

  if (!archive) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center text-gray-400">
        <div className="text-4xl mb-2">📁</div>
        <p>请选择柜位或列表中的档案查看详情</p>
      </div>
    )
  }

  const viewable = canViewArchiveDetail(user, archive)
  const isClassified = needsDepartmentApproval(archive)
  const displayTitle = viewable ? archive.title : archive.maskedTitle
  const displayDesc = viewable ? archive.description : '您无权限查看该档案的详细描述，请联系管理员或部门管理员。'
  const displayKeywords = viewable ? archive.keywords : ['***']
  const activeBorrow = app.borrows.find(
    (b) => b.archiveId === archive.id && ['borrowed', 'overdue', 'approved', 'pending'].includes(b.status)
  )

  return (
    <div className="bg-white rounded-lg border" data-testid="archive-detail">
      <div className="px-5 py-3 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">资料详情</h3>
        <ClassificationBadge level={archive.classification} />
      </div>
      <div className="p-5 space-y-3">
        <div>
          <div className="text-xs text-gray-500 mb-1">档案编号</div>
          <div className="font-mono text-sm" data-testid="archive-code">{archive.code}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">标题</div>
          <div
            className={`font-medium ${viewable ? 'text-gray-800' : 'text-gray-500 italic'}`}
            data-testid="archive-title"
          >
            {displayTitle}
            {!viewable && <span className="ml-2 text-xs text-red-500">(脱敏显示)</span>}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">所属部门</div>
          <div className="text-sm">{archive.department}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">归档日期 / 保管期限</div>
          <div className="text-sm">{formatDate(archive.archivedDate)} · {archive.retentionYears} 年</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">关键词</div>
          <div className="flex flex-wrap gap-1">
            {displayKeywords.map((k) => (
              <span key={k} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{k}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">描述</div>
          <div
            className={`text-sm whitespace-pre-line leading-relaxed ${viewable ? 'text-gray-700' : 'text-gray-400'}`}
            data-testid="archive-description"
          >
            {displayDesc}
          </div>
        </div>
        {archive.integrityNote && viewable && (
          <div>
            <div className="text-xs text-gray-500 mb-1">上次归还完整性记录</div>
            <div className="text-sm text-gray-700 bg-amber-50 p-2 rounded">{archive.integrityNote}</div>
          </div>
        )}

        <div className="pt-3 border-t mt-3">
          {archive.isBorrowed ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-red-600 font-medium">当前已借出</div>
                {activeBorrow && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    借阅人：{activeBorrow.applicantName} · 应还：{formatDate(activeBorrow.expectedReturnDate)}
                  </div>
                )}
              </div>
              {activeBorrow &&
                activeBorrow.applicantId === user?.id &&
                ['borrowed', 'overdue', 'approved'].includes(activeBorrow.status) && (
                  <Button variant="primary" onClick={() => onReturn(archive)}>
                    归还
                  </Button>
                )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-gray-500">
                {archive.slotId ? `存放于 ${archive.slotId.split('-').slice(1).join('-')}` : '未定位柜位'}
              </div>
              <Button
                variant="primary"
                onClick={() => onBorrow(archive)}
                data-testid="btn-borrow"
              >
                申请借阅
              </Button>
            </div>
          )}
          {isClassified && viewable && (
            <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded">
              ⚠ 该档案为{archive.classification === 'secret' ? '绝密' : '机密'}资料，借阅需<b>部门管理员</b>审批
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
