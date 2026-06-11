import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { AppLayout } from '../components/AppLayout'
import { clearAllForTest } from '../data/storage'

function renderApp() {
  return render(<AppLayout />)
}

function selectRole(userId: string) {
  const select = screen.getByTestId('role-select') as HTMLSelectElement
  fireEvent.change(select, { target: { value: userId } })
}

describe('smoke-905: 收藏对比与流程查询复查', () => {
  beforeEach(() => {
    clearAllForTest()
    localStorage.clear()
  })

  describe('收藏功能测试', () => {
    it('列表页可以收藏和取消收藏档案', async () => {
      renderApp()
      await act(async () => {})
      selectRole('user-1')

      await waitFor(() => {
        expect(screen.getByTestId('archive-row-arc-1')).toBeInTheDocument()
      })

      const favBtn = screen.getByTestId('btn-favorite-arc-1')
      expect(favBtn.textContent).toBe('☆')

      fireEvent.click(favBtn)
      await waitFor(() => {
        expect(screen.getByTestId('btn-favorite-arc-1').textContent).toBe('★')
      })

      fireEvent.click(screen.getByTestId('btn-favorite-arc-1'))
      await waitFor(() => {
        expect(screen.getByTestId('btn-favorite-arc-1').textContent).toBe('☆')
      })
    })

    it('收藏页签可以查看已收藏的档案，空态有提示', async () => {
      renderApp()
      await act(async () => {})
      selectRole('user-1')

      await waitFor(() => {
        expect(screen.getByTestId('view-mode-favorites')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('view-mode-favorites'))
      await waitFor(() => {
        expect(screen.getByTestId('favorites-empty')).toBeInTheDocument()
      })
      expect(screen.getByText('暂无收藏的档案')).toBeInTheDocument()

      fireEvent.click(screen.getByTestId('view-mode-all'))
      await waitFor(() => {
        expect(screen.getByTestId('archive-row-arc-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('btn-favorite-arc-1'))
      fireEvent.click(screen.getByTestId('btn-favorite-arc-2'))

      fireEvent.click(screen.getByTestId('view-mode-favorites'))
      await waitFor(() => {
        expect(screen.getByTestId('archive-row-arc-1')).toBeInTheDocument()
        expect(screen.getByTestId('archive-row-arc-2')).toBeInTheDocument()
      })
    })

    it('详情页可以收藏和取消收藏档案', async () => {
      renderApp()
      await act(async () => {})
      selectRole('user-1')

      await waitFor(() => {
        expect(screen.getByTestId('archive-row-arc-1')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('archive-row-arc-1'))

      await waitFor(() => {
        expect(screen.getByTestId('archive-detail')).toBeInTheDocument()
      })

      const detailFavBtn = screen.getByTestId('btn-detail-favorite')
      expect(detailFavBtn.textContent).toBe('☆')

      fireEvent.click(detailFavBtn)
      await waitFor(() => {
        expect(screen.getByTestId('btn-detail-favorite').textContent).toBe('★')
      })

      expect(screen.getByTestId('btn-favorite-arc-1').textContent).toBe('★')
    })
  })

  describe('对比功能测试', () => {
    it('列表页可以添加和移除对比档案', async () => {
      renderApp()
      await act(async () => {})
      selectRole('user-1')

      await waitFor(() => {
        expect(screen.getByTestId('archive-row-arc-1')).toBeInTheDocument()
      })

      const compareBtn = screen.getByTestId('btn-compare-arc-1')
      expect(compareBtn.textContent).toBe('对比')

      fireEvent.click(compareBtn)
      await waitFor(() => {
        expect(screen.getByTestId('btn-compare-arc-1').textContent).toBe('已对比')
      })

      expect(screen.getByTestId('btn-open-compare')).toBeInTheDocument()
      expect(screen.getByTestId('btn-open-compare').textContent).toContain('1')

      fireEvent.click(screen.getByTestId('btn-compare-arc-1'))
      await waitFor(() => {
        expect(screen.getByTestId('btn-compare-arc-1').textContent).toBe('对比')
      })
    })

    it('对比面板可以查看对比详情，空态有提示', async () => {
      renderApp()
      await act(async () => {})
      selectRole('user-1')

      await waitFor(() => {
        expect(screen.getByTestId('btn-compare-arc-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('btn-compare-arc-1'))
      fireEvent.click(screen.getByTestId('btn-open-compare'))

      await waitFor(() => {
        expect(screen.getByTestId('compare-panel')).toBeInTheDocument()
      })

      expect(screen.getByTestId('compare-table')).toBeInTheDocument()
      expect(screen.getByText('档案编号')).toBeInTheDocument()
      expect(screen.getByText('密级')).toBeInTheDocument()
      expect(screen.getByText('所属部门')).toBeInTheDocument()

      fireEvent.click(screen.getByTestId('btn-clear-compare'))
      await waitFor(() => {
        expect(screen.getByTestId('compare-empty')).toBeInTheDocument()
      })
      expect(screen.getByText('暂无对比档案')).toBeInTheDocument()
    })

    it('详情页可以添加和移除对比', async () => {
      renderApp()
      await act(async () => {})
      selectRole('user-1')

      await waitFor(() => {
        expect(screen.getByTestId('archive-row-arc-1')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('archive-row-arc-1'))

      await waitFor(() => {
        expect(screen.getByTestId('btn-detail-compare')).toBeInTheDocument()
      })

      expect(screen.getByTestId('btn-detail-compare').textContent).toBe('加入对比')
      fireEvent.click(screen.getByTestId('btn-detail-compare'))

      await waitFor(() => {
        expect(screen.getByTestId('btn-detail-compare').textContent).toBe('移出对比')
      })

      expect(screen.getByTestId('btn-detail-open-compare')).toBeInTheDocument()
    })

    it('对比最多添加5个档案', async () => {
      renderApp()
      await act(async () => {})
      selectRole('user-1')

      await waitFor(() => {
        expect(screen.getByTestId('archive-row-arc-1')).toBeInTheDocument()
      })

      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      fireEvent.click(screen.getByTestId('btn-compare-arc-1'))
      fireEvent.click(screen.getByTestId('btn-compare-arc-2'))
      fireEvent.click(screen.getByTestId('btn-compare-arc-3'))
      fireEvent.click(screen.getByTestId('btn-compare-arc-4'))
      fireEvent.click(screen.getByTestId('btn-compare-arc-5'))

      fireEvent.click(screen.getByTestId('btn-compare-arc-6'))

      expect(alertSpy).toHaveBeenCalledWith('对比列表最多添加5个档案')
      alertSpy.mockRestore()
    })
  })

  describe('流程查询复查测试', () => {
    it('我的借阅记录可以展开查看申请原因', async () => {
      renderApp()
      await act(async () => {})
      selectRole('user-2')

      await waitFor(() => {
        expect(screen.getByTestId('history-tab-my')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('history-tab-my'))

      await waitFor(() => {
        expect(screen.getByTestId('history-row-br-1')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('history-detail-br-1')).not.toBeInTheDocument()

      const rowHeader = screen.getByTestId('history-row-br-1').querySelector('div:first-child')
      if (rowHeader) {
        fireEvent.click(rowHeader)
      }

      await waitFor(() => {
        expect(screen.getByTestId('history-detail-br-1')).toBeInTheDocument()
      })

      expect(screen.getByTestId('reason-br-1')).toBeInTheDocument()
      expect(screen.getByTestId('reason-br-1').textContent).toContain('绩效考核')
    })

    it('审批通过的记录可以查看审批意见', async () => {
      renderApp()
      await act(async () => {})
      selectRole('user-2')

      await waitFor(() => {
        expect(screen.getByTestId('history-tab-my')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('history-tab-my'))

      await waitFor(() => {
        expect(screen.getByTestId('history-row-br-1')).toBeInTheDocument()
      })

      const rowHeader = screen.getByTestId('history-row-br-1').querySelector('div:first-child')
      if (rowHeader) {
        fireEvent.click(rowHeader)
      }

      await waitFor(() => {
        expect(screen.getByTestId('approval-comment-br-1')).toBeInTheDocument()
      })
      expect(screen.getByTestId('approval-comment-br-1').textContent).toContain('同意')
    })

    it('被拒绝的申请可以查看拒绝原因', async () => {
      renderApp()
      await act(async () => {})
      selectRole('user-4')

      await waitFor(() => {
        expect(screen.getByTestId('approval-panel')).toBeInTheDocument()
        expect(screen.getByTestId('btn-reject-br-3')).toBeInTheDocument()
      })

      const rejectBtn = screen.getByTestId('btn-reject-br-3')
      fireEvent.click(rejectBtn)

      await waitFor(() => {
        expect(screen.queryByTestId('approval-row-br-3')).not.toBeInTheDocument()
      })

      selectRole('user-2')

      await waitFor(() => {
        expect(screen.getByTestId('history-tab-my')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('history-tab-my'))

      await waitFor(() => {
        expect(screen.getByTestId('history-row-br-3')).toBeInTheDocument()
      })

      const rowHeader = screen.getByTestId('history-row-br-3').querySelector('div:first-child')
      if (rowHeader) {
        fireEvent.click(rowHeader)
      }

      await waitFor(() => {
        expect(screen.getByTestId('history-detail-br-3')).toBeInTheDocument()
      })

      expect(screen.getByTestId('reject-reason-br-3')).toBeInTheDocument()
    })

    it('全部记录页签可以展开查看详情', async () => {
      renderApp()
      await act(async () => {})
      selectRole('user-1')

      await waitFor(() => {
        expect(screen.getByTestId('history-tab-all')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByTestId('history-tab-all'))

      await waitFor(() => {
        expect(screen.getByTestId('history-all-row-br-1')).toBeInTheDocument()
      })

      const rowHeader = screen.getByTestId('history-all-row-br-1').querySelector('div:first-child')
      if (rowHeader) {
        fireEvent.click(rowHeader)
      }

      await waitFor(() => {
        expect(screen.getByTestId('history-all-detail-br-1')).toBeInTheDocument()
      })

      expect(screen.getByText('申请原因：')).toBeInTheDocument()
    })
  })

  describe('收藏对比与权限集成测试', () => {
    it('涉密档案在对比中也遵循权限脱敏规则', async () => {
      renderApp()
      await act(async () => {})
      selectRole('user-2')

      await waitFor(() => {
        expect(screen.getByTestId('btn-compare-arc-4')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('btn-compare-arc-4'))
      fireEvent.click(screen.getByTestId('btn-open-compare'))

      await waitFor(() => {
        expect(screen.getByTestId('compare-panel')).toBeInTheDocument()
      })

      const table = screen.getByTestId('compare-table')
      expect(table.textContent).toContain('****')
      expect(table.textContent).not.toContain('核心算法技术方案')
    })

    it('部门管理员可以在对比中看到涉密档案的真实信息', async () => {
      renderApp()
      await act(async () => {})
      selectRole('user-4')

      await waitFor(() => {
        expect(screen.getByTestId('btn-compare-arc-4')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByTestId('btn-compare-arc-4'))
      fireEvent.click(screen.getByTestId('btn-open-compare'))

      await waitFor(() => {
        expect(screen.getByTestId('compare-panel')).toBeInTheDocument()
      })

      const table = screen.getByTestId('compare-table')
      expect(table.textContent).toContain('核心算法技术方案')
    })
  })
})
