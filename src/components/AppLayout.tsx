import { useState } from 'react'
import { AppStateContext } from '../hooks/useApp'
import { useAppState } from '../hooks/useAppState'
import { RoleSwitcher } from './RoleSwitcher'
import { CabinetGrid } from './CabinetGrid'
import { ArchiveList } from './ArchiveList'
import { ArchiveDetailPanel } from './ArchiveDetailPanel'
import { ApprovalPanel } from './ApprovalPanel'
import { HistoryPanel } from './HistoryPanel'
import { BorrowRequestModal } from './BorrowRequestModal'
import { ReturnConfirmModal } from './ReturnConfirmModal'
import { ComparePanel } from './ComparePanel'
import type { Archive, CabinetSlot } from '../types'

export function AppLayout() {
  const appState = useAppState()
  const [selectedArchive, setSelectedArchive] = useState<Archive | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<CabinetSlot | null>(null)
  const [borrowOpen, setBorrowOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)

  const handleSlotClick = (slot: CabinetSlot, arc?: Archive) => {
    setSelectedSlot(slot)
    if (arc) setSelectedArchive(arc)
    else setSelectedArchive(null)
  }

  const handleBorrow = (arc: Archive) => {
    setSelectedArchive(arc)
    setBorrowOpen(true)
  }

  const handleReturn = (arc: Archive) => {
    setSelectedArchive(arc)
    setReturnOpen(true)
  }

  return (
    <AppStateContext.Provider value={appState}>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white border-b shadow-sm" data-testid="app-header">
          <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-800">档案柜位借阅系统</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                支持柜位占用展示、密级权限控制、借阅审批流程、逾期审计追踪
              </p>
            </div>
            <RoleSwitcher />
          </div>
        </header>

        <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5 space-y-4">
              <div className="space-y-3">
                {appState.cabinets.map((cab) => (
                  <CabinetGrid
                    key={cab.id}
                    cabinet={cab}
                    onSlotClick={handleSlotClick}
                    selectedSlotId={selectedSlot?.id}
                  />
                ))}
              </div>
            </div>

            <div className="col-span-4 space-y-4">
              <ArchiveDetailPanel
                archive={selectedArchive}
                onBorrow={handleBorrow}
                onReturn={handleReturn}
                onOpenCompare={() => setCompareOpen(true)}
              />
              <ApprovalPanel onViewArchive={setSelectedArchive} />
            </div>

            <div className="col-span-3 space-y-4">
              <ArchiveList
                onSelect={(a) => {
                  setSelectedArchive(a)
                  const slot = appState.slots.find((s) => s.id === a.slotId)
                  setSelectedSlot(slot || null)
                }}
                selectedId={selectedArchive?.id}
                onOpenCompare={() => setCompareOpen(true)}
              />
              <HistoryPanel />
            </div>
          </div>
        </main>

        <BorrowRequestModal
          open={borrowOpen}
          archive={selectedArchive}
          onClose={() => setBorrowOpen(false)}
        />
        <ReturnConfirmModal
          open={returnOpen}
          archive={selectedArchive}
          onClose={() => setReturnOpen(false)}
        />
        <ComparePanel
          open={compareOpen}
          onClose={() => setCompareOpen(false)}
          onViewArchive={(a) => {
            setSelectedArchive(a)
            const slot = appState.slots.find((s) => s.id === a.slotId)
            setSelectedSlot(slot || null)
            setCompareOpen(false)
          }}
        />
      </div>
    </AppStateContext.Provider>
  )
}
