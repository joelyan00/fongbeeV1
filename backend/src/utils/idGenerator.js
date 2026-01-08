/**
 * ID Generator Utility
 * Generally follows format: PREFIX-YYYYMMDD-RANDOM5
 */

const generateRandomString = (length = 5) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const getDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

/**
 * Generate User Member ID
 * Format: MEMBER-YYYYMMDD-XXXXX
 */
export const generateMemberId = () => {
    return `MEMBER-${getDateString()}-${generateRandomString()}`;
};

/**
 * Generate Standard Service ID (Permanent Identity)
 * Format: SDSV-YYYYMMDD-XXXXX
 */
export const generateServiceId = () => {
    return `SDSV-${getDateString()}-${generateRandomString()}`;
};

/**
 * Generate Service Application ID (Per Submission)
 * Format: SA-YYYYMMDD-XXXXX
 */
export const generateApplicationId = () => {
    return `SA-${getDateString()}-${generateRandomString()}`;
};
