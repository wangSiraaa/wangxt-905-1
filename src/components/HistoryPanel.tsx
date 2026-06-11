import { useMemo, useState } from 'react'
import { useApp } from '../hooks/useApp'
import { StatusBadge, RoleBadge } from './UI'
import { formatDateTime } from '../utils/date'

type TabType = 'my' | 'all' | 'overdue' | 'logs'

export function HistoryPanel() {
  const app = useApp()
  const user = app.currentUser
  const [tab, setTab] = useState<TabType>('my')

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
                return (
                  <div key={b.id} className="p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-xs text-gray-500">{arc?.code}</span>
                        <span className="ml-2 font-medium">{arc?.maskedTitle}</span>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      提交于 {formatDateTime(b.createdAt)} · 应还 {b.expectedReturnDate}
                      {b.actualReturnDate && ` · 实还 ${b.actualReturnDate}`}
                    </div>
                    {b.integrityCheck && (
                      <div className="text-xs text-gray-600 mt-1 bg-amber-50 p-1.5 rounded">
                        归还完整性：{b.integrityCheck}
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
              return (
                <div key={b.id} className="p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs text-gray-500">{arc?.code}</span>
                      <span className="ml-2 font-medium">{arc?.maskedTitle}</span>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    申请人：{b.applicantName}
                    {b.approverName && ` · 审批：${b.approverName}`}
                    {' · '}应还 {b.expectedReturnDate}
                  </div>
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
