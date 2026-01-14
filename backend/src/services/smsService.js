import twilio from 'twilio';
import dotenv from 'dotenv';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

let client;
if (accountSid && authToken && fromPhone) {
    client = twilio(accountSid, authToken);
} else {
    console.warn('Twilio credentials missing. SMS service running in Mock Mode.');
}

/**
 * Send an SMS message
 * @param {string} to - The recipient's phone number (E.164 format preferred)
 * @param {string} body - The message content
 * @returns {Promise<{success: boolean, sid?: string, error?: any}>}
 */
/**
 * Send an SMS message using a database template
 * @param {string} to - Recipient phone
 * @param {string} templateKey - Key of the template (e.g., 'provider_invite')
 * @param {object} data - Data to replace {{variables}}
 */
export const sendTemplateSMS = async (to, templateKey, data = {}) => {
    let body = '';

    // 1. Fetch Template
    if (isSupabaseConfigured()) {
        const { data: tmpl, error } = await supabaseAdmin
            .from('sms_templates')
            .select('content')
            .eq('key', templateKey)
            .single();

        if (!error && tmpl) {
            body = tmpl.content;
        } else {
            console.warn(`Template '${templateKey}' not found, falling back to raw message if provided or error.`);
        }
    }

    // 2. Interpolate Variables
    // Simple replacement: {{userName}} -> data.userName
    if (body) {
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            body = body.replace(regex, data[key] || '');
        });
    } else {
        return { success: false, error: 'Template not found' };
    }

    // 3. Send
    return await sendSMS(to, body);
};

export const sendSMS = async (to, body) => {
    // Basic validation
    if (!to || !body) {
        throw new Error('Missing "to" or "body" for SMS');
    }

    // Phone number formatting for North America (if 10 digits, prepend +1)
    let formattedTo = to.toString().replace(/\D/g, ''); // Ensure string and remove non-digits
    if (formattedTo.length === 10) {
        formattedTo = '+1' + formattedTo;
    } else if (!to.toString().startsWith('+')) {
        // If it doesn't start with +, assume it might need +1 if it's 11 digits starting with 1
        if (formattedTo.length === 11 && formattedTo.startsWith('1')) {
            formattedTo = '+' + formattedTo;
        } else {
            formattedTo = to; // Fallback to original
        }
    } else {
        formattedTo = to;
    }

    // Mock Mode
    if (!client) {
        console.log(`[Mock SMS] Sending to ${formattedTo} (original: ${to}): "${body}"`);
        return { success: true, sid: 'mock-sid-' + Date.now() };
    }

    try {
        const message = await client.messages.create({
            body,
            from: fromPhone,
            to: formattedTo
        });
        console.log(`[SMS Sent] SID: ${message.sid} to ${formattedTo} (original: ${to})`);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error('Twilio Send Error:', error);
        // Don't crash the app, just return failure
        return { success: false, error: error.message };
    }
};

/**
 * Send a verification code via SMS
 * @param {string} phone 
 * @param {string} code 
 */
export const sendVerificationSMS = async (phone, code) => {
    const body = `【优服佳】您的验证码是 ${code}，有效期为10分钟。如非本人操作，请忽略此条短信。`;
    return await sendSMS(phone, body);
};
