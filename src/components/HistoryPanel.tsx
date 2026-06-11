import { useMemo, useState } from 'react'
import { useApp } from '../hooks/useApp'
import { StatusBadge, RoleBadge, Button } from './UI'
import { formatDateTime } from '../utils/date'
import type { BorrowRequest } from '../types'

type TabType = 'my' | 'all' | 'overdue' | 'logs'

export function HistoryPanel() {
  const app = useApp()
  const user = app.currentUser
  const [tab, setTab] = useState<TabType>('my')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const myBorrows = useMemo(
    () => (user ? app.borrows.filter((b) => b.applicantId === user.id) : []),
    [app.borrows, user]
  )

  const allBorrows = useMemo(() => app.borrows, [app.borrows])

  const overdueList = useMemo(
    () => app.overdue.sort((a, b) => b.overdueDays - a.overdueDays),
    [app.overdue]
  )

  const logs = useMemo(() => app.logs.slice(0, 200), [app.logs])

  const tabs: { key: TabType; label: string }[] = [
    { key: 'my', label: '我的借阅' },
    { key: 'all', label: '全部记录' },
    { key: 'overdue', label: '逾期记录' },
    { key: 'logs', label: '操作日志' }
  ]

  return (
    <div className="bg-white rounded-lg border" data-testid="history-panel">
      <div className="px-5 py-3 border-b flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">历史记录</h3>
      </div>
      <div className="flex border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            data-testid={`history-tab-${t.key}`}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm transition-colors ${
              tab === t.key
                ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
            {t.key === 'overdue' && overdueList.filter((o) => !o.resolved).length > 0 && (
              <span className="ml-1 bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full">
                {overdueList.filter((o) => !o.resolved).length}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
        {tab === 'my' && (
          <div className="divide-y">
            {myBorrows.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">暂无借阅记录</div>
            ) : (
              myBorrows.map((b) => {
                const arc = app.archives.find((a) => a.id === b.archiveId)
                const isExpanded = expandedId === b.id
                return (
                  <div key={b.id} className="text-sm" data-testid={`history-row-${b.id}`}>
                    <div
                      className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : b.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs">{isExpanded ? '▼' : '▶'}</span>
                          <div>
                            <span className="font-mono text-xs text-gray-500">{arc?.code}</span>
                            <span className="ml-2 font-medium">{arc?.maskedTitle}</span>
                          </div>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                      <div className="text-xs text-gray-500 mt-1 ml-4">
                        提交于 {formatDateTime(b.createdAt)} · 应还 {b.expectedReturnDate}
                        {b.actualReturnDate && ` · 实还 ${b.actualReturnDate}`}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-3 pb-3 ml-4 space-y-2 border-l-2 border-gray-200 ml-6" data-testid={`history-detail-${b.id}`}>
                        <div className="text-xs">
                          <span className="text-gray-500">申请原因：</span>
                          <span className="text-gray-700" data-testid={`reason-${b.id}`}>{b.reason}</span>
                        </div>
                        {b.approverName && (
                          <div className="text-xs">
                            <span className="text-gray-500">审批人：</span>
                            <span className="text-gray-700">{b.approverName}</span>
                            {b.approvalDate && (
                              <span className="text-gray-400 ml-2">于 {formatDateTime(b.approvalDate)}</span>
                            )}
                          </div>
                        )}
                        {b.approvalComment && (
                          <div className="text-xs bg-gray-50 p-2 rounded">
                            <span className="text-gray-500">审批意见：</span>
                            <span className={`${b.status === 'rejected' ? 'text-red-600' : 'text-gray-700'}`} data-testid={`approval-comment-${b.id}`}>
                              {b.approvalComment}
                            </span>
                          </div>
                        )}
                        {b.status === 'rejected' && (
                          <div className="text-xs bg-red-50 text-red-600 p-2 rounded" data-testid={`reject-reason-${b.id}`}>
                            <span className="font-medium">拒绝原因：</span>
                            {b.approvalComment || '未填写具体原因'}
                          </div>
                        )}
                        {b.integrityCheck && (
                          <div className="text-xs bg-amber-50 p-2 rounded">
                            <span className="text-gray-500">归还完整性：</span>
                            <span className="text-gray-700">{b.integrityCheck}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          申请单号：{b.id}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {tab === 'all' && (
          <div className="divide-y">
            {allBorrows.map((b) => {
              const arc = app.archives.find((a) => a.id === b.archiveId)
              const isExpanded = expandedId === b.id
              return (
                <div key={b.id} className="text-sm" data-testid={`history-all-row-${b.id}`}>
                  <div
                    className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : b.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">{isExpanded ? '▼' : '▶'}</span>
                        <div>
                          <span className="font-mono text-xs text-gray-500">{arc?.code}</span>
                          <span className="ml-2 font-medium">{arc?.maskedTitle}</span>
                        </div>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1 ml-4">
                      申请人：{b.applicantName}
                      {b.approverName && ` · 审批：${b.approverName}`}
                      {' · '}应还 {b.expectedReturnDate}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-3 pb-3 ml-4 space-y-2 border-l-2 border-gray-200 ml-6" data-testid={`history-all-detail-${b.id}`}>
                      <div className="text-xs">
                        <span className="text-gray-500">申请原因：</span>
                        <span className="text-gray-700">{b.reason}</span>
                      </div>
                      {b.approverName && (
                        <div className="text-xs">
                          <span className="text-gray-500">审批人：</span>
                          <span className="text-gray-700">{b.approverName}</span>
                          {b.approvalDate && (
                            <span className="text-gray-400 ml-2">于 {formatDateTime(b.approvalDate)}</span>
                          )}
                        </div>
                      )}
                      {b.approvalComment && (
                        <div className="text-xs bg-gray-50 p-2 rounded">
                          <span className="text-gray-500">审批意见：</span>
                          <span className={`${b.status === 'rejected' ? 'text-red-600' : 'text-gray-700'}`}>
                            {b.approvalComment}
                          </span>
                        </div>
                      )}
                      {b.status === 'rejected' && (
                        <div className="text-xs bg-red-50 text-red-600 p-2 rounded">
                          <span className="font-medium">拒绝原因：</span>
                          {b.approvalComment || '未填写具体原因'}
                        </div>
                      )}
                      {b.integrityCheck && (
                        <div className="text-xs bg-amber-50 p-2 rounded">
                          <span className="text-gray-500">归还完整性：</span>
                          <span className="text-gray-700">{b.integrityCheck}</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        申请单号：{b.id}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {tab === 'overdue' && (
          <div className="divide-y">
            {overdueList.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">暂无逾期记录</div>
            ) : (
              overdueList.map((o) => (
                <div key={o.id} className="p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{o.archiveTitle}</span>
                      <span className="ml-2 text-xs text-gray-500">by {o.userName}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        o.resolved
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700 font-medium'
                      }`}
                    >
                      {o.resolved ? '已归还' : `逾期 ${o.overdueDays} 天`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    应还日期：{o.expectedReturnDate}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'logs' && (
          <div className="divide-y">
            {logs.map((l) => (
              <div key={l.id} className="p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{l.action}</span>
                  <span className="text-xs text-gray-500">{formatDateTime(l.timestamp)}</span>
                </div>
                <div className="text-xs text-gray-600 mt-0.5">{l.userName} · {l.detail}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
