import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Helper to generate 6-digit code
const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create Transporter
// Will only work if environment variables are set.
const createTransporter = () => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return null;
    }
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

// Send Email Function
export const sendVerificationEmail = async (email, type) => {
    const code = generateCode();
    const transporter = createTransporter();

    // Always log for debugging, even if we send the real email
    console.log('\n================================================');
    console.log(`[DEBUG] Generated code ${code} for ${email} (${type})`);

    // If no credentials, fall back to mock
    if (!transporter) {
        console.log('⚠️ No SMTP credentials found (SMTP_USER/SMTP_PASS). Using MOCK mode.');
        console.log(`[EMAIL MOCK] To: ${email}`);
        console.log(`[EMAIL MOCK] CODE: ${code}`);
        console.log('================================================\n');
        return code;
    }

    const subject = type === 'register' ? '【优服佳】注册验证码' : '【优服佳】重置密码验证码';
    const actionText = type === 'register' ? '注册账号' : '重置密码';

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #059669;">优服佳 Fongbee Service</h2>
            </div>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="color: #374151; font-size: 16px;">您正在进行 <strong>${actionText}</strong> 操作</p>
                <p style="color: #6b7280; font-size: 14px;">您的验证码是：</p>
                <h1 style="color: #059669; font-size: 32px; letter-spacing: 5px; margin: 10px 0;">${code}</h1>
                <p style="color: #9ca3af; font-size: 12px;">验证码 10 分钟内有效。如非本人操作，请忽略此邮件。</p>
            </div>
            <div style="margin-top: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
                &copy; ${new Date().getFullYear()} Fongbee Service. All rights reserved.
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"优服佳安全中心" <${process.env.SMTP_USER}>`,
            to: email,
            subject,
            html
        });
        console.log(`✅ [EMAIL SENT] Successfully sent verification code to ${email}`);
        console.log('================================================\n');
    } catch (error) {
        console.error('❌ [EMAIL ERROR] Failed to send email:', error);
        // Fallback: still return code so user *might* see it in logs if they are admin, 
        // strictly speaking we should probably throw error, but for dev ease we log it.
        throw new Error('发送邮件失败，请检查邮箱设置或稍后再试');
    }

    return code;
};

// Send Provider Hired Notification
export const sendProviderHiredNotification = async (email, order, depositAmount) => {
    const transporter = createTransporter();
    if (!transporter) {
        console.log('[EMAIL MOCK] Provider Notification skipped (No SMTP credentials)');
        return;
    }

    const subject = `【优服佳】恭喜！您有新的订单已确认 (订单号: ${order.id.slice(0, 8)})`;

    // Format form data for email
    let orderDetailsHtml = '';
    if (order.form_data && typeof order.form_data === 'object') {
        orderDetailsHtml = '<ul style="list-style: none; padding: 0;">';

        const formatValue = (v) => {
            if (v === null || v === undefined) return '';
            if (typeof v === 'string' || typeof v === 'number') return v;
            if (typeof v === 'object') {
                // Handle Address Objects
                if (v.address || v.name) {
                    return [v.name, v.address].filter(Boolean).join(' - ');
                }
                // Handle arrays (e.g. multiple values)
                if (Array.isArray(v)) return v.map(formatValue).join(', ');

                // Fallback: join values
                return Object.values(v).join(', ');
            }
            return String(v);
        };

        const sortedKeys = Object.keys(order.form_data).sort((a, b) => {
            // Put _order_no first
            if (a === '_order_no') return -1;
            if (b === '_order_no') return 1;
            return 0;
        });

        for (const key of sortedKeys) {
            const item = order.form_data[key];
            if (!item) continue;

            let label = item.label || key;
            if (key === '_order_no') label = '订单编号';

            // Skip strict internal keys if needed, but keeping generally safe

            const rawValue = item.displayValue !== undefined ? item.displayValue : (item.value !== undefined ? item.value : item);
            const value = formatValue(rawValue);

            if (value && value !== '[object Object]') {
                orderDetailsHtml += `<li style="margin-bottom: 8px;"><strong>${label}:</strong> <span style="color: #4b5563;">${value}</span></li>`;
            }
        }
        orderDetailsHtml += '</ul>';
    }

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; border-bottom: 1px solid #f3f4f6; padding-bottom: 16px; margin-bottom: 20px;">
                <h2 style="color: #059669; margin: 0;">优服佳 Fongbee Service</h2>
            </div>
            
            <div style="margin-bottom: 24px;">
                <h3 style="color: #111827;">🎉 新订单通知</h3>
                <p style="color: #374151; line-height: 1.6;">尊敬的服务商，您好！</p>
                <p style="color: #374151; line-height: 1.6;">客户已确您的报价并完成了定金支付。请尽快联系客户并按时上门服务。</p>
            </div>

            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0; color: #166534; font-weight: bold;">💰 已托管定金: $${depositAmount}</p>
                <p style="margin: 5px 0 0; color: #15803d; font-size: 13px;">(该款项已由平台托管，服务开始并经客户确认后将划入您的账户)</p>
            </div>

            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
                <h4 style="margin-top: 0; margin-bottom: 12px; color: #4b5563; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; display: inline-block;">订单详情</h4>
                ${orderDetailsHtml}
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed #d1d5db;">
                     <p style="margin: 4px 0;"><strong>订单总价:</strong> $${order.total_price || '0.00'}</p>
                     <p style="margin: 4px 0;"><strong>待付尾款:</strong> $${(order.total_price - depositAmount).toFixed(2)} (完工后支付)</p>
                </div>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:5173/provider/orders/${order.id}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">查看订单详情</a>
            </div>

            <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                &copy; ${new Date().getFullYear()} Fongbee Service.
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"优服佳订单中心" <${process.env.SMTP_USER}>`,
            to: email,
            subject,
            html
        });
        console.log(`✅ [EMAIL SENT] Provider notification sent to ${email}`);
    } catch (error) {
        console.error('❌ [EMAIL ERROR] Failed to send provider notification:', error);
        // Don't throw, just log. We don't want to rollback payment just because email failed.
    }
};
