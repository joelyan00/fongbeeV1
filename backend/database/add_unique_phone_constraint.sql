-- 1. 处理重复数据 (Clean dupes)
-- 给重复的手机号添加后缀，保留最新创建的一个（或者保留 Provider 身份的账号）
-- 策略：优先保留 role='provider' 的账号，如果有多个则保留最新的。其他的手机号后面加 '_dup_<id>'
UPDATE users
SET phone = phone || '_dup_' || substring(id::text from 1 for 5)
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY phone 
                   ORDER BY 
                       CASE WHEN role = 'provider' THEN 0 ELSE 1 END, -- Provider 优先 (ranked 0)
                       created_at DESC -- 最新的优先
               ) as rnum
        FROM users
        WHERE phone IS NOT NULL AND phone != ''
    ) t
    WHERE t.rnum > 1 -- 排名大于1的都是重复项
);

-- 2. 添加唯一约束 (Add Unique Constraint)
-- 现在数据干净了，可以添加约束
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_key;

-- 为了确保兼容性，先创建唯一索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_unique ON users(phone);

-- 添加约束
ALTER TABLE users 
    ADD CONSTRAINT users_phone_key UNIQUE USING INDEX idx_users_phone_unique;
