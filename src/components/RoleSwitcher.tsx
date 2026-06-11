import { useApp } from '../hooks/useApp'
import { Button } from './UI'

export function RoleSwitcher() {
  const app = useApp()
  const current = app.currentUser

  return (
    <div className="flex items-center gap-3" data-testid="role-switcher">
      <div className="text-right">
        <div className="text-sm font-medium text-gray-800">{current?.name || '未登录'}</div>
        <div className="text-xs text-gray-500">
          {current?.department}
          {current?.role === 'archivist' && ' · 档案员'}
          {current?.role === 'borrower' && ' · 借阅人'}
          {current?.role === 'dept_manager' && ' · 部门管理员'}
          {current?.role === 'auditor' && ' · 审计查看人'}
          {app.currentUser && app.hasUnresolvedOverdue(app.currentUser.id) && (
            <span className="ml-2 text-red-600 font-medium">· 有逾期</span>
          )}
        </div>
      </div>
      <select
        data-testid="role-select"
        value={current?.id || ''}
        onChange={(e) => app.switchUser(e.target.value)}
        className="border rounded-md px-3 py-1.5 text-sm bg-white"
      >
        {app.users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}（
            {u.role === 'archivist' && '档案员'}
            {u.role === 'borrower' && '借阅人'}
            {u.role === 'dept_manager' && '部门管理员'}
            {u.role === 'auditor' && '审计查看人'}
            ）
          </option>
        ))}
      </select>
      <Button variant="ghost" size="sm" onClick={() => app.reset()} title="重置所有数据为初始状态">
        重置数据
      </Button>
    </div>
  )
}
