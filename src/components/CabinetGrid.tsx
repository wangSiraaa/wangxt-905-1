import { useMemo } from 'react'
import type { Cabinet, CabinetSlot, Archive } from '../types'
import { useApp } from '../hooks/useApp'
import { CLASSIFICATION_LABELS } from '../constants/permissions'

interface CabinetGridProps {
  cabinet: Cabinet
  onSlotClick: (slot: CabinetSlot, archive?: Archive) => void
  selectedSlotId?: string | null
}

export function CabinetGrid({ cabinet, onSlotClick, selectedSlotId }: CabinetGridProps) {
  const app = useApp()
  const slots = app.getSlotsByCabinet(cabinet.id)

  const grid = useMemo(() => {
    const m: (CabinetSlot | null)[][] = Array.from({ length: cabinet.rows }, () =>
      Array(cabinet.cols).fill(null)
    )
    for (const s of slots) {
      if (s.row < cabinet.rows && s.col < cabinet.cols) m[s.row][s.col] = s
    }
    return m
  }, [slots, cabinet.rows, cabinet.cols])

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-800">{cabinet.name}</h4>
          <p className="text-xs text-gray-500">编号 {cabinet.code} · 共 {cabinet.rows * cabinet.cols} 个柜位</p>
        </div>
        {cabinet.status !== 'normal' && (
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
            {cabinet.status === 'locked' ? '锁定' : '维护中'}
          </span>
        )}
      </div>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cabinet.cols}, minmax(0, 1fr))` }}
      >
        {grid.map((row, ri) =>
          row.map((slot, ci) => {
            if (!slot) return <div key={`${ri}-${ci}`} className="aspect-square bg-gray-100 rounded" />
            const archive = app.getArchiveAtSlot(slot.id)
            const isSelected = selectedSlotId === slot.id
            let bg = 'bg-gray-50'
            let border = 'border-gray-200'
            if (archive) {
              if (archive.classification === 'secret') {
                bg = 'bg-secret-50'; border = 'border-secret-500'
              } else if (archive.classification === 'confidential') {
                bg = 'bg-confidential-50'; border = 'border-confidential-500'
              } else if (archive.classification === 'internal') {
                bg = 'bg-internal-50'; border = 'border-internal-500'
              } else {
                bg = 'bg-public-50'; border = 'border-public-500'
              }
            }
            return (
              <button
                key={slot.id}
                data-testid={`slot-${slot.slotCode}`}
                onClick={() => onSlotClick(slot, archive)}
                className={`slot-cell aspect-square rounded border-2 ${bg} ${border} ${
                  isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                } flex flex-col items-center justify-center text-xs p-1 cursor-pointer`}
              >
                <span className="font-mono text-gray-600 text-[10px]">{slot.slotCode}</span>
                {archive ? (
                  <span
                    data-testid={`slot-archive-${archive.id}`}
                    className="mt-1 text-[10px] font-medium text-gray-700 truncate w-full text-center"
                    title={archive.maskedTitle}
                  >
                    {archive.maskedTitle}
                  </span>
                ) : (
                  <span className="mt-1 text-[10px] text-gray-400">空</span>
                )}
              </button>
            )
          })
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-public-50 border border-public-500" />公开</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-internal-50 border border-internal-500" />内部</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-confidential-50 border border-confidential-500" />机密</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-secret-50 border border-secret-500" />绝密</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-50 border border-gray-200" />空柜位</span>
      </div>
    </div>
  )
}
