# 本地测试检查清单

## 准备工作

### 1. 数据库迁移
- [ ] 打开Supabase Dashboard
- [ ] 进入SQL Editor
- [ ] 执行 `backend/database/migrations/001_create_credits_subscription_tables.sql`
- [ ] 或执行 `backend/database/quick_test.sql` 检查

### 2. 重启后端服务
```bash
# 停止当前运行的后端（Ctrl+C）
# 然后重新启动
cd backend
npm run dev
```

### 3. 验证后端路由
```bash
# 测试健康检查
curl http://localhost:3001/api/health

# 测试服务类别API
curl http://localhost:3001/api/custom-service-categories

# 测试订阅套餐API
curl http://localhost:3001/api/subscription-plans
```

---

## 测试步骤

### 测试1: 后台管理 - 定制服务类别

1. **访问页面**
   - URL: `http://localhost:5173/dashboard/custom-service-categories`
   - 或通过侧边栏导航

2. **测试功能**
   - [ ] 查看类别列表（应显示5个默认类别）
   - [ ] 点击"添加类别"
   - [ ] 填写表单：
     - 名称：测试类别
     - 描述：用于测试
     - 报价所需积分：25
   - [ ] 点击"确定"
   - [ ] 验证列表中出现新类别
   - [ ] 点击"编辑"，修改积分为30
   - [ ] 点击"启用/禁用"切换状态
   - [ ] 点击"删除"（软删除）

3. **预期结果**
   - ✅ 所有操作成功
   - ✅ 显示成功提示
   - ✅ 列表实时更新

---

### 测试2: 后台管理 - 用户订阅管理

1. **访问页面**
   - URL: `http://localhost:5173/dashboard/users/subscriptions`

2. **测试功能**
   - [ ] 查看订阅列表
   - [ ] 如果为空，先创建测试订阅（见下方SQL）
   - [ ] 使用状态筛选
   - [ ] 点击"调整"按钮
   - [ ] 修改剩余积分和上架次数
   - [ ] 点击"详情"查看完整信息

3. **创建测试订阅（在Supabase SQL Editor）**
   ```sql
   -- 先获取一个用户ID
   SELECT id, email FROM users LIMIT 1;
   
   -- 使用该ID创建订阅
   INSERT INTO user_subscriptions (
     user_id, 
     plan_id, 
     status, 
     start_date, 
     end_date,
     remaining_credits, 
     remaining_listings
   ) VALUES (
     'YOUR_USER_ID',  -- 替换为上面查询到的用户ID
     (SELECT id FROM subscription_plans WHERE tier = 'basic' LIMIT 1),
     'active',
     NOW(),
     NOW() + INTERVAL '1 month',
     100,
     5
   );
   ```

4. **预期结果**
   - ✅ 显示订阅列表
   - ✅ 可以调整积分和次数
   - ✅ 详情显示完整

---

### 测试3: 后台管理 - 订阅套餐配置

1. **访问页面**
   - URL: `http://localhost:5173/dashboard/pricing-config`

2. **测试功能**
   - [ ] 切换到"订阅套餐设置"标签
   - [ ] 查看3个订阅级别配置
   - [ ] 修改基础版月费为 39.99
   - [ ] 修改基础版年费为 399.99
   - [ ] 修改基础版上架次数为 10
   - [ ] 点击"保存所有更改"

3. **预期结果**
   - ✅ 配置保存成功
   - ✅ 显示成功提示

---

### 测试4: 服务商页面 - 积分余额

1. **访问页面**
   - URL: `http://localhost:5173/provider/subscription`
   - 需要以服务商身份登录

2. **测试功能**
   - [ ] 查看"购买积分"标签
   - [ ] 检查积分余额显示
   - [ ] 点击刷新按钮
   - [ ] 如果有订阅，应显示：
     - 订阅积分
     - 剩余上架次数
     - 购买积分

3. **预期结果**
   - ✅ 显示实时积分数据
   - ✅ 刷新功能正常
   - ✅ 订阅信息正确显示

---

### 测试5: API测试

1. **获取积分余额**
   ```bash
   # 需要先获取token
   # 登录后从浏览器开发者工具中复制token
   
   curl http://localhost:3001/api/credits/balance \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

   **预期响应**:
   ```json
   {
     "success": true,
     "data": {
       "total": 100,
       "purchased": 0,
       "subscription": 100,
       "listings": 5,
       "subscriptionInfo": { ... }
     }
   }
   ```

2. **获取服务类别**
   ```bash
   curl http://localhost:3001/api/custom-service-categories
   ```

   **预期响应**:
   ```json
   {
     "success": true,
     "data": [
       {
         "id": "...",
         "name": "小型维修",
         "quote_credits_cost": 5,
         ...
       }
     ]
   }
   ```

3. **获取订阅套餐**
   ```bash
   curl http://localhost:3001/api/subscription-plans
   ```

---

## 常见问题排查

### 问题1: 后端API返回404
**原因**: 后端服务未重启
**解决**: 
```bash
# 停止后端（Ctrl+C）
cd backend
npm run dev
```

### 问题2: 页面显示空数据
**原因**: 数据库迁移未执行
**解决**: 
- 在Supabase SQL Editor执行迁移脚本
- 或执行 `quick_test.sql` 检查

### 问题3: 积分余额显示0
**原因**: 用户没有订阅或积分
**解决**: 
- 在Supabase中创建测试订阅（见测试2）
- 或添加积分交易记录

### 问题4: 路由404
**原因**: 前端路由未注册
**解决**: 
- 检查 `admin-dashboard/src/router/index.ts`
- 确保新路由已添加

---

## 测试完成检查

- [ ] 所有5个测试通过
- [ ] 后台管理功能正常
- [ ] 服务商页面显示正确
- [ ] API响应正确
- [ ] 无控制台错误

---

## 下一步

测试通过后，可以：
1. 提交代码到Git
2. 部署到生产环境
3. 集成报价和上架流程（可选）

---

**祝测试顺利！** 🚀
