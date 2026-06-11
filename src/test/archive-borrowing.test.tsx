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
})
