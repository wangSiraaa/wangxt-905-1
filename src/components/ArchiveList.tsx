import { useMemo, useState } from 'react'
import type { Archive, ClassificationLevel } from '../types'
import { useApp } from '../hooks/useApp'
import { ClassificationBadge, StatusBadge, RoleBadge, Button } from './UI'
import { CLASSIFICATION_LABELS } from '../constants/permissions'
import { canViewArchiveDetail } from '../utils/permissions'

type ViewMode = 'all' | 'favorites'

interface Props {
  onSelect: (archive: Archive) => void
  selectedId?: string | null
  filterOverdue?: boolean
  onToggleOverdue?: (v: boolean) => void
}

export function ArchiveList({ onSelect, selectedId, filterOverdue = false, onToggleOverdue, onOpenCompare }: Props & { onOpenCompare?: () => void }) {
  const app = useApp()
  const user = app.currentUser
  const [search, setSearch] = useState('')
  const [classificationFilter, setClassificationFilter] = useState<ClassificationLevel | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'borrowed' | 'available'>('all')
  const [onlyOverdue, setOnlyOverdue] = useState(filterOverdue)
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  const overdueUserIds = useMemo(
    () => new Set(app.overdue.filter((o) => !o.resolved).map((o) => o.userId)),
    [app.overdue]
  )

  const compareCount = useMemo(() => {
    if (!user) return 0
    return app.compare.filter((c) => c.userId === user.id).length
  }, [app.compare, user])

  const favoriteCount = useMemo(() => {
    if (!user) return 0
    return app.favorites.filter((f) => f.userId === user.id).length
  }, [app.favorites, user])

  const list = useMemo(() => {
    let data = app.archives.slice()

    if (viewMode === 'favorites') {
      const favIds = new Set(
        app.favorites.filter((f) => f.userId === user?.id).map((f) => f.archiveId)
      )
      data = data.filter((a) => favIds.has(a.id))
    }

    if (classificationFilter !== 'all') {
      data = data.filter((a) => a.classification === classificationFilter)
    }
    if (statusFilter === 'borrowed') data = data.filter((a) => a.isBorrowed)
    if (statusFilter === 'available') data = data.filter((a) => !a.isBorrowed)
    if (onlyOverdue) {
      const borrowedByOverdue = new Set(
        app.borrows
          .filter((b) => overdueUserIds.has(b.applicantId) && ['borrowed', 'overdue'].includes(b.status))
          .map((b) => b.archiveId)
      )
      data = data.filter((a) => borrowedByOverdue.has(a.id))
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      data = data.filter(
        (a) =>
          a.code.toLowerCase().includes(q) ||
          a.maskedTitle.toLowerCase().includes(q) ||
          (canViewArchiveDetail(user, a) && a.title.toLowerCase().includes(q))
      )
    }
    return data
  }, [app.archives, app.borrows, app.favorites, classificationFilter, statusFilter, onlyOverdue, search, overdueUserIds, user, viewMode])

  const handleOverdueToggle = (v: boolean) => {
    setOnlyOverdue(v)
    onToggleOverdue?.(v)
  }

  const handleFavoriteClick = (e: React.MouseEvent, archiveId: string) => {
    e.stopPropagation()
    app.toggleFavorite(archiveId)
  }

  const handleCompareClick = (e: React.MouseEvent, archiveId: string) => {
    e.stopPropagation()
    const result = app.toggleCompare(archiveId)
    if (!result && !app.isInCompare(archiveId)) {
      alert('对比列表最多添加5个档案')
    }
  }

  const isEmptyState = viewMode === 'favorites' && favoriteCount === 0

  return (
    <div className="bg-white rounded-lg border" data-testid="archive-list">
      <div className="px-5 py-3 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">资料列表</h3>
          {compareCount > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onOpenCompare}
              data-testid="btn-open-compare"
            >
              对比 ({compareCount})
            </Button>
          )}
        </div>
        <div className="flex border-b mb-3 -mx-5 px-5">
          <button
            data-testid="view-mode-all"
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 text-sm transition-colors ${
              viewMode === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            全部
          </button>
          <button
            data-testid="view-mode-favorites"
            onClick={() => setViewMode('favorites')}
            className={`px-3 py-1.5 text-sm transition-colors flex items-center gap-1 ${
              viewMode === 'favorites'
                ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            收藏
            {favoriteCount > 0 && (
              <span className="bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded-full">
                {favoriteCount}
              </span>
            )}
          </button>
        </div>
        <div className="space-y-2">
          <input
            data-testid="search-input"
            type="text"
            placeholder="搜索档案编号或标题..."
            className="w-full border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 items-center">
            <select
              className="border rounded-md px-2 py-1 text-xs"
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value as ClassificationLevel | 'all')}
              data-testid="filter-classification"
            >
              <option value="all">全部密级</option>
              {(Object.keys(CLASSIFICATION_LABELS) as ClassificationLevel[]).map((l) => (
                <option key={l} value={l}>{CLASSIFICATION_LABELS[l]}</option>
              ))}
            </select>
            <select
              className="border rounded-md px-2 py-1 text-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              data-testid="filter-status"
            >
              <option value="all">全部状态</option>
              <option value="available">在柜</option>
              <option value="borrowed">借出</option>
            </select>
            <label className="flex items-center gap-1 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={onlyOverdue}
                onChange={(e) => handleOverdueToggle(e.target.checked)}
                data-testid="filter-overdue"
              />
              <span className="text-red-600">只看逾期</span>
            </label>
          </div>
        </div>
      </div>
      <div className="divide-y max-h-[500px] overflow-y-auto scrollbar-thin">
        {isEmptyState ? (
          <div className="p-8 text-center" data-testid="favorites-empty">
            <div className="text-4xl mb-2">⭐</div>
            <p className="text-gray-400 text-sm mb-2">暂无收藏的档案</p>
            <p className="text-gray-400 text-xs">点击档案列表中的星标按钮可收藏档案</p>
          </div>
        ) : list.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">无匹配档案</div>
        ) : (
          list.map((a) => {
            const viewable = canViewArchiveDetail(user, a)
            const br = app.borrows.find(
              (b) => b.archiveId === a.id && ['borrowed', 'overdue', 'approved', 'pending'].includes(b.status)
            )
            const isFav = app.isFavorite(a.id)
            const inCompare = app.isInCompare(a.id)
            return (
              <div
                key={a.id}
                data-testid={`archive-row-${a.id}`}
                className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                  selectedId === a.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => onSelect(a)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-gray-500">{a.code}</span>
                      <ClassificationBadge level={a.classification} />
                      {br && <StatusBadge status={br.status} />}
                    </div>
                    <div
                      className={`text-sm mt-1 truncate ${viewable ? 'text-gray-800 font-medium' : 'text-gray-500 italic'}`}
                      data-testid={`list-title-${a.id}`}
                    >
                      {viewable ? a.title : a.maskedTitle}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {a.department}
                      {br && (
                        <>
                          {' · '}
                          <span className={br.status === 'overdue' ? 'text-red-600' : ''}>
                            {br.applicantName}持有 · 应还 {br.expectedReturnDate}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <button
                      data-testid={`btn-favorite-${a.id}`}
                      onClick={(e) => handleFavoriteClick(e, a.id)}
                      className={`text-lg transition-colors ${
                        isFav ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                      }`}
                      title={isFav ? '取消收藏' : '收藏'}
                    >
                      {isFav ? '★' : '☆'}
                    </button>
                    <button
                      data-testid={`btn-compare-${a.id}`}
                      onClick={(e) => handleCompareClick(e, a.id)}
                      className={`text-xs px-2 py-0.5 rounded transition-colors ${
                        inCompare
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                      title={inCompare ? '移出对比' : '加入对比'}
                    >
                      {inCompare ? '已对比' : '对比'}
                    </button>
                    {br && overdueUserIds.has(br.applicantId) && (
                      <RoleBadge role="auditor" />
                    )}
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
