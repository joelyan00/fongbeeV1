/**
 * Order Validation Middleware
 * Validates and sanitizes order-related inputs
 */
import DOMPurify from 'isomorphic-dompurify';

// Allowed currencies
const ALLOWED_CURRENCIES = ['CAD', 'USD', 'CNY', 'EUR', 'GBP', 'JPY'];

// Allowed service types
const ALLOWED_SERVICE_TYPES = ['standard', 'simple_custom', 'complex_custom'];

// Allowed order statuses
const ALLOWED_ORDER_STATUSES = [
    'created', 'auth_hold', 'cancelled', 'cancelled_by_provider',
    'cancelled_forfeit', 'captured', 'in_progress', 'pending_verification',
    'rework', 'verified', 'rated', 'completed'
];

/**
 * Validate UUID format
 */
const isValidUUID = (str) => {
    if (!str || typeof str !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
};

/**
 * Validate positive number
 */
const isPositiveNumber = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0 && isFinite(num);
};

/**
 * Validate non-negative number
 */
const isNonNegativeNumber = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && isFinite(num);
};

/**
 * Sanitize text input (remove HTML/scripts)
 */
const sanitizeText = (text) => {
    if (!text || typeof text !== 'string') return '';
    return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] }).trim();
};

/**
 * Validate order creation input
 */
export const validateCreateOrder = (req, res, next) => {
    const errors = [];
    const {
        serviceType,
        providerId,
        totalAmount,
        depositAmount,
        depositRate,
        currency,
        regretPeriodHours
    } = req.body;

    // Required: serviceType
    if (!serviceType || !ALLOWED_SERVICE_TYPES.includes(serviceType)) {
        errors.push('服务类型无效');
    }

    // Required: providerId
    if (!providerId || !isValidUUID(providerId)) {
        errors.push('服务商ID无效');
    }

    // Required: totalAmount
    if (!isPositiveNumber(totalAmount)) {
        errors.push('总金额必须大于0');
    }

    // Optional: depositAmount
    if (depositAmount !== undefined && !isNonNegativeNumber(depositAmount)) {
        errors.push('定金金额无效');
    }

    // Optional: depositRate (0-100)
    if (depositRate !== undefined) {
        const rate = parseFloat(depositRate);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            errors.push('定金比例必须在0-100之间');
        }
    }

    // Optional: currency
    if (currency && !ALLOWED_CURRENCIES.includes(currency.toUpperCase())) {
        errors.push('货币类型无效');
    }

    // Optional: regretPeriodHours (0-168, max 7 days)
    if (regretPeriodHours !== undefined) {
        const hours = parseInt(regretPeriodHours);
        if (isNaN(hours) || hours < 0 || hours > 168) {
            errors.push('反悔期时长无效 (0-168小时)');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: '输入验证失败',
            errors
        });
    }

    // Sanitize and normalize
    req.body.currency = (currency || 'CAD').toUpperCase();
    req.body.totalAmount = parseFloat(totalAmount);
    if (depositAmount !== undefined) {
        req.body.depositAmount = parseFloat(depositAmount);
    }
    if (depositRate !== undefined) {
        req.body.depositRate = parseFloat(depositRate);
    }

    next();
};

/**
 * Validate order cancellation input
 */
export const validateCancelOrder = (req, res, next) => {
    const { id } = req.params;
    const { reason, exemptRating } = req.body;

    if (!isValidUUID(id)) {
        return res.status(400).json({
            success: false,
            message: '订单ID无效'
        });
    }

    // Sanitize reason
    if (reason) {
        req.body.reason = sanitizeText(reason);
        if (req.body.reason.length > 500) {
            req.body.reason = req.body.reason.substring(0, 500);
        }
    }

    // Ensure boolean
    req.body.exemptRating = exemptRating === true;

    next();
};

/**
 * Validate verification code input
 */
export const validateVerifyCode = (req, res, next) => {
    const { id } = req.params;
    const { code } = req.body;

    if (!isValidUUID(id)) {
        return res.status(400).json({
            success: false,
            message: '订单ID无效'
        });
    }

    // Code must be 6 digits
    if (!code || !/^\d{6}$/.test(code)) {
        return res.status(400).json({
            success: false,
            message: '验证码必须是6位数字'
        });
    }

    next();
};

/**
 * Validate rating input
 */
export const validateRating = (req, res, next) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!isValidUUID(id)) {
        return res.status(400).json({
            success: false,
            message: '订单ID无效'
        });
    }

    // Rating must be 1-5
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({
            success: false,
            message: '评分必须在1-5之间'
        });
    }
    req.body.rating = ratingNum;

    // Sanitize comment
    if (comment) {
        req.body.comment = sanitizeText(comment);
        if (req.body.comment.length > 1000) {
            req.body.comment = req.body.comment.substring(0, 1000);
        }
    }

    next();
};

/**
 * Generic UUID param validator
 */
export const validateIdParam = (req, res, next) => {
    const { id } = req.params;

    if (!isValidUUID(id)) {
        return res.status(400).json({
            success: false,
            message: 'ID格式无效'
        });
    }

    next();
};

export default {
    validateCreateOrder,
    validateCancelOrder,
    validateVerifyCode,
    validateRating,
    validateIdParam
};
