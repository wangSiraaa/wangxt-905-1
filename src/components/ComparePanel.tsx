import { useApp } from '../hooks/useApp'
import type { Archive } from '../types'
import { ClassificationBadge, Button, Modal } from './UI'
import { canViewArchiveDetail } from '../utils/permissions'
import { formatDate } from '../utils/date'
import { CLASSIFICATION_LABELS } from '../constants/permissions'

interface Props {
  open: boolean
  onClose: () => void
  onViewArchive?: (archive: Archive) => void
}

export function ComparePanel({ open, onClose, onViewArchive }: Props) {
  const app = useApp()
  const user = app.currentUser
  const compareList = app.getCompareList()

  const handleRemove = (archiveId: string) => {
    app.toggleCompare(archiveId)
  }

  const handleClear = () => {
    app.clearCompare()
  }

  const compareFields = [
    { key: 'code', label: '档案编号' },
    { key: 'classification', label: '密级' },
    { key: 'department', label: '所属部门' },
    { key: 'archivedDate', label: '归档日期' },
    { key: 'retentionYears', label: '保管期限' },
    { key: 'isBorrowed', label: '借阅状态' }
  ] as const

  const getFieldValue = (archive: Archive, field: string) => {
    const viewable = canViewArchiveDetail(user, archive)
    switch (field) {
      case 'code':
        return archive.code
      case 'classification':
        return CLASSIFICATION_LABELS[archive.classification]
      case 'department':
        return archive.department
      case 'archivedDate':
        return formatDate(archive.archivedDate)
      case 'retentionYears':
        return `${archive.retentionYears} 年`
      case 'isBorrowed':
        return archive.isBorrowed ? '已借出' : '在柜'
      default:
        return '-'
    }
  }

  return (
    <Modal
      open={open}
      title="档案对比"
      onClose={onClose}
      footer={
        <div className="flex justify-between w-full">
          <Button
            variant="danger"
            size="sm"
            onClick={handleClear}
            disabled={compareList.length === 0}
            data-testid="btn-clear-compare"
          >
            清空对比
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            关闭
          </Button>
        </div>
      }
    >
      <div className="compare-panel" data-testid="compare-panel">
        {compareList.length === 0 ? (
          <div className="p-8 text-center" data-testid="compare-empty">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-400 text-sm mb-2">暂无对比档案</p>
            <p className="text-gray-400 text-xs">在档案列表或详情页点击"对比"按钮可添加档案进行对比</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="compare-table">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium w-28">对比项</th>
                  {compareList.map((arc) => (
                    <th key={arc.id} className="text-left py-2 px-3 min-w-[180px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-gray-800 truncate" title={arc.maskedTitle}>
                          {canViewArchiveDetail(user, arc) ? arc.title : arc.maskedTitle}
                        </span>
                        <button
                          onClick={() => handleRemove(arc.id)}
                          className="text-gray-400 hover:text-red-500 text-lg leading-none"
                          data-testid={`btn-remove-compare-${arc.id}`}
                          title="移出对比"
                        >
                          ×
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <ClassificationBadge level={arc.classification} />
                      </div>
                      {onViewArchive && (
                        <button
                          onClick={() => onViewArchive(arc)}
                          className="text-xs text-blue-600 hover:underline mt-1"
                          data-testid={`btn-view-detail-${arc.id}`}
                        >
                          查看详情 →
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareFields.map((field) => (
                  <tr key={field.key} className="border-b last:border-0">
                    <td className="py-2 px-3 text-gray-500 font-medium">{field.label}</td>
                    {compareList.map((arc) => (
                      <td key={arc.id} className="py-2 px-3 text-gray-700">
                        {getFieldValue(arc, field.key)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-b">
                  <td className="py-2 px-3 text-gray-500 font-medium align-top">关键词</td>
                  {compareList.map((arc) => {
                    const viewable = canViewArchiveDetail(user, arc)
                    const keywords = viewable ? arc.keywords : ['***']
                    return (
                      <td key={arc.id} className="py-2 px-3">
                        <div className="flex flex-wrap gap-1">
                          {keywords.map((k, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 px-2 py-0.5 rounded"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      </td>
                    )
                  })}
                </tr>
                <tr>
                  <td className="py-2 px-3 text-gray-500 font-medium align-top">描述</td>
                  {compareList.map((arc) => {
                    const viewable = canViewArchiveDetail(user, arc)
                    const desc = viewable ? arc.description : '您无权限查看该档案的详细描述'
                    return (
                      <td key={arc.id} className={`py-2 px-3 ${viewable ? 'text-gray-700' : 'text-gray-400'}`}>
                        <div className="text-sm whitespace-pre-line leading-relaxed line-clamp-4">
                          {desc}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {compareList.length > 0 && compareList.length < 2 && (
          <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-700">
            💡 再添加 {2 - compareList.length} 个档案可以更直观地对比差异
          </div>
        )}
      </div>
    </Modal>
  )
}
