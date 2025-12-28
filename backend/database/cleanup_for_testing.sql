-- ============================================================
-- 数据库清理脚本 - 用于从头开始测试
-- 请在 Supabase SQL Editor 中运行
-- ============================================================

-- ⚠️ 警告：此脚本会删除测试数据，请确认后再执行！

-- ============================================================
-- 第1步：清理订单/提交记录
-- ============================================================
DELETE FROM submissions;
-- 确认: SELECT COUNT(*) FROM submissions; -- 应该为 0

-- ============================================================
-- 第2步：清理服务类型申请记录
-- ============================================================
DELETE FROM service_type_applications;
-- 确认: SELECT COUNT(*) FROM service_type_applications; -- 应该为 0

-- ============================================================
-- 第3步：清理服务商档案
-- ============================================================
DELETE FROM provider_profiles;
-- 确认: SELECT COUNT(*) FROM provider_profiles; -- 应该为 0

-- ============================================================
-- 第4步：重置所有用户角色为普通用户（保留 admin）
-- ============================================================
UPDATE users 
SET role = 'user' 
WHERE role = 'provider';
-- 确认: SELECT COUNT(*) FROM users WHERE role = 'provider'; -- 应该为 0

-- ============================================================
-- 可选：如果要完全删除测试用户（保留 admin），取消下面的注释
-- ============================================================
-- DELETE FROM users WHERE role != 'admin';

-- ============================================================
-- 确认清理结果
-- ============================================================
SELECT 'submissions' as table_name, COUNT(*) as count FROM submissions
UNION ALL
SELECT 'service_type_applications', COUNT(*) FROM service_type_applications
UNION ALL
SELECT 'provider_profiles', COUNT(*) FROM provider_profiles
UNION ALL
SELECT 'users (providers)', COUNT(*) FROM users WHERE role = 'provider'
UNION ALL
SELECT 'users (total)', COUNT(*) FROM users;
