-- Add province column to cities table
ALTER TABLE cities ADD COLUMN IF NOT EXISTS province TEXT;

-- Backfill existing data
UPDATE cities SET province = 'Ontario (ON)' WHERE name IN ('多伦多', '万锦', '列治文山', '基奇纳', '基奇纳');
UPDATE cities SET province = 'Ontario (ON)' WHERE name IN ('滑铁卢', '渥太华', '滑铁卢', '圭尔夫', '伦敦', '温莎', '汉密尔顿', '剑桥');
UPDATE cities SET province = 'British Columbia (BC)' WHERE name IN ('温哥华', '列治文', '本拿比', '素里', '高贵林');
UPDATE cities SET province = 'Alberta (AB)' WHERE name IN ('卡尔加里', '埃德蒙顿');
UPDATE cities SET province = 'Quebec (QC)' WHERE name IN ('蒙特利尔');
UPDATE cities SET province = 'Manitoba (MB)' WHERE name IN ('温尼伯');
UPDATE cities SET province = 'Saskatchewan (SK)' WHERE name IN ('萨斯卡通', '里贾纳');

-- Update some codes if needed
UPDATE cities SET code = 'kitchener' WHERE name = '基奇纳';
UPDATE cities SET code = 'guelph' WHERE name = '圭尔夫';
UPDATE cities SET code = 'waterloo' WHERE name = '滑铁卢';
