import { useState } from 'react'
import type { Archive } from '../types'
import { Modal, Button, FieldLabel } from './UI'
import { ClassificationBadge } from './UI'
import { useApp } from '../hooks/useApp'
import { addDays, todayStr } from '../utils/date'
import { needsDepartmentApproval } from '../utils/permissions'

interface Props {
  open: boolean
  archive: Archive | null
  onClose: () => void
}

export function BorrowRequestModal({ open, archive, onClose }: Props) {
  const app = useApp()
  const [reason, setReason] = useState('')
  const [expectedDate, setExpectedDate] = useState(addDays(todayStr(), 7))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    setReason('')
    setExpectedDate(addDays(todayStr(), 7))
    setError(null)
    setSubmitting(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!archive) return
    if (!reason.trim()) {
      setError('请填写借阅事由')
      return
    }
    if (expectedDate < todayStr()) {
      setError('归还日期不能早于今日')
      return
    }
    setSubmitting(true)
    const result = app.createBorrowRequest(archive.id, reason.trim(), expectedDate)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error || '提交失败')
      return
    }
    reset()
    onClose()
  }

  const isClassified = archive ? needsDepartmentApproval(archive) : false
  const hasOverdue = app.currentUser ? app.hasUnresolvedOverdue(app.currentUser.id) : false

  return (
    <Modal
      open={open && !!archive}
      title="借阅申请"
      onClose={handleClose}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>取消</Button>
          <Button variant="primary" onClick={submit as any} disabled={submitting}>
            提交申请
          </Button>
        </>
      }
    >
      {archive && (
        <form onSubmit={submit} className="space-y-4" data-testid="borrow-form">
          <div className="bg-gray-50 p-3 rounded space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{archive.code}</span>
              <ClassificationBadge level={archive.classification} />
            </div>
            <div className="text-sm">{archive.maskedTitle}</div>
          </div>

          {isClassified && (
            <div className="text-xs bg-amber-50 text-amber-800 p-2 rounded">
              此档案为{archive.classification === 'secret' ? '绝密' : '机密'}资料，需<b>部门管理员</b>审批后方可借阅。
            </div>
          )}

          {hasOverdue && isClassified && (
            <div className="text-xs bg-red-50 text-red-700 p-2 rounded" data-testid="overdue-warning">
              ⚠ 您当前有逾期未归还的涉密/机密档案，<b>本次申请将被拒绝</b>。
            </div>
          )}

          <div>
            <FieldLabel required>借阅事由</FieldLabel>
            <textarea
              data-testid="borrow-reason"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              rows={3}
              placeholder="请详细说明借阅用途..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel required>预计归还日期</FieldLabel>
            <input
              data-testid="borrow-date"
              type="date"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={expectedDate}
              min={todayStr()}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded" data-testid="borrow-error">
              {error}
            </div>
          )}
        </form>
      )}
    </Modal>
  )
}
