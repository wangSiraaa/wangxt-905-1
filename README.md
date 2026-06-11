# 档案柜位借阅系统

基于 React + TypeScript + Vite + TailwindCSS 构建的档案柜位借阅管理 Web 前端。
所有数据存储在浏览器 localStorage，本地刷新后借阅状态、脱敏规则仍可复查。

## 功能特性

- **柜位可视化**：3 组资料柜（A/B/C），按行×列展示每个柜位的占用情况，颜色区分密级
- **四级密级**：公开 / 内部 / 机密 / 绝密，涉密资料列表只显示脱敏标题
- **四种角色**：
  - 档案员（archivist）：全权限，可管理柜位、密级、审批、归还
  - 借阅人（borrower）：查看（涉密列表脱敏）、申请借阅与归还本人借阅
  - 部门管理员（dept_manager）：审批涉密/机密借阅、查看详情、本人借阅
  - 审计查看人（auditor）：查看全部档案详情、查看所有历史与操作日志
- **借阅审批**：涉密/机密资料必须由部门管理员审批；普通资料可由档案员或部门管理员审批
- **逾期管理**：逾期未归还人员不能再申请新的涉密/机密资料；自动标记逾期并生成记录
- **归还管理**：归还时必须填写资料完整性说明
- **权限保护**：普通借阅人不能修改柜位或密级；无权限用户查看涉密档案仅显示脱敏信息
- **历史追溯**：我的借阅、全部记录、逾期记录、操作日志四个视图
- **本地持久化**：全部状态存入 localStorage，刷新后可复查借阅与脱敏状态

## 快速启动

### 方式一：本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 生产构建
npm run build
npm run preview
```

### 方式二：Docker Compose

```bash
# 启动开发模式
docker compose up -d web

# 访问 http://localhost:5173

# 运行生产预览
docker compose --profile preview up -d preview
# 访问 http://localhost:5174
```

### 方式三：单容器构建

```bash
docker build -t archive-cabinet .
docker run -p 5173:5173 archive-cabinet
```

## 验证测试

```bash
# 本地运行
npm test

# Docker 运行
docker compose --profile test run --rm test
```

测试覆盖 3 个核心场景：

| 测试文件 | 场景 |
|---|---|
| `src/test/archive-borrowing.test.tsx` | 场景1：借阅涉密资料并验证列表展示脱敏标题 |
| `src/test/archive-borrowing.test.tsx` | 场景2：无权限用户看不到涉密详情 |
| `src/test/archive-borrowing.test.tsx` | 场景3：逾期人员再次借涉密资料失败 |
| `src/test/business-rules.test.ts` | 核心数据层规则校验（密级、角色、柜位关联） |

## 种子数据（演示账号）

系统默认初始化 5 位用户，可通过页面右上角下拉切换身份：

| 账号 | 角色 | 部门 | 备注 |
|---|---|---|---|
| 张档案 | 档案员 | 档案管理部 | 全权限 |
| 李借阅 | 借阅人 | 研发一部 | **有逾期未归还记录**，用于验证场景3 |
| 王借阅 | 借阅人 | 研发一部 | 正常状态，可对照 |
| 赵部门 | 部门管理员 | 研发一部 | 可审批涉密/机密借阅 |
| 陈审计 | 审计查看人 | 审计合规部 | 仅查看，不可申请/审批 |

档案种子覆盖 4 个密级、在柜与借出等多种状态。
点击页面右上角「重置数据」可随时恢复为初始种子数据。

## 目录结构

```
src/
├── components/        # UI 组件
│   ├── AppLayout.tsx         # 主布局
│   ├── ArchiveDetailPanel.tsx # 资料详情
│   ├── ArchiveList.tsx       # 资料列表（含筛选）
│   ├── ApprovalPanel.tsx     # 审批面板
│   ├── BorrowRequestModal.tsx# 借阅申请弹窗
│   ├── CabinetGrid.tsx       # 柜位图
│   ├── HistoryPanel.tsx      # 历史记录（4个tab）
│   ├── ReturnConfirmModal.tsx# 归还确认弹窗
│   ├── RoleSwitcher.tsx      # 角色切换
│   └── UI.tsx                # 基础UI组件
├── constants/
│   └── permissions.ts        # 角色、密级、权限常量
├── data/
│   ├── seed.ts               # 种子数据
│   └── storage.ts            # localStorage 持久化
├── hooks/
│   ├── useApp.ts             # Context 访问
│   └── useAppState.ts        # 全局状态与业务逻辑
├── test/                     # Vitest 测试
├── types/
│   └── index.ts              # TypeScript 类型定义
├── utils/
│   ├── date.ts               # 日期工具
│   └── permissions.ts        # 权限校验函数
├── index.css
└── main.tsx
```

## 业务规则要点

1. **脱敏规则**：档案的 `maskedTitle` 字段始终用于列表与柜位展示；仅当用户有权限查看详情时才显示真实 `title` 和 `description`。
2. **借阅审批链**：`classification ∈ {confidential, secret}` → 必须 `dept_manager` 审批；其余 → 档案员或部门管理员均可审批。
3. **逾期限制**：用户存在任意一条未解决的 `overdue` 记录时，对涉密/机密资料的借阅申请会在提交时被拦截并返回错误。
4. **归还完整性**：`returnArchive` 强制校验 `integrityCheck` 非空，并写入 `OperationLog`。
5. **柜位占用**：借阅批准后自动清空档案的 `slotId` 与对应柜位的 `archiveId`；归还时重新分配柜位。
