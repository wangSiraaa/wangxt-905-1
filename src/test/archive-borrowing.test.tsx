import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AppLayout } from '../components/AppLayout'
import { clearAllForTest } from '../data/storage'

function renderApp() {
  return render(<AppLayout />)
}

function selectRole(userId: string) {
  const select = screen.getByTestId('role-select') as HTMLSelectElement
  fireEvent.change(select, { target: { value: userId } })
}

describe('档案柜位借阅系统 - 核心业务场景验证', () => {
  beforeEach(() => {
    clearAllForTest()
    localStorage.clear()
  })

  describe('场景1：借阅涉密资料并验证列表展示脱敏标题', () => {
    it('普通借阅人在列表和柜位中只能看到涉密档案的脱敏标题', async () => {
      renderApp()
      await act(async () => {})
      selectRole('user-2')

      await waitFor(() => {
        const row = screen.getByTestId('archive-row-arc-4')
        expect(row).toBeInTheDocument()
      })

      const titleEl = screen.getByTestId('list-title-arc-4')
      expect(titleEl.textContent).toContain('****')
      expect(titleEl.textContent).not.toContain('核心算法技术方案')

      const slotLabel = screen.getByTestId('slot-archive-arc-4')
      expect(slotLabel.textContent).toContain('****')
      expect(slotLabel.textContent).not.toContain('核心算法技术方案')
    })

    it('部门管理员可以在列表中看到涉密档案的真实标题', async () => {
      renderApp()
      await act(async () => {})
      selectRole('user-4')

      await waitFor(() => {
        expect(screen.getByTestId('list-title-arc-4')).toBeInTheDocument()
      })

      const titleEl = screen.getByTestId('list-title-arc-4')
      expect(titleEl.textContent).toContain('核心算法技术方案')
      expect(titleEl.textContent).not.toContain('****')
    })

    it('普通借阅人可发起涉密资料借阅申请（需部门管理员审批）', async () => {
      renderApp()
      await act(async () => {})
      selectRole('user-3')

      await waitFor(() => {
        expect(screen.getByTestId('archive-row-arc-4')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('archive-row-arc-4'))

      await waitFor(() => {
        expect(screen.getByTestId('archive-detail')).toBeInTheDocument()
        expect(screen.getByTestId('btn-borrow')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('btn-borrow'))

      await waitFor(() => {
        expect(screen.getByTestId('borrow-form')).toBeInTheDocument()
      })

      fireEvent.change(screen.getByTestId('borrow-reason'), {
        target: { value: '算法调研需要' }
      })
      fireEvent.change(screen.getByTestId('borrow-date'), {
        target: { value: '2026-07-01' }
      })

      const submitBtn = screen.getByText('提交申请')
      fireEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.queryByTestId('borrow-form')).not.toBeInTheDocument()
      })

      selectRole('user-4')
      await waitFor(() => {
        expect(screen.getByTestId('approval-panel')).toBeInTheDocument()
      })

      const approveBtns = screen.getAllByTestId(/^btn-approve-/)
      expect(approveBtns.length).toBeGreaterThan(0)
    })
  })

  describe('场景2：无权限用户看不到涉密详情', () => {
    it('普通借阅人查看绝密档案详情时，标题和描述为脱敏内容', async () => {
      renderApp()
      await act(async () => {})
      selectRole('user-2')

      await waitFor(() => {
        expect(screen.getByTestId('archive-row-arc-4')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('archive-row-arc-4'))

      await waitFor(() => {
        expect(screen.getByTestId('archive-detail')).toBeInTheDocument()
      })

      const title = screen.getByTestId('archive-title')
      expect(title.textContent).toContain('****技术方案')
      expect(title.textContent).toContain('(脱敏显示)')

      const desc = screen.getByTestId('archive-description')
      expect(desc.textContent).toContain('您无权限查看')
      expect(desc.textContent).not.toContain('核心AI算法技术实现方案')
    })

    it('部门管理员查看绝密档案详情时，标题和描述完整可见', async () => {
      renderApp()
      await act(async () => {})
      selectRole('user-4')

      await waitFor(() => {
        expect(screen.getByTestId('archive-row-arc-4')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('archive-row-arc-4'))

      await waitFor(() => {
        expect(screen.getByTestId('archive-detail')).toBeInTheDocument()
      })

      const title = screen.getByTestId('archive-title')
      expect(title.textContent).toContain('核心算法技术方案-绝密')
      expect(title.textContent).not.toContain('脱敏')

      const desc = screen.getByTestId('archive-description')
      expect(desc.textContent).toContain('核心AI算法技术实现方案')
    })

    it('审计查看人可以查看涉密档案详情但不能申请借阅', async () => {
      renderApp()
      await act(async () => {})
      selectRole('user-5')

      await waitFor(() => {
        expect(screen.getByTestId('archive-row-arc-8')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('archive-row-arc-8'))

      await waitFor(() => {
        expect(screen.getByTestId('archive-detail')).toBeInTheDocument()
      })

      const title = screen.getByTestId('archive-title')
      expect(title.textContent).toContain('数据安全管理办法')
      expect(screen.queryByText('(脱敏显示)')).not.toBeInTheDocument()
    })

    it('普通借阅人切换角色后能看到不同权限级别的内容', async () => {
      renderApp()
      await act(async () => {})

      selectRole('user-2')
      await waitFor(() => {
        expect(screen.getByTestId('archive-row-arc-4')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('archive-row-arc-4'))
      await waitFor(() => expect(screen.getByTestId('archive-title')).toBeInTheDocument())
      expect(screen.getByTestId('archive-title').textContent).toContain('****')

      selectRole('user-1')
      await waitFor(() => {
        expect(screen.getByTestId('archive-title').textContent).toContain('核心算法技术方案')
      })
    })
  })

  describe('场景3：逾期人员再次借涉密资料失败', () => {
    it('逾期用户（李借阅）申请涉密资料时被拦截', async () => {
      renderApp()
      await act(async () => {})

      selectRole('user-2')

      const switcher = screen.getByTestId('role-switcher')
      await waitFor(() => {
        expect(within(switcher).getByText(/有逾期/)).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByTestId('archive-row-arc-4')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('archive-row-arc-4'))

      await waitFor(() => {
        expect(screen.getByTestId('btn-borrow')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('btn-borrow'))

      await waitFor(() => {
        expect(screen.getByTestId('borrow-form')).toBeInTheDocument()
        expect(screen.getByTestId('overdue-warning')).toBeInTheDocument()
      })

      fireEvent.change(screen.getByTestId('borrow-reason'), {
        target: { value: '工作需要' }
      })
      fireEvent.change(screen.getByTestId('borrow-date'), {
        target: { value: '2026-07-10' }
      })

      const submitBtn = screen.getByText('提交申请')
      fireEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByTestId('borrow-error')).toBeInTheDocument()
      })
      expect(screen.getByTestId('borrow-error').textContent).toContain('逾期未归还')
    })

    it('非逾期用户（王借阅）可以正常申请涉密资料', async () => {
      renderApp()
      await act(async () => {})

      selectRole('user-3')

      const switcher = screen.getByTestId('role-switcher')
      expect(within(switcher).queryByText(/有逾期/)).not.toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByTestId('archive-row-arc-4')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('archive-row-arc-4'))

      await waitFor(() => {
        expect(screen.getByTestId('btn-borrow')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('btn-borrow'))

      await waitFor(() => {
        expect(screen.getByTestId('borrow-form')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('overdue-warning')).not.toBeInTheDocument()

      fireEvent.change(screen.getByTestId('borrow-reason'), {
        target: { value: '项目研发需要参考' }
      })
      fireEvent.change(screen.getByTestId('borrow-date'), {
        target: { value: '2026-07-15' }
      })

      const submitBtn = screen.getByText('提交申请')
      fireEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.queryByTestId('borrow-form')).not.toBeInTheDocument()
      })
    })

    it('逾期用户申请公开资料仍可成功（只限制涉密/机密）', async () => {
      renderApp()
      await act(async () => {})

      selectRole('user-2')

      await waitFor(() => {
        expect(screen.getByTestId('archive-row-arc-1')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('archive-row-arc-1'))

      await waitFor(() => {
        expect(screen.getByTestId('btn-borrow')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('btn-borrow'))

      await waitFor(() => {
        expect(screen.getByTestId('borrow-form')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('overdue-warning')).not.toBeInTheDocument()

      fireEvent.change(screen.getByTestId('borrow-reason'), {
        target: { value: '参考公开财务数据' }
      })
      fireEvent.change(screen.getByTestId('borrow-date'), {
        target: { value: '2026-07-20' }
      })

      const submitBtn = screen.getByText('提交申请')
      fireEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.queryByTestId('borrow-form')).not.toBeInTheDocument()
      })
    })
  })

  describe('场景4：审批阶段逾期拦截回归验证', () => {
    it('部门管理员批准李借阅的机密申请（br-3）时被拦截，申请变为拒绝状态', async () => {
      renderApp()
      await act(async () => {})

      selectRole('user-4')

      await waitFor(() => {
        expect(screen.getByTestId('approval-panel')).toBeInTheDocument()
      })

      const pendingRows = screen.getAllByTestId(/^approval-row-/)
      expect(pendingRows.length).toBeGreaterThan(0)

      const br3Row = screen.getByTestId('approval-row-br-3')
      expect(br3Row).toBeInTheDocument()
      expect(br3Row.textContent).toContain('李借阅')
      expect(br3Row.textContent).toContain('机密')

      const approveBtn = screen.getByTestId('btn-approve-br-3')
      fireEvent.click(approveBtn)

      await waitFor(() => {
        expect(screen.queryByTestId('approval-row-br-3')).not.toBeInTheDocument()
      })

      const historyTab = screen.getByTestId('history-tab-all')
      fireEvent.click(historyTab)

      await waitFor(() => {
        const allRecords = screen.getAllByText(/DOC-2024-003/)
        expect(allRecords.length).toBeGreaterThan(0)
      })

      const rejectedBadges = screen.getAllByText('已拒绝')
      expect(rejectedBadges.length).toBeGreaterThan(0)
    })

    it('涉密审批被拒绝后，档案仍在柜位（isBorrowed=false）', async () => {
      renderApp()
      await act(async () => {})

      selectRole('user-4')

      await waitFor(() => {
        expect(screen.getByTestId('btn-approve-br-3')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('btn-approve-br-3'))

      await waitFor(() => {
        expect(screen.queryByTestId('approval-row-br-3')).not.toBeInTheDocument()
      })

      selectRole('user-2')
      await waitFor(() => {
        expect(screen.getByTestId('archive-row-arc-3')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('archive-row-arc-3'))

      await waitFor(() => {
        expect(screen.getByTestId('btn-borrow')).toBeInTheDocument()
      })
    })

    it('非涉密资料审批不检查逾期，可正常批准', async () => {
      renderApp()
      await act(async () => {})

      selectRole('user-3')
      await waitFor(() => {
        expect(screen.getByTestId('archive-row-arc-1')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('archive-row-arc-1'))
      await waitFor(() => {
        expect(screen.getByTestId('btn-borrow')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('btn-borrow'))
      await waitFor(() => {
        expect(screen.getByTestId('borrow-form')).toBeInTheDocument()
      })
      fireEvent.change(screen.getByTestId('borrow-reason'), {
        target: { value: '参考公开材料' }
      })
      fireEvent.change(screen.getByTestId('borrow-date'), {
        target: { value: '2026-07-10' }
      })
      fireEvent.click(screen.getByText('提交申请'))
      await waitFor(() => {
        expect(screen.queryByTestId('borrow-form')).not.toBeInTheDocument()
      })

      selectRole('user-1')
      await waitFor(() => {
        expect(screen.getByTestId('approval-panel')).toBeInTheDocument()
      })

      const approveBtns = screen.getAllByTestId(/^btn-approve-/)
      const publicApproveBtn = approveBtns.find((btn) => {
        const row = btn.closest('[data-testid^="approval-row-"]')
        return row && row.textContent?.includes('公开')
      })
      expect(publicApproveBtn).toBeDefined()
      fireEvent.click(publicApproveBtn!)

      await waitFor(() => {
        expect(screen.getAllByText('借阅中').length).toBeGreaterThan(0)
      })
    })

    it('无逾期的正常申请人涉密申请可正常通过审批', async () => {
      renderApp()
      await act(async () => {})

      selectRole('user-3')
      await waitFor(() => {
        expect(screen.getByTestId('archive-row-arc-4')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('archive-row-arc-4'))
      await waitFor(() => {
        expect(screen.getByTestId('btn-borrow')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('btn-borrow'))
      await waitFor(() => {
        expect(screen.getByTestId('borrow-form')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('overdue-warning')).not.toBeInTheDocument()
      fireEvent.change(screen.getByTestId('borrow-reason'), {
        target: { value: '算法研发参考' }
      })
      fireEvent.change(screen.getByTestId('borrow-date'), {
        target: { value: '2026-07-15' }
      })
      fireEvent.click(screen.getByText('提交申请'))
      await waitFor(() => {
        expect(screen.queryByTestId('borrow-form')).not.toBeInTheDocument()
      })

      selectRole('user-4')
      await waitFor(() => {
        expect(screen.getByTestId('approval-panel')).toBeInTheDocument()
      })

      const pendingRows = screen.getAllByTestId(/^approval-row-/)
      const targetRow = pendingRows.find((r) => r.textContent?.includes('王借阅') && r.textContent?.includes('绝密'))
      expect(targetRow).toBeDefined()

      const rowId = targetRow!.getAttribute('data-testid')
      const requestId = rowId!.replace('approval-row-', '')

      const approveBtn = screen.getByTestId(`btn-approve-${requestId}`)
      fireEvent.click(approveBtn)

      await waitFor(() => {
        expect(screen.queryByTestId(rowId!)).not.toBeInTheDocument()
      })

      const historyTab = screen.getByTestId('history-tab-all')
      fireEvent.click(historyTab)
      await waitFor(() => {
        expect(screen.getAllByText('借阅中').length).toBeGreaterThan(0)
      })
    })

    it('审批逾期拦截会生成操作日志记录', async () => {
      renderApp()
      await act(async () => {})

      selectRole('user-4')
      await waitFor(() => {
        expect(screen.getByTestId('btn-approve-br-3')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('btn-approve-br-3'))

      await waitFor(() => {
        expect(screen.queryByTestId('approval-row-br-3')).not.toBeInTheDocument()
      })

      const logsTab = screen.getByTestId('history-tab-logs')
      fireEvent.click(logsTab)

      await waitFor(() => {
        const blockLogs = screen.getAllByText(/逾期记录/)
        expect(blockLogs.length).toBeGreaterThan(0)
      })
    })
  })
})
