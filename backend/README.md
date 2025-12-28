# 优福家家政服务 - 后端 API

Express.js + Supabase 后端 API 服务

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env`：

```bash
cp .env.example .env
```

#### Mock 模式（无需 Supabase）

默认情况下，如果不配置 Supabase，后端会使用内存 Mock 数据运行。适合本地开发和测试。

#### 配置 Supabase（可选）

如果需要持久化数据，请在 [Supabase](https://supabase.com) 创建项目，然后：

1. 在 Supabase 控制台运行 `database/schema.sql` 创建表
2. 在 `.env` 中配置：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-secure-jwt-secret
PORT=3001
```

### 3. 启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务器将在 http://localhost:3001 启动

## API 端点

### 健康检查
- `GET /api/health` - 检查服务状态

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/admin/login` - 管理员登录

### 用户管理（需要管理员权限）
- `GET /api/users` - 获取用户列表
- `GET /api/users/stats` - 获取用户统计
- `PATCH /api/users/:id/status` - 更新用户状态

### 表单模板
- `GET /api/form-templates` - 获取所有模板
- `GET /api/form-templates/published` - 获取已发布模板（前端用）
- `GET /api/form-templates/:id` - 获取单个模板
- `POST /api/form-templates` - 创建模板（管理员）
- `PUT /api/form-templates/:id` - 更新模板（管理员）
- `PATCH /api/form-templates/:id/publish` - 发布模板（管理员）
- `DELETE /api/form-templates/:id` - 删除模板（管理员）

### 表单提交
- `GET /api/submissions` - 获取提交列表
- `GET /api/submissions/stats` - 获取提交统计（管理员）
- `GET /api/submissions/:id` - 获取单个提交
- `POST /api/submissions` - 创建提交
- `PATCH /api/submissions/:id/status` - 更新提交状态（管理员）

## Demo 账号

Mock 模式下可使用：
- **管理员**: admin@youfujia.com（任意密码）
- **用户**: 任意邮箱和密码（自动创建）

## 测试 API

```bash
# 健康检查
curl http://localhost:3001/api/health

# 用户登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "123456"}'

# 获取已发布表单模板
curl http://localhost:3001/api/form-templates/published
```
