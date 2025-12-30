import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Helper to generate 6-digit code
const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Cached SMTP Transporter
let cachedTransporter = null;

// Create SMTP Transporter with Pooling
const createTransporter = () => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return null;
    }

    if (cachedTransporter) return cachedTransporter;

    cachedTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_SECURE === 'true',
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000
    });

    return cachedTransporter;
};

/**
 * Unified Email Sender
 * Tries Resend API first, then falls back to SMTP.
 */
const sendEmail = async ({ to, subject, html, fromName = '优服佳 Fongbee' }) => {
    // 1. Try Resend API (Recommended for Vercel/Production)
    if (process.env.RESEND_API_KEY) {
        console.log(`[Resend] Sending email to ${to}...`);
        try {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: `${fromName} <onboarding@resend.dev>`, // Default free domain
                    to,
                    subject,
                    html
                })
            });

            if (res.ok) {
                console.log(`✅ [Resend] Success: Email sent to ${to}`);
                return true;
            } else {
                const errorText = await res.text();
                console.error(`❌ [Resend] Failed: ${errorText}`);
                // Fall through to SMTP if Resend fails
            }
        } catch (error) {
            console.error(`❌ [Resend] Error:`, error);
            // Fall through to SMTP if Resend fails
        }
    }

    // 2. Fallback to SMTP
    const transporter = createTransporter();
    if (transporter) {
        try {
            await transporter.sendMail({
                from: `"${fromName}" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html
            });
            console.log(`✅ [SMTP] Success: Email sent to ${to}`);
            return true;
        } catch (error) {
            console.error(`❌ [SMTP] Error:`, error);
        }
    }

    // 3. Mock Fallback
    console.log(`⚠️ [EMAIL MOCK] No delivery possible. To: ${to}, Subject: ${subject}`);
    return false;
};

/**
 * Send Verification Code (Register/Reset Password)
 */
export const sendVerificationEmail = async (email, type) => {
    const code = generateCode();
    const actionText = type === 'register' ? '注册账号' : '重置密码';
    const subject = type === 'register' ? '【优服佳】注册验证码' : '【优服佳】重置密码验证码';

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 20px;">
                <h2 style="color: #059669; margin: 0;">优服佳 Fongbee Service</h2>
            </div>
            <div style="padding: 20px; text-align: center;">
                <p style="color: #374151; font-size: 16px; margin-bottom: 10px;">您正在进行 <strong>${actionText}</strong></p>
                <p style="color: #6b7280; font-size: 14px;">您的验证码是：</p>
                <h1 style="color: #059669; font-size: 36px; letter-spacing: 5px; margin: 20px 0; font-weight: bold;">${code}</h1>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">验证码 10 分钟内有效。如非本人操作，请忽略此邮件。</p>
            </div>
            <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                &copy; ${new Date().getFullYear()} Fongbee Service. All rights reserved.
            </div>
        </div>
    `;

    await sendEmail({ to: email, subject, html, fromName: '优服佳安全中心' });
    return code;
};

/**
 * Notify Provider when hired (Deposit paid)
 */
export const sendProviderHiredNotification = async (email, order, depositAmount) => {
    const subject = `【优服佳】恭喜！您有新的订单已确认 (单号: ${order.id.slice(0, 8)})`;

    // Simple format for form data
    let detailsHtml = '';
    if (order.form_data) {
        detailsHtml = '<div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">';
        Object.entries(order.form_data).forEach(([key, item]) => {
            const label = item.label || key;
            const val = item.displayValue || item.value || item;
            if (val && typeof val !== 'object') {
                detailsHtml += `<p style="margin: 5px 0;"><strong>${label}:</strong> ${val}</p>`;
            }
        });
        detailsHtml += '</div>';
    }

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #059669; text-align: center;">🎉 新订单通知</h2>
            <p>尊敬的服务商您好，客户已确认您的报价并完定金支付。</p>
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #bbf7d0;">
                <p style="margin: 0; color: #166534; font-weight: bold;">💰 已托管定金: $${depositAmount}</p>
            </div>
            ${detailsHtml}
            <div style="text-align: center; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px;">请登录平台查看完整详情并联系客户。</p>
            </div>
        </div>
    `;

    await sendEmail({ to: email, subject, html, fromName: '优服佳订单中心' });
};

/**
 * Invite Sales Partner (Admin Action)
 */
export const sendSalesInvitation = async (email, inviteLink) => {
    const subject = '【优服佳】诚邀您成为销售合伙人';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #059669; text-align: center;">优服佳合伙人计划</h2>
            <p>您好！我们诚挚邀请您加入我们的销售合伙人团队，共享平台增长红利。</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">立即加入并注册</a>
            </div>
            <p style="font-size: 12px; color: #9ca3af; word-break: break-all;">直接跳转链接: ${inviteLink}</p>
        </div>
    `;

    await sendEmail({ to: email, subject, html, fromName: '优服佳伙伴计划' });
};

/**
 * Invite Provider (Sales Partner Action)
 */
export const sendProviderInvitation = async (email, inviteLink, inviterName) => {
    const subject = `【优服佳】${inviterName || '合作伙伴'} 邀请您入驻成为服务商`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #059669; text-align: center;">服务商入驻邀请</h2>
            <p>您好！您的合作伙伴 <strong>${inviterName || '优服佳销售经理'}</strong> 邀请您入驻平台。</p>
            <p>入驻后即可接收海量家庭服务订单。</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">立即申请入驻</a>
            </div>
        </div>
    `;

    await sendEmail({ to: email, subject, html, fromName: '优服佳入驻管理' });
};

/**
 * Invite Regular User (Sales Partner Action)
 */
export const sendUserInvitation = async (email, inviteLink, inviterName) => {
    const subject = `【优服佳】您的朋友 ${inviterName || '邀请人'} 赠送您家庭服务体验资格`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h2 style="color: #059669; text-align: center;">优服佳服务体验邀请</h2>
            <p>您的朋友 <strong>${inviterName || '一位销售合伙人'}</strong> 向您推荐了优服佳优质家庭服务。</p>
            <p>点击注册即可享受便捷的在线预约和优质的售后保障。</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">立即领取并注册</a>
            </div>
        </div>
    `;

    await sendEmail({ to: email, subject, html, fromName: '优服佳客户中心' });
};
