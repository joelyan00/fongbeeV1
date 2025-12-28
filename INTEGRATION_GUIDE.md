# 优福家家政服务平台 - 前后端集成指南

## 项目架构

```
youfujia-home-services/
├── uniapp-version/          # 前端 UniApp (用户端)
├── admin-dashboard/         # 管理后台 (Vue3 + Element Plus)
└── backend/                 # 后端 API (Express.js)
```

## 快速启动

### 1. 启动后端 API

```bash
cd backend
npm install
npm run dev
```

后端将在 http://localhost:3001 启动

### 2. 启动管理后台

```bash
cd admin-dashboard
npm install
npm run dev
```

管理后台将在 http://localhost:5173 启动

### 3. 启动前端 UniApp

```bash
cd uniapp-version
npm install
npm run dev:h5
```

前端将在 http://localhost:5174 启动

## 功能说明

### ✅ 已实现的功能

#### 用户端 (UniApp)
- [x] 用户注册/登录
- [x] 浏览已发布的服务表单模板
- [x] 提交服务需求表单

#### 管理后台
- [x] 管理员登录
- [x] 查看注册用户列表
- [x] 用户统计数据
- [x] 禁用/启用用户
- [x] 表单模板管理（创建、编辑、删除）
- [x] 发布表单模板

#### 后端 API
- [x] 用户认证（注册、登录、JWT）
- [x] 用户管理 API
- [x] 表单模板 CRUD API
- [x] 表单提交 API
- [x] Mock 数据模式（无需数据库即可运行）

### 数据流程

```
┌────────────────────────────────────────────────────────────────┐
│                         用户流程                                 │
└────────────────────────────────────────────────────────────────┘
     
1. 用户在前端注册 ───► 后端保存用户信息 ───► 管理员后台可查看

2. 管理员创建表单 ───► 发布表单 ───► 前端可使用表单

3. 用户填写表单 ───► 后端保存提交 ───► 管理员后台处理
```

## API 端点

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 公开 |
| POST | /api/auth/login | 用户登录 | 公开 |
| POST | /api/auth/admin/login | 管理员登录 | 公开 |
| GET | /api/users | 获取用户列表 | 管理员 |
| GET | /api/users/stats | 获取用户统计 | 管理员 |
| PATCH | /api/users/:id/status | 更新用户状态 | 管理员 |
| GET | /api/form-templates | 获取所有模板 | 管理员 |
| GET | /api/form-templates/published | 获取已发布模板 | 公开 |
| POST | /api/form-templates | 创建模板 | 管理员 |
| PUT | /api/form-templates/:id | 更新模板 | 管理员 |
| PATCH | /api/form-templates/:id/publish | 发布模板 | 管理员 |
| DELETE | /api/form-templates/:id | 删除模板 | 管理员 |
| GET | /api/submissions | 获取提交列表 | 已登录 |
| POST | /api/submissions | 提交表单 | 已登录 |
| PATCH | /api/submissions/:id/status | 更新提交状态 | 管理员 |

## Demo 账号

### 管理员
- 邮箱: admin@youfujia.com
- 密码: admin123 (或任意密码)

### 用户
- 可使用任意邮箱和密码登录/注册

## 配置 Supabase（可选）

如需持久化数据，请：

1. 在 [Supabase](https://supabase.com) 创建项目
2. 在 SQL Editor 中运行 `backend/database/schema.sql`
3. 配置 `backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-secure-secret
PORT=3001
```

## 测试

### 测试后端 API

```bash
# 健康检查
curl http://localhost:3001/api/health

# 用户注册
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "123456", "name": "测试"}'

# 管理员登录
curl -X POST http://localhost:3001/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@youfujia.com", "password": "admin123"}'

# 获取已发布表单模板
curl http://localhost:3001/api/form-templates/published
```

## 下一步开发

- [ ] 集成真实的 Supabase 数据库
- [ ] 添加表单编辑器 UI
- [ ] 完善服务商管理功能
- [ ] 添加订单状态跟踪
- [ ] 实现支付集成
- [ ] 添加消息通知功能
