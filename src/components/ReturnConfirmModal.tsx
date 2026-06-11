import { useState } from 'react'
import type { Archive, BorrowRequest } from '../types'
import { Modal, Button, FieldLabel } from './UI'
import { useApp } from '../hooks/useApp'

interface Props {
  open: boolean
  archive: Archive | null
  onClose: () => void
}

export function ReturnConfirmModal({ open, archive, onClose }: Props) {
  const app = useApp()
  const [integrity, setIntegrity] = useState('')
  const [error, setError] = useState<string | null>(null)

  const activeBorrow: BorrowRequest | undefined = archive
    ? app.borrows.find(
        (b) =>
          b.archiveId === archive.id &&
          ['borrowed', 'overdue', 'approved'].includes(b.status) &&
          b.applicantId === app.currentUser?.id
      )
    : undefined

  const reset = () => {
    setIntegrity('')
    setError(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const submit = () => {
    if (!archive || !activeBorrow) return
    if (!integrity.trim()) {
      setError('请填写资料完整性检查结果')
      return
    }
    const result = app.returnArchive(activeBorrow.id, integrity.trim())
    if (!result.ok) {
      setError(result.error || '归还失败')
      return
    }
    reset()
    onClose()
  }

  return (
    <Modal
      open={open && !!archive && !!activeBorrow}
      title="归还确认"
      onClose={handleClose}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>取消</Button>
          <Button variant="primary" onClick={submit}>
            确认归还
          </Button>
        </>
      }
    >
      {archive && activeBorrow && (
        <div className="space-y-4" data-testid="return-form">
          <div className="bg-gray-50 p-3 rounded space-y-1 text-sm">
            <div className="font-mono">{archive.code}</div>
            <div>{archive.maskedTitle}</div>
            <div className="text-xs text-gray-500 mt-1">
              借阅人：{activeBorrow.applicantName} · 应还日期：{activeBorrow.expectedReturnDate}
              {activeBorrow.status === 'overdue' && (
                <span className="ml-2 text-red-600 font-medium">（已逾期）</span>
              )}
            </div>
          </div>

          <div>
            <FieldLabel required>资料完整性检查</FieldLabel>
            <textarea
              data-testid="return-integrity"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              rows={3}
              placeholder="请描述资料完整情况：如页数齐全、无涂改、附件完整等..."
              value={integrity}
              onChange={(e) => setIntegrity(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">归还时必须填写资料完整性说明，以便后续审计追踪。</p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded" data-testid="return-error">
              {error}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
